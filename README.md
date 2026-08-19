# Órbita

Plataforma SaaS de gestão de vendas para sellers de marketplace (Mercado Livre e Shopee), com foco em lucro líquido real por venda — descontando taxas, frete, imposto, custo de produto e Ads.

> Renomeada de "Hubwin" para "Órbita" — nova identidade visual (paleta índigo→ciano, tipografia Space Grotesk + Inter) para não se parecer com o concorrente direto (fundo dark + laranja + ícone de escudo). Racional completo em [`docs/identidade-visual.md`](docs/identidade-visual.md).

> Produto autoral. Não copia nome, marca, logotipo ou textos de nenhum concorrente específico.

## Estrutura do monorepo

```
hubwin/
├── apps/
│   ├── web/          # Next.js (App Router) — frontend (app/, features/)
│   └── api/           # NestJS — backend/API (módulos por domínio em src/)
├── packages/
│   ├── types/        # Tipos TypeScript compartilhados (Workspace, User, etc.)
│   └── config/       # Config compartilhada (ESLint, tsconfig base)
├── docker-compose.yml # Postgres + Redis para dev local
└── turbo.json
```

Ver [`ARCHITECTURE.md`](ARCHITECTURE.md) para a árvore completa de pastas, o mapeamento módulo de domínio → backend/frontend/sidebar, o diagrama de entidades e a abstração `MarketplaceConnector`.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts + TanStack Table/Query
- **Backend:** NestJS + PostgreSQL (Prisma) + Redis + BullMQ (filas de sincronização com Mercado Livre e Shopee)
- **Monorepo:** Turborepo + pnpm workspaces
- **Multi-tenancy:** schema compartilhado com coluna `workspaceId` em todas as tabelas de domínio (detalhes em `ARCHITECTURE.md`)

## Pré-requisitos

