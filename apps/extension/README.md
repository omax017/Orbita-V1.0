# Extensão Órbita (Chrome, Manifest V3)

Cadastra o custo de um SKU e dispara uma análise de concorrente direto da página do anúncio, sem abrir o painel da Órbita.

## Como carregar para testar

1. Suba o backend local (`pnpm --filter @hubwin/api dev`, com Postgres/Redis rodando — ver raiz do repo).
2. No Chrome, acesse `chrome://extensions`.
3. Ative o **"Modo do desenvolvedor"** (canto superior direito).
4. Clique em **"Carregar sem compactação"** e selecione esta pasta (`apps/extension`).
5. Clique no ícone da extensão na barra do Chrome → faça login com uma conta Órbita já cadastrada (a mesma usada no site).
6. Abra a página de um anúncio no Mercado Livre (`produto.mercadolivre.com.br/MLB-...`) — um botão flutuante "Ó" aparece no canto inferior direito.

## Por que não tem build step

A extensão é JavaScript puro (ES modules — o `background.js` usa `"type": "module"` no manifest, suportado nativamente por MV3), sem TypeScript/bundler. Decisão deliberada: manter "Carregar sem compactação" funcionando direto contra o código-fonte, sem precisar rodar um `build` antes de cada teste. Se o projeto crescer (mais telas, mais lógica), vale reconsiderar TypeScript + esbuild/vite.

## Estrutura

- `manifest.json` — declaração MV3.
- `background.js` — service worker; **único lugar que fala com a API** (ver `lib/api.js`). Content script e popup só mandam mensagens pra cá via `chrome.runtime.sendMessage`.
- `content-script.js`/`.css` — injetado nas páginas de anúncio do ML/Shopee; detecta o `externalListingId` pela URL e desenha o widget flutuante.
- `popup/` — tela que abre ao clicar no ícone da extensão (login/logout).
- `lib/api.js` — cliente HTTP com autenticação (token em `chrome.storage.local`, não cookie — a extensão não tem acesso ao cookie httpOnly do site) e renovação automática de token em `401`.

## Autenticação — por que token em vez de cookie

O site usa cookie `httpOnly` (Etapa 2) — por design, JavaScript nenhum consegue ler esse valor, nem o da extensão. Por isso `POST /auth/login`/`/register` também devolvem `tokens.accessToken`/`tokens.refreshToken` no corpo da resposta (além de continuar setando os cookies, que é o que o site usa) — só a extensão usa esse campo, guardando em `chrome.storage.local` e mandando via header `Authorization: Bearer` (`JwtStrategy` no backend aceita os dois caminhos, cookie ou header — ver `apps/api/src/auth/strategies/jwt.strategy.ts`).

## Antes de publicar de verdade (fora do escopo desta etapa)

- Trocar `API_BASE_URL` em `lib/api.js` (hoje `http://localhost:3333/api/v1`) pelo domínio de produção, e adicionar esse domínio em `host_permissions` do `manifest.json`.
- Ícone/nome/descrição prontos para a Chrome Web Store (o texto de descrição aqui é técnico, a store pede um tom mais comercial).
- Shopee: o widget já detecta anúncios da Shopee e monta o `externalListingId`, mas "Vincular" sempre vai dar `404` até o connector da Shopee existir no backend (Etapa 9 só implementou Mercado Livre).
