import { z } from "zod";

/**
 * Validação das variáveis de ambiente obrigatórias na inicialização.
 * Falha rápido (fail-fast) em vez de deixar o app subir mal configurado.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().optional(),
  WEB_APP_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),
  REDIS_URL: z.string().min(1, "REDIS_URL é obrigatório"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET deve ter pelo menos 16 caracteres"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_SECURE: z.coerce.boolean().default(false),

  // Criptografia dos tokens de marketplace (accessToken/refreshToken) antes
  // de gravar em MarketplaceAccount — obrigatória mesmo sem nenhuma conta
  // conectada ainda, porque TokenEncryptionService é instanciado no boot.
  TOKEN_ENCRYPTION_KEY: z
    .string()
    .refine((v) => Buffer.from(v, "base64").length === 32, {
      message: "TOKEN_ENCRYPTION_KEY deve ser uma chave base64 de 32 bytes (AES-256)",
    }),

  // Credenciais de marketplace são opcionais no boot (o .env chega com string
  // vazia, não `undefined` — por isso sem `.url()` aqui: validar formato de
  // URL bloquearia o boot com valor vazio. O formato é validado de verdade
  // quando o fluxo de conexão roda, em `MercadoLivreConnector`.
  MERCADO_LIVRE_CLIENT_ID: z.string().optional(),
  MERCADO_LIVRE_CLIENT_SECRET: z.string().optional(),
  MERCADO_LIVRE_REDIRECT_URI: z.string().optional(),

  SHOPEE_PARTNER_ID: z.string().optional(),
  SHOPEE_PARTNER_KEY: z.string().optional(),
  SHOPEE_REDIRECT_URI: z.string().optional(),
});

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `Variáveis de ambiente inválidas:\n${parsed.error.issues
        .map((i) => `- ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data;
}