- Node.js ≥ 20 (veja `.nvmrc`)
- [pnpm](https://pnpm.io/) ≥ 9 — instale com `npm install -g pnpm` ou `corepack enable`
- Docker (para Postgres e Redis locais) — opcional se você já tiver instâncias próprias, **ou** sem Docker: baixe o zip portátil do Postgres em https://www.enterprisedb.com/download-postgresql-binaries, rode `initdb.exe -D .devtools/pgdata -U hubwin -A trust` e depois `pg_ctl.exe -D .devtools/pgdata -o "-p 5433" start` (ajuste `DATABASE_URL` no `.env` da API pra porta que usar). Redis não é necessário ainda — nenhum módulo consome fila hoje.

## Setup inicial

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir Postgres + Redis
docker compose up -d

# 3. Copiar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# edite apps/api/.env e troque JWT_SECRET por um valor forte (>=16 caracteres) — o app não sobe sem isso

# 4. Gerar client do Prisma
pnpm db:generate

# 5. Aplicar as migrations (já estão escritas em apps/api/prisma/migrations —
#    o comando abaixo só executa e registra no banco; se você alterar o
#    schema.prisma antes disso, prefira `pnpm db:migrate` para o Prisma
#    gerar uma nova a partir do diff)
pnpm --filter @hubwin/api prisma migrate deploy

# 6. Rodar tudo em modo dev (web + api em paralelo via Turborepo)
pnpm dev
```

- Web: http://localhost:3000 → cria conta em `/register`, cai direto no shell autenticado
- API: http://localhost:3333/api
- Health check: http://localhost:3333/api/v1/health

## Scripts principais

| Script | Descrição |
|---|---|
| `pnpm dev` | Roda web + api em modo desenvolvimento |
| `pnpm build` | Build de produção de todos os apps |
| `pnpm lint` | Lint em todos os pacotes |
| `pnpm type-check` | Checagem de tipos em todos os pacotes |
| `pnpm db:generate` | Gera o Prisma Client |
| `pnpm db:migrate` | Cria/aplica migrations do Prisma a partir do diff do schema (dev) |
| `pnpm db:studio` | Abre o Prisma Studio |

## Status

**Etapa 1 — Estrutura do projeto:** ✅ Monorepo, tema (dark + laranja), estrutura de pastas por domínio, schema Prisma completo, interface `MarketplaceConnector` + stubs ML/Shopee.

**Etapa 2 — Autenticação e casca visual:** ✅

- Cadastro/login/logout com sessão via cookies httpOnly + refresh rotativo (`apps/api/src/auth`)
- Suporte a múltiplos usuários por Workspace (papéis dono/OWNER e membro/MEMBER já modelados; convite de novos membros ainda não tem tela)
- Header fixo (breadcrumb, upgrade, notificações, tema claro/escuro, menu de conta) + sidebar recolhível com todas as seções pedidas
- Tokens de design (cor semântica incl. `--warning`, tipografia, espaçamento) em `tailwind.config.ts`/`globals.css`
- Componentes reutilizáveis: KPI Card, StatusBadge, DataTable (colunas configuráveis + export CSV), StatusTimeline, FilterPanel, EmptyState (`apps/web/components/ui`)
- Todas as ~20 rotas do sidebar navegáveis com placeholder "em construção" — sem lógica de negócio ainda

✅ **Verificado de ponta a ponta** (Node instalado, Postgres local rodando, `pnpm build`/`type-check`/`lint` limpos nos 4 pacotes): `prisma migrate deploy` aplicado num banco real, cadastro → sessão → dashboard → navegação pela sidebar → troca de tema → logout → bloqueio de rota sem sessão → login, tudo testado pelo browser. Esse processo achou e corrigiu 7 bugs reais (detalhes em [`ARCHITECTURE.md` § 7](ARCHITECTURE.md#7-verificação-e2e--bugs-encontrados-e-corrigidos)) — nenhum ficou sem corrigir.

**Etapa 3 — Dashboard (`/dashboard`):** ✅ com dados **100% mockados** (`features/dashboard/mock-data.ts`)

- Saudação personalizada + seletor de período (Hoje/7d/30d/customizado) + seletor de conta — ambos em `components/filters/`, reutilizáveis por outros módulos
- Onboarding "Cadastre seu primeiro SKU", banner de pedidos sem custo, métricas rápidas, 3 KPIs principais, insight de pico de horário, alertas inteligentes dispensáveis, produto destaque
- Gráfico de performance mensal — **desvio deliberado**: pedidos não foi para um eixo secundário (dual-axis é o erro nº1 do guia de dataviz — inventa correlação falsa); virou um mini-gráfico de barras separado, alinhado por mês. Detalhes e cores validadas contra daltonismo em [`ARCHITECTURE.md` § 8.2](ARCHITECTURE.md#82-gráfico-de-performance-mensal--desvio-deliberado-do-pedido)
- Testado pelo browser: troca de período/conta recalcula tudo de forma consistente, alerta dispensável funciona, alternância gráfico↔tabela funciona

**Etapa 4 — Pedidos (`/pedidos`):** ✅ com dados **mockados** (`features/orders/mock-data.ts`, 14 pedidos)

- Cabeçalho + "Registrar venda externa" (`Dialog` novo), resumo do período, filtros básicos + avançados (SKU, tipo de envio, canal, sem SKU, margem negativa, ordenação), seleção em massa
- `OrderCard` expansível: marketplace + conta + copiar/re-sincronizar, valor/lucro/margem, "Vincular" SKU, itens, Imprimir, breakdown "Custos da venda", `StatusTimeline` (Pronto/Em trânsito/Entregue), metadados
- **Reuso de propósito**: `ExpandableCard` e `StatRow` (novos em `components/ui/`) são genéricos — nasceram aqui pra Anúncios reaproveitar a mesma casca de card/resumo depois; o `QuickMetricsRow` do Dashboard foi refatorado pra usar o `StatRow` novo
- Testado pelo browser: filtro "margem negativa" retorna exatamente os pedidos certos, vincular SKU recalcula o card **e** o resumo agregado em cascata, breakdown de custos bate a conta, seleção em massa e venda externa funcionam. Achou e corrigiu 4 bugs reais (detalhes em [`ARCHITECTURE.md` § 9.3](ARCHITECTURE.md#93-bugs-encontrados-testando-pelo-browser))

**Etapa 5 — Anúncios (`/anuncios/*`) e Estoque (`/estoque`):** ✅ com dados **mockados**

- Schema Prisma: `Sku` ganhou `packagingCostAmount`/`stockLocal`/`stockFull`/`lowStockThreshold` (faltavam desde a Etapa 1) — migration gerada e aplicada com `prisma migrate dev` contra o Postgres real
- **Reuso confirmado**: `ListingCard` é montado sobre o mesmo `ExpandableCard` do `OrderCard` (Etapa 4), zero casca reescrita. `MOCK_SKUS`/`LinkSkuPopover`/`MarketplaceTag` viraram compartilhados (`features/catalog/`, `components/`) em vez de duplicados por módulo
- Anúncios: filtros completos + badges pedidos (status, Catálogo, posição competitiva, custo/embalagem faltando) + Vincular/Editar preço/Mais Ações; Rankeamento (small multiples com `Sparkline` novo, em vez de um gráfico com 9+ séries); Catálogos (disputa de buy box)
- Estoque: toggle Local/Full, ocultar valores, comparar por data, exportar/importar, Novo SKU (com vínculo N:N a anúncios), 4 KPIs, indicador de saúde (ruptura/crítico/baixo/saudável), abas "Meus SKUs"/"Anúncios sem SKU" usando o `DataTable` da Etapa 2 (primeira tela a usá-lo de verdade)
- Testado pelo browser — **nenhum bug de aplicação nesta etapa** (`type-check`/`lint`/`build` limpos de primeira); só um imprevisto de ambiente (Postgres local caiu no meio da sessão), documentado em [`ARCHITECTURE.md` § 10.5](ARCHITECTURE.md#105-verificação)

**Etapa 6 — Módulo Financeiro (`/financeiro/resumo`, `/financeiro/abc`, `/financeiro/dre`, `/financeiro/movimentacoes`):** ✅ com dados **mockados** (`features/finance/mock-data.ts`, 13 meses de vendas geradas sobre os mesmos `MOCK_SKUS` do catálogo)

- Resumo: filtros (período/título/SKU/status/conta) + comparação com período anterior + projeção linear do mês, 6 KPIs, gráfico de evolução diária (receita+lucro no mesmo eixo, pedidos em mini-gráfico à parte — mesmo padrão anti-dual-axis da Etapa 3) e donut de composição de custo, tabela com export CSV
- Análise ABC: toggle Receita/Quantidade/Lucro reclassifica tudo (cards de classe A/B/C, ranking, tabela); gráfico de Pareto top 20 **sem dual-axis** — barra = % individual e linha = % acumulado dividindo o mesmo eixo 0–100%, em vez do clássico barras-em-R$-vs-linha-em-% em eixos separados
- Análise DRE: navegação por mês/ano com comparação automática, toggle "Movimentações incluídas", gráfico de evolução mensal (12 meses), demonstrativo em cascata completo com exportação
- Movimentações: CRUD completo (criar/editar/excluir lançamento), 4 cards de resumo recalculados a cada alteração, importação/exportação em lote (import é mock, sem parsing real de CSV)
- **Desvio deliberado**: a ordem da cascata do DRE pedida originalmente ("(–) Custo de Anúncios" antes de "= Lucro antes de Ads") era logicamente contraditória — corrigida para `Lucro Bruto → (–) Despesas Operacionais → (–) Custos Fixos → = Lucro antes de Ads → (–) Custo de Anúncios → = LUCRO LÍQUIDO`. Detalhes em [`ARCHITECTURE.md` § 11.4](ARCHITECTURE.md#114-análise-dre)
- Testado pelo browser — **nenhum bug de aplicação nesta etapa** (`type-check`/`lint`/`build` de produção limpos de primeira nos três checkpoints). Detalhes em [`ARCHITECTURE.md` § 11.6](ARCHITECTURE.md#116-verificação)

**Etapa 7 — Publicidade (`/publicidade`) e Descobrir (`/descobrir/*`):** ✅ com dados **mockados**

- Publicidade: filtros (período/conta/SKU) + alerta de produtos com Ads sem custo vinculado, 7 KPIs (Lucro por Ads, ROI pós-Ads, Receita de Ads, Investimento, ROAS, ACoS com break-even de referência, TACoS cruzando com a receita total da loja no Financeiro), painel "Saúde dos produtos" (Lucrativo/Em risco/Prejuízo) com filtro por clique, gráfico de evolução diária, tabela ranqueada com classificação Estrela/Moderado/Risco/Prejuízo
- Descobrir: Garimpador (busca com progresso em 5 etapas, vendas do nicho, mercado endereçável, produto destaque, tendência de visitas, nuvem de palavras-chave, tabela de concorrentes), Análise de Concorrentes (link → catálogo completo do vendedor), Análise de Anúncio (link/ID → métricas individuais), Histórico (lista cronológica com reabrir — persistido via `sessionStorage` pra sobreviver à navegação entre rotas)
- **Desvio deliberado**: o pedido listava as rotas do Descobrir como `/analise/*`, mas o sidebar (Etapa 2) já usa `/descobrir/*` — mantive as rotas existentes em vez de criar uma árvore nova que deixaria os links do menu quebrados. Detalhes em [`ARCHITECTURE.md` § 12.1](ARCHITECTURE.md#121-rotas-mantive-descobrir-não-analise)
- **1 bug real encontrado e corrigido testando pelo browser**: o gerador de mock de Ads tinha uma seed que coincidentemente nunca cruzava o limiar de "roda Ads hoje", zerando um produto inteiro (o do alerta de custo faltando) — não aparecia nem na tabela nem no alerta. Corrigido com uma seed própria pra essa decisão. Detalhes em [`ARCHITECTURE.md` § 12.2](ARCHITECTURE.md#122-publicidade)
- `type-check`/`lint`/`build` de produção limpos (rodados 2× por causa do bug acima, limpos nas duas passadas)

**Etapa 8 — Configurações (`/configuracoes/*`) com abas laterais:** ✅ com dados **mockados** (exceto Perfil, que usa a sessão real)

- 9 abas, cada uma sua própria rota (`/configuracoes/perfil`, `/seguranca`, `/cobranca`, `/planos`, `/margens`, `/ia`, `/indicacao`, `/integracoes`, `/membros`), casca compartilhada em `app/(dashboard)/configuracoes/layout.tsx` com navegação lateral (`SettingsNav`)
- Perfil: nome/telefone editáveis (estado local), e-mail não editável — vem da sessão real (`getSession()`, mesma função do shell autenticado desde a Etapa 2), não é mock
- Segurança (senha/2FA/sessões ativas), Cobrança (faturas + cartão), Planos (mensal/anual, "mais popular", pacotes avulsos), Margens (2 sliders com preview colorido das faixas Ruim/Boa/Excelente + toggle de custo de antecipação), IA/MCP (explicativa, bloqueada "em breve" por plano), Indicação (link + status dos indicados), Integrações (contas conectadas com editar/sincronizar/desconectar + conectar nova conta + bloco ERP), Membros (convite + papel + remoção)
- Dois componentes novos em `components/ui/`: `Slider` e `Switch` (Radix, instalados nesta etapa)
- **1 bug real encontrado e corrigido testando pelo browser**: o botão "Copiar" da aba Indicação nunca confirmava o clique — `.catch()` encadeado fora do `?.` quebrava com `TypeError` quando `navigator.clipboard` não existe, abortando antes do `setCopied(true)`. Corrigido com `?.catch()`. Detalhes em [`ARCHITECTURE.md` § 13.4](ARCHITECTURE.md#134-bug-real-encontrado-e-corrigido-testando-pelo-browser)
- `type-check`/`lint`/`build` de produção limpos (36 rotas, rodados 2× por causa do bug acima)

**Etapa 9 — Integrações reais (backend):** 🟡 Mercado Livre implementado, **não testado contra a API real ainda** (falta credencial); Shopee fica pra próxima etapa (usuário escolheu "Mercado Livre primeiro")

- OAuth 2.0 completo (`state` assinado via JWT, troca/renovação automática de token, tokens sempre criptografados no banco — `TokenEncryptionService`, AES-256-GCM)
- Sincronização real via Orders API + Items API + Shipments API do ML, normalizando pro modelo da Etapa 1 (`Order`/`OrderItem`, resolução de SKU via `Listing`/`ListingSku`, cálculo de custo/lucro no mesmo upsert); "Billing/Fees" é a comissão (`sale_fee`) já embutida no payload do pedido — o ML não tem endpoint de taxas separado
- Fila BullMQ (`marketplace-sync`): retry exponencial (5 tentativas, 5s→80s), rate limit de ~8 req/s por Worker, `jobId` estável evita duplicar trabalho entre webhook e polling
- Webhook (`POST /integrations/mercado-livre/webhook`, responde 200 na hora, processa via fila) + polling de fallback a cada 15min (`@nestjs/schedule`) pra nenhum pedido ficar parado se uma notificação se perder
- `AlertsService` implementado de verdade (só tinha o comentário de intenção até esta etapa) — gera Alert + Notification (`MISSING_COST`, tipo novo no enum) sempre que um pedido **novo** chega com item sem SKU vinculado, idempotente por pedido
- Infra local nova: Redis portátil (mesmo padrão do Postgres, sem Docker), chave de criptografia gerada
- **Antes de implementar, perguntei quais credenciais eram necessárias** (Client ID/Secret do ML, Partner ID/Key da Shopee, URL pública pra callback/webhook) — usuário escolheu túnel ngrok pra dev e confirmou Mercado Livre primeiro. Detalhes de tudo que falta configurar em [`ARCHITECTURE.md` § 14](ARCHITECTURE.md#14-etapa-9--integrações-reais-mercado-livre)
- **Desvio sinalizado**: Netlify (escolha do usuário pra hospedagem) não sustenta o worker do BullMQ (serverless, sem processo contínuo) — serve bem pro frontend, mas o `apps/api` vai precisar de outro host (Railway/Render/Fly/VPS) na hora do deploy
- **1 bug real encontrado e corrigido testando o servidor rodando de verdade**: `WorkspaceGuard` não resolvia `WorkspacesService` — `IntegrationsModule` precisava importar `WorkspacesModule` diretamente, não bastava importar `AuthModule` (que só exporta o guard). Também corrigido um `500` genérico no endpoint `/connect` sem credenciais configuradas, trocado por um redirect com erro amigável. Detalhes em [`ARCHITECTURE.md` § 14.8](ARCHITECTURE.md#148-verificação)
- `type-check`/`lint`/`build` de produção limpos nos dois pacotes; boot real do servidor testado via HTTP (guards, redirects, tratamento de erro) — as chamadas reais à API do ML (troca de token, listar pedidos) ainda não foram exercitadas, dependem do Client ID/Secret

Próximas etapas (sugestão): preencher `MERCADO_LIVRE_CLIENT_ID`/`SECRET`/`REDIRECT_URI` no `.env` e validar o fluxo OAuth ponta a ponta contra a API real → Shopee (OAuth com assinatura HMAC + Order/Product/Logistics API) → wirear o botão "Conectar nova conta" da tela de Integrações (Etapa 8, hoje mock) no fluxo real desta etapa.

**Rebrand — "Hubwin" → "Órbita":** ✅ nova identidade visual aplicada (o core ainda não estava 100% funcionando — só o Mercado Livre não testado ao vivo — mas o usuário pediu o rebrand em paralelo)

- Nome do produto trocado de "Hubwin" para "Órbita" em todo lugar visível ao usuário (títulos de página, sidebar, telas de login/registro, README/ARCHITECTURE) — identificadores internos de código (`@hubwin/web`, `@hubwin/api`, nome da pasta) não foram tocados, é uma operação maior e fora do que "identidade visual" pede
- Paleta índigo→ciano (`#6659FF`/`#0891A6`) no lugar do laranja, tipografia Space Grotesk (títulos/KPIs) + Inter (corpo) — **remapeando os VALORES dos ~20 tokens semânticos existentes**, não criando um sistema de token novo; zero componente dos ~150 já construídos precisou ser reescrito
- Paleta de gráficos (`--chart-1..5`) revalidada do zero contra `dataviz/scripts/validate_palette.js` (mesmo rigor das Etapas 3/6/7) — os hex originais do kit falhavam separação de daltonismo entre verde e ciano; ajustados até `ALL CHECKS PASS` em claro e escuro
- **Desvio do kit**: a wordmark SVG completa (texto "órbita" fixo em preto) só funciona em fundo claro, mas a sidebar/telas de auth são escuras por padrão — usei o ícone (que tem fundo próprio) + o nome como texto de verdade, que se adapta ao tema automaticamente
- **1 bug real encontrado e corrigido testando no browser**: `next/image` rejeita SVG por padrão (`400` na rota de otimização) — o ícone da marca não carregava até eu adicionar `unoptimized` (+ `priority`, já que é acima da dobra)
- `type-check`/`lint`/`build` de produção limpos; verificado por inspeção de estilo computado no browser (não só visual) nos dois temas. Detalhes completos em [`ARCHITECTURE.md` § 15](ARCHITECTURE.md#15-rebrand--hubwin--órbita) e o racional da marca em [`docs/identidade-visual.md`](docs/identidade-visual.md)

**Backend real de Catalog + Discovery, e Extensão de navegador (Etapa 10.1):** 🟡 backend testado via HTTP; extensão construída e validada por sintaxe, **não carregada num Chrome de verdade ainda**

- Antes de construir a extensão, os endpoints que ela chamaria não existiam de verdade — implementei `CatalogController`/`Service` (CRUD real de SKU: criar, `PATCH` só o custo, vincular a um anúncio sincronizado) e `DiscoveryController`/`Service` (dispara análise, persiste em `SearchHistory` — modelo da Etapa 1 nunca usado até agora)
- Backend de auth ganhou suporte a `Authorization: Bearer` além do cookie httpOnly (extensão não tem acesso a cookie) — `login`/`register` agora também devolvem `tokens` no corpo da resposta, `refresh`/`logout` aceitam o refresh token no corpo como fallback. Cookies renomeados de `hubwin_at`/`hubwin_rt` pra `orbita_at`/`orbita_rt` (resquício do rebrand, corrigido de passagem)
- `apps/extension/` (Chrome MV3, JS puro sem bundler): popup de login, content script que detecta a página de anúncio (ML/Shopee) por regex na URL e desenha um widget flutuante com "Cadastrar custo do SKU" e "Analisar concorrência" — tudo chamando a API real construída nesta etapa
- `type-check`/`lint`/`build` do backend limpos, endpoints testados via HTTP de ponta a ponta (criar SKU, custo isolado, conflito de código, vínculo sem anúncio sincronizado → 404 explicando o motivo, disparo de análise persistindo histórico). A extensão em si teve sintaxe validada (`node --check`) mas **não foi carregada num Chrome real** — é uma mudança persistente no navegador, não fiz sozinho; instruções em [`apps/extension/README.md`](apps/extension/README.md)
- Detalhes completos em [`ARCHITECTURE.md` § 16](ARCHITECTURE.md#16-backend-real-de-catalog-e-discovery-pré-requisito-da-extensão-de-navegador) e [§ 17](ARCHITECTURE.md#17-etapa-101--extensão-de-navegador-chrome-manifest-v3)

Próximas etapas (sugestão): carregar a extensão num Chrome de verdade e testar o fluxo completo → servidor MCP somente leitura (item 2 da Etapa 10) → preencher as credenciais do Mercado Livre e validar tudo (integração + extensão) contra dados reais.
