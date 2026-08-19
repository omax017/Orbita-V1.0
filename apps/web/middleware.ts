import { NextResponse, type NextRequest } from "next/server";

/**
 * Redirecionamento leve baseado em presença de cookie — não valida a
 * assinatura do JWT (o middleware roda no Edge, sem acesso confortável ao
 * segredo/à API). A validação de verdade acontece nos guards da API
 * (`JwtAuthGuard`) e em `lib/session.ts` (Server Component); isso aqui é só
 * UX: evita mandar quem não tem sessão pro shell autenticado (e vice-versa)
 * antes de qualquer chamada à API acontecer.
 *
 * Checa o cookie de ACCESS token (`orbita_at`, Path=/), não o de refresh
 * (`orbita_rt`) — o refresh tem Path restrito a /api/v1/auth de propósito
 * (ver auth-cookies.util.ts no backend), então o browser nunca o anexa em
 * requisições para páginas do Next (path diferente) e o middleware nunca o
 * enxergaria. Efeito colateral aceito por ora: como ainda não existe silent-
 * refresh automático no frontend (ver ARCHITECTURE.md § 6), a sessão "expira"
 * do ponto de vista da UX depois de 15min de inatividade mesmo com o refresh
 * token (30d) ainda válido — reflete a limitação real de hoje, não esconde ela.
 */
const ACCESS_COOKIE = "orbita_at";

const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ACCESS_COOKIE);
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSession && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Roda em tudo exceto assets estáticos, imagens e `/api/*` — essa última
  // exclusão é essencial: `/api/*` agora é o proxy pro backend real (ver
  // rewrites em next.config.mjs), e a própria API já faz sua autenticação
  // (guards). Sem excluir, esse middleware barrava toda chamada de API sem
  // cookie de PÁGINA (ex.: o próprio POST de login, antes de existir sessão)
  // redirecionando pra /login em vez de deixar passar pro proxy.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
