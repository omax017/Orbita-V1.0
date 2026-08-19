import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppConfig } from "../../config/configuration";
import { ACCESS_TOKEN_COOKIE } from "../auth-cookies.util";

export interface JwtPayload {
  sub: string; // userId
}

/** Extrai o access token do cookie httpOnly — usado pelo site (Etapa 2). */
function extractFromCookie(req: Request): string | null {
  return req.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const appConfig = config.get<AppConfig>("app")!;
    super({
      // Cookie primeiro (é o caminho do site, mais comum) — cai pro header
      // `Authorization: Bearer` quando não há cookie, que é como a extensão
      // de navegador (Etapa 10) se autentica: ela não tem acesso ao cookie
      // httpOnly (por design — nenhum JS deveria ler esse valor), então guarda
      // o access token em `chrome.storage` e manda no header a cada chamada.
      jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookie, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwtSecret,
    });
  }

  // O retorno desse método é o que o Nest injeta em `request.user`.
  async validate(payload: JwtPayload) {
    return { userId: payload.sub };
  }
}
