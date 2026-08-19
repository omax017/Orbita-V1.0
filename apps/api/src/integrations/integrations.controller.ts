import { Body, Controller, Get, Headers, HttpCode, Logger, Post, Query, Res, UseGuards } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import { Response } from "express";
import { MarketplaceProvider } from "@prisma/client";
import type { AppConfig } from "../config/configuration";
import { CurrentUser, CurrentUserPayload } from "../auth/decorators/current-user.decorator";
import { CurrentWorkspace, CurrentWorkspacePayload } from "../auth/decorators/current-workspace.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../auth/guards/workspace.guard";
import { PrismaService } from "../prisma/prisma.service";
import { MarketplaceAccountsService } from "./marketplace-accounts.service";
import { MarketplaceConnectorRegistry } from "./connectors/connector-registry";
import { MARKETPLACE_SYNC_QUEUE, jobId, jobName, MarketplaceSyncJobData } from "./queues/marketplace-sync.types";

/**
 * `/integrations/mercado-livre/*` — Shopee entra numa próxima etapa com o
 * mesmo padrão (`/integrations/shopee/connect`, `/callback`, `/webhook`).
 *
 * `connect` é autenticado (o próprio usuário clica em "Conectar" na tela de
 * Integrações). `callback` e `webhook` são NECESSARIAMENTE públicos — quem
 * chama é o servidor do Mercado Livre, não o nosso frontend, então não tem
 * como mandar cookie de sessão nem header `X-Workspace-Id`. É por isso que
 * o `state` (ver `OAuthStateService`) carrega workspaceId/userId assinados.
 */
@Controller("integrations/mercado-livre")
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    private readonly accounts: MarketplaceAccountsService,
    private readonly connectors: MarketplaceConnectorRegistry,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue(MARKETPLACE_SYNC_QUEUE) private readonly queue: Queue<MarketplaceSyncJobData>,
  ) {}

  private get webAppUrl(): string {
    return this.configService.get<AppConfig>("app")!.webAppUrl;
  }

  @Get("connect")
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  connect(
    @CurrentUser() user: CurrentUserPayload,
    @CurrentWorkspace() workspace: CurrentWorkspacePayload,
    @Res() res: Response,
  ) {
    try {
      const url = this.accounts.buildAuthorizationUrl({
        workspaceId: workspace.workspaceId,
        userId: user.userId,
        provider: MarketplaceProvider.MERCADO_LIVRE,
      });
      return res.redirect(url);
    } catch (error) {
      // Só acontece com MERCADO_LIVRE_CLIENT_ID/SECRET vazios no .env (ver
      // MercadoLivreConnector.requireCredentials) — não deveria sobrar um
      // 500 cru pro usuário clicar em "Conectar" e ver uma tela quebrada.
      this.logger.error(`Falha ao montar URL de autorização do ML: ${(error as Error).message}`);
      return res.redirect(`${this.webAppUrl}/configuracoes/integracoes?integration_error=not_configured`);
    }
  }

  @Get("callback")
  async callback(@Query("code") code: string | undefined, @Query("state") state: string | undefined, @Res() res: Response) {
    const settingsUrl = `${this.webAppUrl}/configuracoes/integracoes`;

    if (!code || !state) {
      return res.redirect(`${settingsUrl}?integration_error=missing_params`);
    }

    try {
      await this.accounts.handleCallback({ provider: MarketplaceProvider.MERCADO_LIVRE, code, state });
      return res.redirect(`${settingsUrl}?integration_connected=mercado_livre`);
    } catch (error) {
      // Nunca repassa a mensagem de erro crua na URL (pode vazar detalhe
      // interno) — só um código genérico; detalhe completo vai pro log.
      this.logger.error(`Callback do ML falhou: ${(error as Error).message}`);
      return res.redirect(`${settingsUrl}?integration_error=callback_failed`);
    }
  }

  /**
   * Webhook ("Notificações") do ML. Responde 200 rápido (é o que o ML espera
   * — reenviar/desativar a notificação depois de falhas repetidas ou
   * timeout) e processa de verdade de forma assíncrona via fila, nunca
   * inline aqui.
   */
  @Post("webhook")
  @HttpCode(200)
  async webhook(@Body() payload: unknown, @Headers() headers: Record<string, string>) {
    const connector = this.connectors.get(MarketplaceProvider.MERCADO_LIVRE);
    const event = connector.parseWebhookEvent?.(payload, headers as Record<string, string>);

    if (!event) {
      this.logger.warn(`Webhook do ML ignorado (payload não reconhecido): ${JSON.stringify(payload).slice(0, 200)}`);
      return { ok: true };
    }

    if (event.topic !== "ORDER") {
      // Items/shipments chegam aqui também mas o sync de pedido já cobre o
      // que muda pro produto (Etapa 9 pediu tempo real pra PEDIDOS) —
      // ignorar por ora em vez de enfileirar trabalho sem consumidor.
      return { ok: true };
    }

    const account = await this.prisma.marketplaceAccount.findFirst({
      where: { provider: MarketplaceProvider.MERCADO_LIVRE, externalAccountId: event.externalAccountId, status: "CONNECTED" },
      select: { id: true },
    });

    if (!account) {
      this.logger.warn(`Webhook do ML pra conta não conectada (externalAccountId=${event.externalAccountId})`);
      return { ok: true };
    }

    const data: MarketplaceSyncJobData = {
      type: "SYNC_SINGLE_ORDER",
      marketplaceAccountId: account.id,
      externalOrderId: event.externalResourceId,
    };
    await this.queue.add(jobName(data), data, { jobId: jobId(data) });

    return { ok: true };
  }
}
