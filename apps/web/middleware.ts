import { NextResponse, type NextRequest } from "next/server";

/**
 * Redirecionamento leve baseado em presença de cookie — não valida a
 * assinatura do JWT (o middleware roda no Edge, sem acesso confortável ao
 * segredo/à API). A validação de verdade acontece nos guards da API
 * (`JwtAuthGuard`) e em `lib/session.ts` (Server Component); isso aqui é só
 * UX: evita mandar quem não tem sessão pro shell autenticado (e vice-versa)
 * antes de qualquer chamada à API acontecer.
 *
 * Checa o cookie de ACCESS token (`hubwin_at`, Path=/), não o de refresh
 * (`hubwin_rt`) — o refresh tem Path restrito a /api/v1/auth de propósito
 * (ver auth-cookies.util.ts no backend), então o browser nunca o anexa em
 * requisições para páginas do Next (path diferente) e o middleware nunca o
 * enxergaria. Efeito colateral aceito por ora: como ainda não existe silent-
 * refresh automático no frontend (ver ARCHITECTURE.md § 6), a sessão "expira"
 * do ponto de vista da UX depois de 15min de inatividade mesmo com o refresh
 * token (30d) ainda válido — reflete a limitação real de hoje, não esconde ela.
 */
const ACCESS_COOKIE = "hubwin_at";

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
  // Roda em tudo exceto assets estáticos, imagens e a própria API do Next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
