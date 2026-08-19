/**
 * Cliente HTTP cru da API do Mercado Livre — só monta requests/parseia
 * respostas, sem nenhuma lógica de negócio (isso fica no connector). Usa
 * `fetch` nativo (Node 20+, sem dependência extra).
 *
 * Docs: https://developers.mercadolivre.com.br/pt_br/api-docs-pt-br
 */

export const ML_AUTH_BASE = "https://auth.mercadolivre.com.br";
export const ML_API_BASE = "https://api.mercadolibre.com";

export class MercadoLivreApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "MercadoLivreApiError";
  }

  /** 401/403 do ML normalmente significa access_token expirado/revogado — quem chama decide se tenta refresh. */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** 429 = rate limit do ML — quem chama decide se faz retry com backoff. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function mlFetch<T>(
  path: string,
  options: { method?: string; accessToken?: string; body?: Record<string, unknown>; searchParams?: Record<string, string | number | undefined> } = {},
): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `${ML_API_BASE}${path}`);
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
  if (options.body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await parseJsonSafe(res);
  if (!res.ok) {
    const message = (json as { message?: string })?.message ?? `Mercado Livre API respondeu ${res.status} para ${path}`;
    throw new MercadoLivreApiError(message, res.status, json);
  }
  return json as T;
}

/** Token endpoint usa `application/x-www-form-urlencoded`, diferente do resto da API (que é JSON). */
export async function mlFetchToken<T>(body: Record<string, string>): Promise<T> {
  const res = await fetch(`${ML_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(body).toString(),
  });

  const json = await parseJsonSafe(res);
  if (!res.ok) {
    const message = (json as { message?: string })?.message ?? `Mercado Livre OAuth respondeu ${res.status}`;
    throw new MercadoLivreApiError(message, res.status, json);
  }
  return json as T;
}
