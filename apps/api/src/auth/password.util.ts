import * as bcrypt from "bcryptjs";

// bcryptjs (implementação pura em JS, sem compilação nativa) — mais simples
// de instalar em qualquer SO do que o pacote `bcrypt` nativo.
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
