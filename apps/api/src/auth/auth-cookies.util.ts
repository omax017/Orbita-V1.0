import { Response } from "express";

/**
 * Nomes e opções dos cookies httpOnly de sessão. Usamos cookies (em vez de
 * devolver o token no corpo da resposta para o front guardar em memória/
 * localStorage) para reduzir a superfície de roubo de token via XSS — o
 * JS do frontend nunca lê esses valores, só o browser os reenvia sozinho.
 *
 * `refreshCookiePath` restringe o cookie de refresh às rotas de auth: ele
 * não precisa (nem deve) ser enviado em toda requisição à API, só quando o
 * frontend chama /auth/refresh ou /auth/logout.
 */
export const ACCESS_TOKEN_COOKIE = "orbita_at";
export const REFRESH_TOKEN_COOKIE = "orbita_rt";
const REFRESH_COOKIE_PATH = "/api/v1/auth";

export interface SetAuthCookiesParams {
  accessToken: string;
  accessTokenMaxAgeMs: number;
  refreshToken: string;
  refreshTokenMaxAgeMs: number;
  cookieSecure: boolean;
}

export function setAuthCookies(res: Response, params: SetAuthCookiesParams): void {
  res.cookie(ACCESS_TOKEN_COOKIE, params.accessToken, {
    httpOnly: true,
    secure: params.cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: params.accessTokenMaxAgeMs,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, params.refreshToken, {
    httpOnly: true,
    secure: params.cookieSecure,
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: params.refreshTokenMaxAgeMs,
  });
}

export function clearAuthCookies(res: Response, cookieSecure: boolean): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/", secure: cookieSecure, sameSite: "lax" });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: REFRESH_COOKIE_PATH,
    secure: cookieSecure,
    sameSite: "lax",
  });
}
