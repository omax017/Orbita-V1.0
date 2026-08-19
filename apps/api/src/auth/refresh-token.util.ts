import { createHash, randomBytes } from "crypto";

/**
 * O refresh token que sai para o cliente é um valor opaco (random bytes);
 * só o HASH dele (SHA-256, determinístico) é gravado em `Session`. Isso
 * evita que um dump do banco permita forjar sessões — comparar hash com
 * hash ainda funciona em O(1) via índice único, sem precisar guardar o
 * valor em texto puro.
 */
export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
