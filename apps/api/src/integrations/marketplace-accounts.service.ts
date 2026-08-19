import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MarketplaceAccount, MarketplaceProvider } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AppConfig } from "../config/configuration";
import { MarketplaceConnectorRegistry } from "./connectors/connector-registry";
import type { ConnectorCredentials } from "./connectors/marketplace-connector.types";
import { TokenEncryptionService } from "./crypto/token-encryption.service";
import { OAuthStateService } from "./oauth-state.service";

function callbackPathFor(provider: MarketplaceProvider): string {
  const slug = provider === "MERCADO_LIVRE" ? "mercado-livre" : "shopee";
  return `/api/v1/integrations/${slug}/callback`;
}

function redirectUriFor(provider: MarketplaceProvider, config: AppConfig): string {
  const configured = provider === "MERCADO_LIVRE" ? config.mercadoLivre.redirectUri : config.shopee.redirectUri;
  // Se MERCADO_LIVRE_REDIRECT_URI não estiver setado, cai pra
  // `{apiBaseUrl}{callbackPath}` — útil só até o .env ser preenchido de
  // verdade; o ML/Shopee exigem a URI cadastrada bater exatamente, então em
  // produção isso SEMPRE deve vir explícito do .env.
  return configured ?? `http://localhost:${config.port}${callbackPathFor(provider)}`;
}

/**
 * Orquestra o ciclo de vida de uma `MarketplaceAccount`: iniciar OAuth,
 * processar o callback (troca code -> token, salva a conta), renovar token e
 * montar as `ConnectorCredentials` (já descriptografadas) que os serviços de
 * sincronização usam pra chamar o connector.
 */
@Injectable()
export class MarketplaceAccountsService {
  private readonly logger = new Logger(MarketplaceAccountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly connectors: MarketplaceConnectorRegistry,
    private readonly tokenEncryption: TokenEncryptionService,
    private readonly oauthState: OAuthStateService,
    private readonly configService: ConfigService,
  ) {}

  private get config(): AppConfig {
    return this.configService.get<AppConfig>("app")!;
  }

  /** Monta a URL pra onde o browser deve ser redirecionado pra iniciar o OAuth. */
  buildAuthorizationUrl(params: { workspaceId: string; userId: string; provider: MarketplaceProvider }): string {
    const connector = this.connectors.get(params.provider);
    const state = this.oauthState.sign(params);
    const redirectUri = redirectUriFor(params.provider, this.config);
    return connector.getAuthorizationUrl({ redirectUri, state });
  }

  /**
   * Processa o callback do OAuth: valida o `state`, troca o `code` pelos
   * tokens, busca dados da conta no marketplace e faz upsert em
   * `MarketplaceAccount` (criptografando os tokens antes de gravar).
   */
  async handleCallback(params: { provider: MarketplaceProvider; code: string; state: string }): Promise<MarketplaceAccount> {
    const statePayload = this.oauthState.verify(params.state);
    if (statePayload.provider !== params.provider) {
      throw new Error("state não corresponde ao provider do callback");
    }

    const connector = this.connectors.get(params.provider);
    const redirectUri = redirectUriFor(params.provider, this.config);
    const tokenResult = await connector.exchangeCodeForToken({ code: params.code, redirectUri });

    const accountInfo = await connector.fetchAccountInfo({
      accessToken: tokenResult.accessToken,
      externalAccountId: "", // ainda não sabemos o id — é isso que fetchAccountInfo descobre
    });

    const account = await this.prisma.marketplaceAccount.upsert({
      where: {
        workspaceId_provider_externalAccountId: {
          workspaceId: statePayload.workspaceId,
          provider: params.provider,
          externalAccountId: accountInfo.externalAccountId,
        },
      },
      create: {
        workspaceId: statePayload.workspaceId,
        provider: params.provider,
        externalAccountId: accountInfo.externalAccountId,
        externalAccountName: accountInfo.externalAccountName,
        status: "CONNECTED",
        accessToken: this.tokenEncryption.encryptOrNull(tokenResult.accessToken),
        refreshToken: this.tokenEncryption.encryptOrNull(tokenResult.refreshToken),
        tokenExpiresAt: tokenResult.expiresAt,
        scopes: tokenResult.scopes,
      },
      update: {
        externalAccountName: accountInfo.externalAccountName,
        status: "CONNECTED",
        accessToken: this.tokenEncryption.encryptOrNull(tokenResult.accessToken),
        refreshToken: this.tokenEncryption.encryptOrNull(tokenResult.refreshToken),
        tokenExpiresAt: tokenResult.expiresAt,
        scopes: tokenResult.scopes,
        lastSyncError: null,
      },
    });

    this.logger.log(`Conta ${params.provider} conectada: ${account.externalAccountName} (workspace ${statePayload.workspaceId})`);
    return account;
  }

  /** Renova o access token de uma conta usando o refresh token guardado. */
  async refreshToken(marketplaceAccountId: string): Promise<void> {
    const account = await this.prisma.marketplaceAccount.findUniqueOrThrow({ where: { id: marketplaceAccountId } });
    const refreshToken = this.tokenEncryption.decryptOrNull(account.refreshToken);
    if (!refreshToken) {
      await this.markError(marketplaceAccountId, "Sem refresh token salvo — a conta precisa ser reconectada.");
      return;
    }

    const connector = this.connectors.get(account.provider);
    try {
      const result = await connector.refreshAccessToken(refreshToken);
      await this.prisma.marketplaceAccount.update({
        where: { id: marketplaceAccountId },
        data: {
          accessToken: this.tokenEncryption.encryptOrNull(result.accessToken),
          // Nem todo provider devolve um refresh token novo a cada renovação
          // (ML devolve; alguns providers reusam o mesmo) — só sobrescreve
          // quando vier um novo, senão mantém o atual criptografado.
          refreshToken: result.refreshToken ? this.tokenEncryption.encryptOrNull(result.refreshToken) : account.refreshToken,
          tokenExpiresAt: result.expiresAt,
          status: "CONNECTED",
          lastSyncError: null,
        },
      });
    } catch (error) {
      await this.markError(marketplaceAccountId, `Falha ao renovar token: ${(error as Error).message}`);
      throw error;
    }
  }

  private async markError(marketplaceAccountId: string, message: string): Promise<void> {
    await this.prisma.marketplaceAccount.update({
      where: { id: marketplaceAccountId },
      data: { status: "EXPIRED", lastSyncError: message },
    });
  }

  /** Credenciais prontas pra chamar o connector (access token já descriptografado). */
  async getCredentials(marketplaceAccountId: string): Promise<{ account: MarketplaceAccount; credentials: ConnectorCredentials }> {
    const account = await this.prisma.marketplaceAccount.findUniqueOrThrow({ where: { id: marketplaceAccountId } });
    const accessToken = this.tokenEncryption.decryptOrNull(account.accessToken);
    if (!accessToken) {
      throw new Error(`MarketplaceAccount ${marketplaceAccountId} sem access token válido — reconectar a conta`);
    }
    return {
      account,
      credentials: { accessToken, externalAccountId: account.externalAccountId },
    };
  }
}
