/**
 * Configuração central da aplicação, carregada pelo @nestjs/config.
 * Mantém os módulos de negócio livres de acessar process.env diretamente.
 */
export interface AppConfig {
  env: "development" | "production" | "test";
  port: number;
  webAppUrl: string;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresInDays: number;
  cookieSecure: boolean;
  tokenEncryptionKey: string;
  mercadoLivre: {
    clientId: string | null;
    clientSecret: string | null;
    redirectUri: string | null;
  };
  shopee: {
    partnerId: string | null;
    partnerKey: string | null;
    redirectUri: string | null;
  };
}

/** "" no .env deve virar `null` (não a string vazia) pro resto do código
 * poder checar `if (!config.mercadoLivre.clientId)` de forma direta. */
function orNull(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

export default (): { app: AppConfig } => ({
  app: {
    env: (process.env.NODE_ENV as AppConfig["env"]) ?? "development",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
    webAppUrl: process.env.WEB_APP_URL ?? "http://localhost:3000",
    databaseUrl: process.env.DATABASE_URL ?? "",
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    jwtSecret: process.env.JWT_SECRET ?? "",
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    jwtRefreshExpiresInDays: process.env.JWT_REFRESH_EXPIRES_IN_DAYS
      ? Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS)
      : 30,
    cookieSecure: process.env.COOKIE_SECURE === "true",
    tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY ?? "",
    mercadoLivre: {
      clientId: orNull(process.env.MERCADO_LIVRE_CLIENT_ID),
      clientSecret: orNull(process.env.MERCADO_LIVRE_CLIENT_SECRET),
      redirectUri: orNull(process.env.MERCADO_LIVRE_REDIRECT_URI),
    },
    shopee: {
      partnerId: orNull(process.env.SHOPEE_PARTNER_ID),
      partnerKey: orNull(process.env.SHOPEE_PARTNER_KEY),
      redirectUri: orNull(process.env.SHOPEE_REDIRECT_URI),
    },
  },
});
