import { LandingContent } from "@/features/marketing/landing-content";

// Landing page pública (Etapa 22) — antes disso a raiz só redirecionava
// (pra /dashboard, via middleware.ts, que já manda quem não tem sessão pra
// /login antes de chegar aqui). Quem JÁ tem sessão continua nunca vendo essa
// página: o middleware redireciona `hasSession && isPublicPath` pro
// dashboard antes do Next renderizar isso.
export default function RootPage() {
  return <LandingContent />;
}
