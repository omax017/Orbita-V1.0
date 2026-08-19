import { IsOptional, IsString } from "class-validator";

/** Usado por /auth/refresh e /auth/logout. Opcional porque o site nem manda
 * esse campo (usa o cookie httpOnly) — só a extensão de navegador, que
 * guarda o refresh token em `chrome.storage` por não ter acesso ao cookie. */
export class RefreshDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
