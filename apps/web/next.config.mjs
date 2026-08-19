/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@hubwin/types"],
  // Proxy /api/* pro backend real (NestJS) — o navegador só fala com o
  // próprio domínio do Next.js, nunca direto com o Railway/API. Isso é
  // ESSENCIAL, não só conveniência: os cookies httpOnly de sessão (Etapa 2)
  // são "host-only" por padrão — se o browser chamasse o domínio da API
  // diretamente (origem diferente da página), o cookie ficaria preso no
  // domínio da API e o servidor do Next.js (que lê o cookie da requisição
  // recebida em `lib/session.ts`) nunca o veria. Com o rewrite, a resposta
  // (incluindo Set-Cookie) chega ao browser como se tivesse vindo do próprio
  // domínio do site, então o cookie fica no lugar certo.
  async rewrites() {
    const apiUrl = process.env.API_URL ?? "http://localhost:3333";
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
