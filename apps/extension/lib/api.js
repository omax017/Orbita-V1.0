// Cliente HTTP da extensão — só roda dentro do background service worker
// (nunca em content script) por dois motivos: (1) evita problema de CORS —
// requests do service worker com `host_permissions` declarado no manifest
// não passam pela checagem normal de CORS de página, diferente de um
// `fetch` disparado de dentro do content script; (2) mantém o access/refresh
// token fora do contexto da página do marketplace, que a extensão não
// controla (superfície de XSS menor).
//
// Autenticação: a Órbita usa cookie httpOnly pro site, mas a extensão não
// tem acesso a esse cookie (por design) — por isso o backend também devolve
// `tokens.accessToken`/`tokens.refreshToken` no corpo de login/register (ver
// apps/api/src/auth/auth.controller.ts), que a extensão guarda em
// `chrome.storage.local` e manda via header `Authorization: Bearer`.

const API_BASE_URL = "http://localhost:3333/api/v1";
const STORAGE_KEY = "orbita_session";

/** @typedef {{ accessToken: string, refreshToken: string, user: object, workspaceId: string|null }} StoredSession */

/** @returns {Promise<StoredSession|null>} */
export async function getSession() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] ?? null;
}

/** @param {StoredSession|null} session */
export async function setSession(session) {
  if (session) await chrome.storage.local.set({ [STORAGE_KEY]: session });
  else await chrome.storage.local.remove(STORAGE_KEY);
}

async function rawFetch(path, options = {}, accessToken) {
  const headers = { "Content-Type": "application/json", ...(options.headers ?? {}) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  return { ok: res.ok, status: res.status, body: json };
}

export async function login(email, password) {
  const res = await rawFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  if (!res.ok) throw new Error(res.body?.message ?? "E-mail ou senha incorretos");

  const meRes = await rawFetch("/auth/me", {}, res.body.tokens.accessToken);
  const workspaceId = meRes.body?.memberships?.[0]?.workspace?.id ?? null;

  const session = { ...res.body.tokens, user: res.body.user, workspaceId };
  await setSession(session);
  return session;
}

export async function logout() {
  const session = await getSession();
  if (session) {
    await rawFetch("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: session.refreshToken }) }).catch(() => {});
  }
  await setSession(null);
}

async function refreshSession(session) {
  const res = await rawFetch("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: session.refreshToken }) });
  if (!res.ok) {
    await setSession(null);
    throw new Error("Sessão expirada — entre novamente na extensão");
  }
  const next = { ...session, ...res.body.tokens };
  await setSession(next);
  return next;
}

/** Chamada autenticada genérica — renova o token automaticamente uma vez em
 * caso de 401 (access token expirado) antes de desistir. */
export async function apiRequest(path, options = {}) {
  let session = await getSession();
  if (!session) throw new Error("Não autenticado — abra o popup da extensão e entre com sua conta Órbita");

  const withWorkspace = { ...options, headers: { ...(options.headers ?? {}), "X-Workspace-Id": session.workspaceId ?? "" } };
  let res = await rawFetch(path, withWorkspace, session.accessToken);

  if (res.status === 401) {
    session = await refreshSession(session);
    res = await rawFetch(path, withWorkspace, session.accessToken);
  }

  if (!res.ok) throw new Error(res.body?.message ?? `Erro ${res.status} chamando ${path}`);
  return res.body;
}
