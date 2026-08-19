import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { MarketplaceProvider } from "@prisma/client";
import type { AppConfig } from "../config/configuration";

export interface OAuthStatePayload {
  purpose: "marketplace_oauth_state";
  workspaceId: string;
  userId: string;
  provider: MarketplaceProvider;
  nonce: string;
}

const STATE_EXPIRES_IN = "10m";

/**
 * O parâmetro `state` do OAuth é o ÚNICO canal disponível no callback (o ML/
 * Shopee redirecionam o browser de volta pra API sem nenhum contexto de
 * sessão do frontend) — por isso carregamos workspaceId/userId/provider
 * assinados nele, em vez de depender de guard/cookie no callback. Reusa o
 * mesmo `JWT_SECRET` da sessão (com `purpose` dedicado, pra um token de
 * sessão não poder ser reaproveitado aqui por engano).
 */
@Injectable()
export class OAuthStateService {
  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get secret(): string {
    return this.configService.get<AppConfig>("app")!.jwtSecret;
  }

  sign(params: { workspaceId: string; userId: string; provider: MarketplaceProvider }): string {
    const payload: OAuthStatePayload = { ...params, purpose: "marketplace_oauth_state", nonce: randomUUID() };
    return this.jwt.sign(payload, { secret: this.secret, expiresIn: STATE_EXPIRES_IN });
  }

  /** Lança se o `state` for inválido/expirado/adulterado — quem chama decide como responder (ex.: redirect com erro). */
  verify(state: string): OAuthStatePayload {
    const payload = this.jwt.verify<OAuthStatePayload>(state, { secret: this.secret });
    if (payload.purpose !== "marketplace_oauth_state") {
      throw new Error("state com purpose inesperado");
    }
    return payload;
  }
}
