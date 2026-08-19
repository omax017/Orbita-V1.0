import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { AppConfig } from "../../config/configuration";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recomendado para GCM (96 bits)
const AUTH_TAG_LENGTH = 16;

/**
 * Criptografa/descriptografa `accessToken`/`refreshToken` antes de gravar em
 * `MarketplaceAccount` (ver comentário no schema.prisma) — nunca persistimos
 * token de marketplace em texto puro no Postgres.
 *
 * Formato do valor armazenado: `<iv base64>:<authTag base64>:<ciphertext base64>`
 * — os três juntos numa string só pra caber numa única coluna `String?`.
 */
@Injectable()
export class TokenEncryptionService {
  private readonly logger = new Logger(TokenEncryptionService.name);
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    const config = configService.get<AppConfig>("app")!;
    this.key = Buffer.from(config.tokenEncryptionKey, "base64");
    if (this.key.length !== 32) {
      // env.validation.ts já barra isso no boot — checagem redundante de
      // propósito, pra nunca criptografar com uma chave do tamanho errado.
      throw new Error("TOKEN_ENCRYPTION_KEY inválida: precisa decodificar para 32 bytes (AES-256)");
    }
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv, { authTagLength: AUTH_TAG_LENGTH });
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
  }

  decrypt(storedValue: string): string {
    const [ivB64, authTagB64, cipherTextB64] = storedValue.split(":");
    if (!ivB64 || !authTagB64 || !cipherTextB64) {
      throw new Error("Valor criptografado em formato inesperado (esperado iv:authTag:ciphertext)");
    }
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    const cipherText = Buffer.from(cipherTextB64, "base64");

    const decipher = createDecipheriv(ALGORITHM, this.key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
    return decrypted.toString("utf8");
  }

  /** `null`/`undefined` passam direto — conveniência pra chamar em campos opcionais sem `if` no call site. */
  encryptOrNull(plainText: string | null | undefined): string | null {
    if (!plainText) return null;
    try {
      return this.encrypt(plainText);
    } catch (error) {
      this.logger.error("Falha ao criptografar token", error as Error);
      throw error;
    }
  }

  decryptOrNull(storedValue: string | null | undefined): string | null {
    if (!storedValue) return null;
    try {
      return this.decrypt(storedValue);
    } catch (error) {
      this.logger.error("Falha ao descriptografar token — valor corrompido ou TOKEN_ENCRYPTION_KEY trocada", error as Error);
      return null;
    }
  }
}
