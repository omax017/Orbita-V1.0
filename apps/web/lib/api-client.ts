export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Wrapper fino sobre `fetch` para chamadas client-side à API NestJS.
 * Caminho SEMPRE relativo (`/api/v1...`, nunca uma URL absoluta pra API) —
 * o `rewrites()` do `next.config.mjs` proxya isso pro backend de verdade.
 * Ver o comentário lá pra entender por quê isso importa pro cookie de sessão
 * funcionar em produção (frontend e backend em domínios diferentes).
 * `credentials: "include"` continua necessário pro browser enviar/receber o
 * cookie httpOnly nessa chamada same-origin.
 *
 * `workspaceId` manda o header `X-Workspace-Id`, exigido por qualquer rota
 * atrás de `WorkspaceGuard` no backend — passe sempre que a chamada for pra
 * um recurso escopado por workspace (praticamente tudo, exceto /auth/*).
 */
export async function apiFetch<T>(path: string, init?: RequestInit & { workspaceId?: string }): Promise<T> {
  const { workspaceId, ...rest } = init ?? {};
  const res = await fetch(`/api/v1${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(workspaceId ? { "X-Workspace-Id": workspaceId } : {}),
      ...rest.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? `Erro ${res.status}`, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
