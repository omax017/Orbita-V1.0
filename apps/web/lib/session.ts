import "server-only";
import { cookies } from "next/headers";
import type { MeResponse } from "./auth/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/**
 * Busca a sessão no servidor (Server Component), repassando os cookies da
 * requisição original para a API NestJS — é assim que `GET /auth/me`
 * enxerga o cookie httpOnly do usuário numa chamada servidor-a-servidor.
 * Retorna `null` quando não autenticado (o layout decide redirecionar).
 */
export async function getSession(): Promise<MeResponse | null> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}
