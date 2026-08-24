# Arquitetura — Órbita

Este documento é a referência de arquitetura de pastas, modelagem de dados, autenticação e design system da Órbita (renomeada de "Hubwin" — ver seção final sobre a identidade visual). Etapas anteriores a essa mudança mencionam "Hubwin" no texto — é o nome do produto no momento em que cada etapa foi escrita, mantido como registro histórico.

- **Etapa 1:** fundação de dados + arquitetura de pastas (seções 1–4).
- **Etapa 2:** autenticação (sessão via cookies httpOnly) + casca visual (header/sidebar) + componentes de UI reutilizáveis (seção 5), **verificada de ponta a ponta contra um Postgres real e pelo browser** (seção 7 — 7 bugs achados e corrigidos). Lógica de negócio das páginas em si (Pedidos, Financeiro, etc.) ainda **não** existe — todas renderizam um placeholder "em construção".
- **Etapa 3:** tela de Dashboard completa (`/dashboard`), com **dados 100% mockados** (seção 8) — ainda sem conexão com Order/OrderItem/Sku reais.
- **Etapa 4:** tela de Pedidos completa (`/pedidos`), também com **dados mockados** (seção 9). `ExpandableCard` e `StatRow` (`components/ui`) nasceram aqui como primitivos genéricos, de propósito, pro módulo de Anúncios (etapa futura) reaproveitar a mesma casca de card/resumo.
- **Etapa 5:** Anúncios (`/anuncios/listagem` + `rankeamento` + `catalogos`) e Estoque (`/estoque`), seção 10. `ExpandableCard`/`StatRow` foram reaproveitados de verdade (não reescritos); `MOCK_SKUS` virou fonte única em `features/catalog`; schema Prisma ganhou campos de estoque (`stockLocal`, `stockFull`, `packagingCostAmount`, `lowStockThreshold`) que não existiam.

## 1. Estrutura do monorepo

```
hubwin/
├── apps/
│   ├── web/                        # Next.js (App Router) — frontend
│   │   ├── middleware.ts            # redireciona por presença do cookie de sessão
│   │   ├── app/
│   │   │   ├── (auth)/              # login/registro — sem sidebar/header
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   └── (dashboard)/        # route group da área autenticada (layout.tsx = AppShell real)
│   │   │       ├── dashboard/
│   │   │       ├── pedidos/
│   │   │       ├── anuncios/{listagem,rankeamento,catalogos}/
│   │   │       ├── estoque/
│   │   │       ├── financeiro/{resumo,abc,dre,movimentacoes}/
│   │   │       ├── publicidade/
│   │   │       ├── descobrir/{garimpador,concorrentes,analise-anuncio,historico}/
│   │   │       ├── configuracoes/{integracoes,planos,membros}/
│   │   │       ├── suporte/
│   │   │       └── central-ajuda/
│   │   │       (todas as páginas acima renderizam <PlaceholderPage/> — sem lógica de negócio ainda)
│   │   ├── components/
│   │   │   ├── ui/                  # primitivos reutilizáveis (seção 5.3)
│   │   │   ├── layout/              # Sidebar, Header, AccountMenu, Breadcrumb...
│   │   │   └── auth/                # LoginForm, RegisterForm
│   │   ├── lib/
│   │   │   ├── session.ts           # getSession() — Server Component, repassa cookies p/ API
│   │   │   ├── api-client.ts        # fetch wrapper (credentials: include)
│   │   │   └── auth/                # api.ts (login/register/logout/me), schemas.ts (zod)
│   │   └── features/               # código de domínio do frontend (api client, hooks, componentes)
│   │       ├── auth/
│   │       ├── workspaces/
│   │       ├── billing/
│   │       ├── integrations/
│   │       ├── orders/
│   │       ├── catalog/
│   │       ├── listings/
│   │       ├── finance/
│   │       ├── ads/
│   │       ├── discovery/
│   │       └── alerts/
│   │
│   └── api/                        # NestJS — backend/API
│       └── src/
│           ├── config/              # ConfigModule + validação de env (zod)
│           ├── prisma/              # PrismaService/PrismaModule (global)
│           ├── health/              # health check (/api/v1/health)
│           ├── auth/                 # cadastro/login/refresh/logout — implementado (seção 5.1)
│           │   ├── dto/, guards/, decorators/, strategies/
│           │   └── auth.service.ts, auth.controller.ts, auth-cookies.util.ts, ...
│           ├── workspaces/           # Workspace + Membership (equipe) + slugify/geração de slug único
│           ├── billing/              # Plan + Subscription + UsageCounter
│           ├── integrations/         # MarketplaceConnector + connectors por provider
│           │   └── connectors/
│           │       ├── marketplace-connector.interface.ts
│           │       ├── marketplace-connector.types.ts
│           │       ├── connector-registry.ts
│           │       ├── mercado-livre/
│           │       └── shopee/
│           ├── catalog/              # Sku (Produto/Estoque) + ListingSku
│           ├── listings/             # Listing (Anúncio)
│           ├── orders/               # Order + OrderItem
│           ├── finance/              # FinancialMovement (Resumo/ABC/DRE/Movimentações)
│           ├── ads/                  # AdCampaign + AdMetricDaily
│           ├── discovery/            # SearchHistory
│           └── alerts/               # Alert + Notification
│
├── packages/
│   ├── types/                       # tipos TS compartilhados (Workspace, User, etc.)
│   └── config/                      # tsconfig base + preset ESLint compartilhado
│
├── docker-compose.yml                # Postgres + Redis para dev local
└── turbo.json
```

**Mapeamento módulo de domínio → pastas** (a mesma lista em três lugares — backend, frontend e sidebar — de propósito, para nunca ficar em dúvida de onde um código de determinada área do produto deve morar):

| Seção do produto | `apps/api/src/*` | `apps/web/features/*` | `apps/web/app/(dashboard)/*` |
|---|---|---|---|
| Dashboard | (agrega orders/finance/ads) | — | `dashboard/` |
| Pedidos | `orders/` | `orders/` | `pedidos/` |
| Anúncios | `listings/` | `listings/` | `anuncios/` |
| Estoque | `catalog/` | `catalog/` | `estoque/` |
| Financeiro | `finance/` | `finance/` | `financeiro/` |
| Publicidade | `ads/` | `ads/` | `publicidade/` |
| Descobrir | `discovery/` | `discovery/` | `descobrir/` |
| Configurações → Integrações | `integrations/` | `integrations/` | `configuracoes/integracoes/` |
| Configurações → Planos | `billing/` | `billing/` | `configuracoes/planos/` |
| Configurações → Membros | `workspaces/` | `workspaces/` | `configuracoes/membros/` |
| (auth, fora do shell) | `auth/` | `auth/` | fora de `(dashboard)` |
| (transversal) | `alerts/` | `alerts/` | sino no header, sem rota própria |

> `auth`, `workspaces`, `billing` e `alerts` não estavam na sua lista original de domínios — adicionei porque a modelagem de dados pedida (User com auth, Plan/Subscription/UsageCounter, Alert/Notification) precisa de um lugar para a lógica correspondente morar. Se preferir, dá para dobrar `billing` dentro de `workspaces` e `alerts` dentro de qualquer outro módulo — mantive separados por responsabilidade única.

## 2. Modelagem de dados

Schema completo em [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma); migration inicial em [`apps/api/prisma/migrations/20260818120000_init/migration.sql`](apps/api/prisma/migrations/20260818120000_init/migration.sql).

### 2.1 Estratégia de multi-tenancy

Schema compartilhado (shared schema) — toda tabela de domínio tem `workspaceId` + `@@index([workspaceId])`. Em tabelas analíticas de alto volume (`OrderItem`, `AdMetricDaily`) o `workspaceId` é **denormalizado** (duplicado do registro pai) de propósito, para agregações de relatório (Resumo/ABC/DRE) não precisarem de JOIN. Isso é intencional, não uma inconsistência a "corrigir" depois.

### 2.2 Diagrama de entidades

```mermaid
erDiagram
    Workspace ||--o{ Membership : "tem"
    Workspace ||--o{ MarketplaceAccount : "conecta"
    Workspace ||--o{ Sku : "cadastra"
    Workspace ||--o{ Listing : "possui"
    Workspace ||--o{ Order : "recebe"
    Workspace ||--o{ AdCampaign : "roda"
    Workspace ||--o{ FinancialMovement : "registra"
    Workspace ||--o{ Alert : "gera"
    Workspace ||--o{ SearchHistory : "pesquisa"
    Workspace ||--o{ Subscription : "assina"

    User ||--o{ Membership : "participa"
    User ||--o{ Notification : "recebe"

    MarketplaceAccount ||--o{ Listing : "hospeda"
    MarketplaceAccount ||--o{ Order : "origina"
    MarketplaceAccount ||--o{ AdCampaign : "anuncia"

    Listing }o--o{ Sku : "ListingSku (N:N)"
    Sku ||--o{ OrderItem : "vendido como"
    Listing ||--o{ OrderItem : "vendido via"
    Order ||--o{ OrderItem : "contém"

    AdCampaign ||--o{ AdMetricDaily : "mede"

    Alert ||--o{ Notification : "notifica"
    Plan ||--o{ Subscription : "assinado em"
```

### 2.3 Entidades e responsabilidade

| Entidade | Responsabilidade |
|---|---|
| `Workspace` | Conta/loja do seller — raiz do multi-tenancy |
| `User` / `Membership` | Usuário e seu papel (`Role`) dentro de um Workspace |
| `MarketplaceAccount` | Conta ML/Shopee conectada via OAuth a um Workspace |
| `Sku` | Produto interno do seller — dono do **custo** usado no cálculo de lucro. Ganhou na Etapa 5: `packagingCostAmount` (custo de embalagem, separado do custo do produto), `stockLocal`/`stockFull` (estoque próprio vs. em posse do marketplace) e `lowStockThreshold` (limite pra alerta de estoque baixo, por SKU) |
| `Listing` | Anúncio publicado num marketplace |
| `ListingSku` | Join N:N entre `Listing` e `Sku` (suporta variações) |
| `Order` / `OrderItem` | Pedido sincronizado e seus itens, com snapshot de custo/lucro |
| `AdCampaign` / `AdMetricDaily` | Campanha de Ads e suas métricas diárias |
| `FinancialMovement` | Lançamento financeiro (receita, taxa, frete, imposto, Ads, manual) — base do DRE |
| `Alert` / `Notification` | Condição detectada pelo sistema e sua entrega a usuários/canais |
| `SearchHistory` | Histórico de pesquisas do módulo Descobrir |
| `Plan` / `Subscription` / `UsageCounter` | Catálogo de planos, assinatura do Workspace e contadores de uso para feature gates |
| `Session` | Par de tokens de uma sessão de login (ver seção 5.1) — adicionada na Etapa 2 |

### 2.4 Decisões de modelagem que valem registrar

- **Custo histórico:** `OrderItem.unitCostAmount` é um *snapshot* do `Sku.costAmount` no momento da venda — nunca recalculado retroativamente, para o DRE de um mês passado não mudar quando o custo do produto for atualizado hoje.
- **CTR/ACOS/ROAS não são armazenados** — são derivados em tempo de consulta a partir de `impressions`/`clicks`/`spendAmount`/`attributedRevenue`. Evita métricas derivadas ficarem desatualizadas se a fórmula mudar.
- **Referências polimórficas** (`FinancialMovement.referenceId`, `Alert.referenceId`) não têm FK de banco — o `referenceType` indica a tabela de destino. Integridade garantida na camada de aplicação, não no Postgres.
- **`ListingSku.variationExternalId`** usa `""` como valor "sem variação" em vez de `null`, porque o Postgres trata cada `NULL` como distinto em constraints `UNIQUE` (múltiplos `null` não seriam bloqueados como duplicata).
- **`Subscription`** não tem `@@unique` garantindo uma única assinatura `ACTIVE` por Workspace — Prisma não expressa unique index parcial (`WHERE status = 'ACTIVE'`) nativamente. Se precisar, isso é uma migration manual depois (`CREATE UNIQUE INDEX ... WHERE ...`).

## 3. `MarketplaceConnector` — abstração de marketplace

Ver [`apps/api/src/integrations/connectors/marketplace-connector.interface.ts`](apps/api/src/integrations/connectors/marketplace-connector.interface.ts).

```mermaid
flowchart LR
    subgraph Domínio
        O[OrdersModule]
        L[ListingsModule]
        A[AdsModule]
    end
    R[MarketplaceConnectorRegistry]
    subgraph Connectors
        ML[MercadoLivreConnector]
        SH[ShopeeConnector]
        NX[".. próximo marketplace"]
    end

    O -->|registry.get(provider)| R
    L -->|registry.get(provider)| R
    A -->|registry.get(provider)| R
    R --> ML
    R --> SH
    R -.-> NX
```

Regra de ouro: **nenhum módulo de domínio importa `MercadoLivreConnector` ou `ShopeeConnector` diretamente.** Sempre passam pelo `MarketplaceConnectorRegistry`, pedindo o connector pelo enum `MarketplaceProvider`. Para plugar um marketplace novo:

1. Criar `apps/api/src/integrations/connectors/<novo-marketplace>/`.
2. Implementar a interface `MarketplaceConnector` (métodos de OAuth + listagem normalizada de pedidos/anúncios/campanhas).
3. Registrar a classe em `integrations.module.ts`.

Nenhum outro módulo precisa mudar — é exatamente o ponto da abstração.

## 4. Módulos de domínio ainda vazios

`orders`, `catalog`, `listings`, `finance`, `ads`, `discovery`, `alerts`, `billing` continuam `@Module({})` — só a fundação (seções 1–3). A Etapa 2 implementou de verdade apenas `auth` e o essencial de `workspaces` (ver seção 5).

## 5. Etapa 2 — Autenticação e casca visual

### 5.1 Autenticação e sessão

Sessão via **cookies httpOnly** (não localStorage/Authorization header) — o JS do frontend nunca lê o token, reduzindo a superfície de roubo via XSS.

```mermaid
sequenceDiagram
    participant Browser
    participant Web as Next.js (web:3000)
    participant Api as NestJS (api:3333)
    participant DB as Postgres

    Browser->>Web: POST /login (form)
    Web->>Api: POST /api/v1/auth/login (credentials: include)
    Api->>DB: valida hash da senha (bcryptjs)
    Api->>DB: cria Session (hash do refresh token)
    Api-->>Web: Set-Cookie hubwin_at (15min) + hubwin_rt (30d, path /auth)
    Web-->>Browser: redirect /dashboard

    Browser->>Web: GET /dashboard
    Web->>Api: GET /api/v1/auth/me (Cookie: hubwin_at) [server-to-server, lib/session.ts]
    Api-->>Web: { user, memberships }
    Web-->>Browser: AppShell renderizado com sessão
```

- **Cadastro (`POST /auth/register`):** cria `User` + `Workspace` + `Membership(role=OWNER)` numa transação — toda conta nasce dona de um workspace. Convidar outros membros (`role=MEMBER`) é lógica de página futura ("Configurações → Membros"), fora do escopo desta etapa.
- **Access token:** JWT assinado (`JWT_SECRET`), 15 min, cookie `hubwin_at`, path `/`.
- **Refresh token:** valor opaco (random bytes) — só o hash SHA-256 fica no banco (`Session.refreshTokenHash`). Cookie `hubwin_rt`, 30 dias, path restrito a `/api/v1/auth` (não trafega em toda requisição). `POST /auth/refresh` rotaciona: revoga a sessão atual e emite um par novo.
- **Multi-workspace:** um `User` pode ter várias `Membership` (ex.: agência). O workspace "atual" de uma requisição é resolvido pelo header `X-Workspace-Id` + `WorkspaceGuard` (confirma Membership ativa) — hoje o frontend sempre usa `memberships[0]`.
- **Guards/decorators reutilizáveis** (`apps/api/src/auth/guards`, `.../decorators`) prontos para os módulos de domínio usarem quando ganharem lógica de negócio: `JwtAuthGuard`, `WorkspaceGuard`, `RolesGuard` + `@CurrentUser()`, `@CurrentWorkspace()`, `@Roles(Role.OWNER)`.
- **Frontend:** `middleware.ts` redireciona por *presença* do cookie `hubwin_rt` (heurística de UX, roda no Edge sem validar assinatura); `lib/session.ts` (`getSession()`) é quem valida de verdade — chama `GET /auth/me` a partir do Server Component do layout, repassando os cookies da requisição original.

### 5.2 Casca visual (`AppShell`)

`components/layout/app-shell.tsx` monta `Sidebar` + `Header` num **flex row simples** (não dois elementos `fixed` independentes) — a sidebar recolhida muda de largura sem o Header precisar saber esse valor, porque ele é só o filho vizinho que ocupa o espaço restante.

- **Sidebar** (`sidebar.tsx` + `sidebar-nav-data.ts`): recolhível (ícone-only + tooltip), 3 seções (Gerenciar/Descobrir/Ajuda e Configurações) + item "Dashboard" pinado no topo (não pedido explicitamente — adicionei porque o produto sempre teve Dashboard como página inicial). Submenus (Anúncios, Financeiro) usam `Collapsible` e abrem sozinhos quando uma rota filha está ativa.
- **Header** (`header.tsx`): breadcrumb (`breadcrumb.tsx`, mapeia pathname → labels da própria `sidebar-nav-data`) à esquerda; botão de upgrade, `NotificationBell` (dropdown vazio — Alert/Notification não tem lógica ainda), `ThemeToggle` (next-themes) e `AccountMenu` (avatar + dropdown com dados do usuário/workspace/role + logout) à direita.
- Todas as ~20 rotas em `app/(dashboard)/**` têm um `page.tsx` real (não só pasta) renderizando `<PlaceholderPage/>` — prova que a navegação da sidebar/breadcrumb funciona ponta a ponta sem precisar de dados reais.

### 5.3 Componentes de UI (`components/ui/`)

| Componente | Arquivo | Observação |
|---|---|---|
| KPI Card | `kpi-card.tsx` | ícone + label + valor + chip de variação % + link de ação opcional |
| Badge / StatusBadge | `badge.tsx`, `status-badge.tsx` | `StatusBadge` tem `tone` semântico (success/warning/destructive/info/neutral) + bolinha |
| Tabela densa | `data-table.tsx` | TanStack Table: colunas mostrar/ocultar (dropdown), ordenação, paginação, exportação CSV (`lib/export-csv.ts`) |
| Timeline horizontal | `status-timeline.tsx` | bolinhas conectadas, com estado de erro (ex.: pedido cancelado) |
| Painel de filtros | `filter-panel.tsx` | "Filtros avançados" colapsável, badge de contagem de filtros ativos |
| Estado vazio | `empty-state.tsx` | ícone + título + descrição + CTA — também usado por `PlaceholderPage` e pelo estado "sem resultados" do `DataTable` |

Primitivos de apoio (padrão shadcn/ui, sobre Radix): `button`, `input`, `label`, `separator`, `avatar`, `dropdown-menu`, `collapsible`, `tooltip`, `checkbox`.

### 5.4 Tokens de design

Cor semântica (`app/globals.css`, tokens HSL para `.dark`/`:root`, ver comentário no topo do arquivo):

| Token | Uso |
|---|---|
| `--primary` (laranja) | marca / ação principal |
| `--success` (verde) | valores positivos / lucro |
| `--destructive` (vermelho) | valores negativos / erro / alerta crítico |
| `--warning` (âmbar) | aviso / atenção — **novo na Etapa 2** |

Tipografia: `--font-inter` (next/font/google) conectado em `tailwind.config.ts` como `fontFamily.sans` — **bug da Etapa 1 corrigido aqui**: a fonte estava carregada mas nunca conectada ao Tailwind, então `font-sans` renderizava a stack padrão do sistema, não a Inter. Espaçamento nomeado: `spacing.sidebar` (16rem), `spacing.sidebar-collapsed` (4.5rem), `spacing.header` (3.75rem) — evita repetir esses valores em cada componente do shell.

## 6. O que falta (fora do escopo desta etapa)

- Implementação real dos connectors ML/Shopee (continuam stubs).
- Lógica de negócio dentro dos módulos de domínio (`orders`, `catalog`, `listings`, `finance`, `ads`, `discovery`, `alerts`, `billing`).
- Convite de novos membros a um workspace (endpoint + tela em "Configurações → Membros").
- Reconciliar `packages/types` com os tipos de resposta da API de auth (`lib/auth/api.ts` no frontend define `SafeUser`/`WorkspaceSummary` próprios em vez de reaproveitar `@hubwin/types` — divergência pequena, deliberada por tempo, mas vale unificar).
- Seed de dados (`Plan` FREE/STARTER/PRO/ENTERPRISE, workspace de demonstração).
- **Silent refresh automático:** hoje, se o access token (15min) expira, a única forma de continuar é logar de novo — não existe um interceptor no frontend que chame `POST /auth/refresh` automaticamente ao tomar 401. O middleware já reflete essa limitação de propósito (ver comentário em `middleware.ts`).

## 7. Verificação E2E — bugs encontrados e corrigidos

Depois que o Node foi instalado nesta máquina, rodamos a bateria completa: `pnpm install` → `prisma validate`/`generate` → diff do SQL gerado pelo Prisma contra as migrations escritas à mão → `type-check`/`lint`/`build` nos 4 pacotes → Postgres local real (sem Docker disponível, usamos o zip portátil do PostgreSQL 16 em `.devtools/`, fora do git) → `prisma migrate deploy` num banco de verdade → fluxo completo pelo browser (cadastro, sessão, navegação, tema, logout, bloqueio de rota, login). Cada bug abaixo só apareceu numa dessas checagens — nenhum teria sido pego só lendo o código:

| # | Onde | Bug | Como foi pego |
|---|---|---|---|
| 1 | `schema.prisma` (migration) | `scopes String[]` sem `@default` **não** vira `NOT NULL DEFAULT ARRAY[]::TEXT[]` no Postgres — vira coluna nullable sem default | diff do SQL gerado pelo Prisma vs. migration escrita à mão |
| 2 | `apps/api` deps | Faltava `@types/express` (usado por `Request`/`Response` em `auth.controller.ts`, `jwt.strategy.ts`) | `tsc --noEmit` |
| 3 | `auth.service.ts` | Lookup em `Record<string,number>` com `noUncheckedIndexedAccess` retorna `number \| undefined` mesmo com a chave garantida por construção | `tsc --noEmit` |
| 4 | `health/prisma.health.ts` | `HealthIndicatorService` não é exportado por `@nestjs/terminus` nesta versão — mas existe um `PrismaHealthIndicator` nativo que eu não sabia que tinha (troquei o indicador customizado pelo nativo) | `tsc --noEmit` |
| 5 | `apps/api/.eslintrc.cjs` | `extends: ["@hubwin/config"]` não resolve — ESLint só resolve nome de pacote no padrão `eslint-config-*`; precisa ser caminho relativo | `pnpm lint` |
| 6 | `register-form.tsx` | Enviava `confirmPassword` (campo só de validação client-side) para a API, que rejeita com `forbidNonWhitelisted` | teste manual de cadastro no browser — erro **"property confirmPassword should not exist"** |
| 7 | `middleware.ts` | Checava o cookie `hubwin_rt` (refresh), mas esse cookie tem `Path=/api/v1/auth` de propósito — o browser nunca o envia em requisições para páginas do Next, então o middleware nunca via a sessão e redirecionava pro `/login` mesmo logado. Trocado para checar `hubwin_at` (access, `Path=/`) | teste manual: cadastro funcionou na API mas o redirect pro `/dashboard` voltava pro `/login` |

Depois dos 7 fixes: cadastro → dashboard → expandir submenu → menu de conta (mostrando "Maria Silva", "Loja da Maria", "Dono") → trocar tema (confirmado via `getComputedStyle`, fundo mudou de escuro para `rgb(255, 255, 255)`) → logout → tentativa de acessar `/financeiro/dre` sem sessão (bloqueado, voltou pro `/login`) → login de novo — tudo funcionando.

## 8. Etapa 3 — Dashboard (`/dashboard`)

Todos os dados desta tela são **mockados** em [`features/dashboard/mock-data.ts`](apps/web/features/dashboard/mock-data.ts) — nenhuma chamada à API além de `GET /auth/me` (pro nome do usuário na saudação). A conexão com `Order`/`OrderItem`/`Sku` reais é trabalho de uma etapa futura (integrações).

### 8.1 Composição da tela

`features/dashboard/dashboard-content.tsx` (client component) orquestra:

- Saudação (nome + data, calculados client-side) + `PeriodSelector`/`AccountSelector` (`components/filters/` — **compartilhados**, não específicos do dashboard, porque Financeiro/Pedidos/Ads vão precisar do mesmo filtro depois — ver `interaction.md` do skill de dataviz: "filtros são UI padrão, uma linha só, acima de tudo que escopam").
- `OnboardingSkuCard` — só aparece com `MOCK_HAS_SKUS = false` (mock-data.ts). Flip pra `true` pra simular workspace com produtos já cadastrados.
- `MissingCostBanner` — aparece sempre que `ordersMissingCost.count > 0` (sempre no mock atual).
- `QuickMetricsRow`, 3× `KpiCard` (reaproveitado da Etapa 2), `PeakHourInsight`, `SmartAlertsPanel` (dispensável — estado local, `Set` de ids dispensados), `FeaturedProductCard`, `PerformanceChart`.
- Trocar período/conta recalcula tudo via `useMemo` — números escalam de forma consistente (testado: conta ML sozinha = ~66% dos totais "todas as contas").

### 8.2 Gráfico de performance mensal — **desvio deliberado do pedido**

Você pediu "linha dupla: faturamento e lucro, **com pedidos em eixo secundário**". Não implementei eixo secundário — é o erro nº1 do guia de dataviz interno (`anti-patterns.md`): dois y-scales diferentes na mesma área de plotagem inventam uma correlação visual que não existe nos dados (o alinhamento dos dois eixos é arbitrário). Em vez disso:

- Faturamento e lucro dividem o **mesmo** eixo (os dois são R$ — isso nunca foi um caso de eixo duplo de verdade).
- Pedidos virou um **mini-gráfico de barras separado**, logo abaixo, alinhado pelo mesmo eixo X (mês) — mesma informação, sem inventar correlação.

Também rodei o validador de paleta do skill (`validate_palette.js`) nas cores do gráfico e achei um problema real: `--chart-1`/`--chart-4` em dark mode estavam claras demais (fora da faixa OKLCH exigida) e com separação de daltonismo no limite. Reajustei os dois tokens em `globals.css` (ver comentário lá) — `--chart-2/3/5` continuam **não validadas**, não usá-las sem reajustar primeiro.

Todo gráfico tem par em tabela (botão "Ver como tabela") — é o requisito de acessibilidade do skill ("todo gráfico tem uma versão em tabela, o par WCAG-limpo dele").

### 8.3 Verificação

Testado pelo browser após subir os servidores (mesma sessão da Etapa 2): cadastro/login, saudação com nome real, onboarding card, banner de custo faltante, os 3 KPIs, troca de período (Hoje → todos os números recalculam e ficam consistentes entre si), troca de conta (ML sozinha = 66% dos totais, batendo com `accountFactor`), dispensar 1 de 3 alertas (persiste os outros 2), alternar gráfico ↔ tabela, cores das linhas confirmadas via DOM (`stroke` = `hsl(var(--chart-1))`/`hsl(var(--chart-4))`).

## 9. Etapa 4 — Pedidos (`/pedidos`)

Dados mockados em [`features/orders/mock-data.ts`](apps/web/features/orders/mock-data.ts) (14 pedidos escritos à mão, cobrindo os 7 status, os 2 marketplaces + venda externa, pedidos sem custo e com margem negativa). `features/orders/types.ts` espelha `OrderStatus` do Prisma e centraliza `computeOrderFinancials()` (lucro/margem a partir de valor/taxa/frete/imposto/custo — usada por todo componente que precisa desses números, nunca recalculada solta em cada lugar).

### 9.1 Reuso — `ExpandableCard` e `StatRow` (`components/ui/`)

Os dois pedidos explicitamente para reaproveitar em Anúncios viraram primitivos **sem conhecimento de domínio**:

- **`ExpandableCard`**: casca de checkbox + header + resumo sempre visível + corpo colapsável. `OrderCard` (`features/orders/components/order-card.tsx`) só preenche os slots — um futuro `ListingCard` monta em cima do mesmo componente.
- **`StatRow`**: linha de N estatísticas compactas divididas em colunas. Nasceu generalizando o `QuickMetricsRow` do Dashboard (Etapa 3) — o Dashboard foi refatorado pra usar o `StatRow` novo em vez de duplicar o layout, e `OrdersSummaryBar` usa o mesmo componente.

### 9.2 Composição da tela

`features/orders/orders-content.tsx` guarda três estados: `orders` (mutável — SKU vinculado e venda externa registrada mexem aqui), `filters` (`OrdersFilterState`, um objeto só pros dois blocos de filtro) e `selectedIds` (`Set`, seleção em massa). `filterAndSortOrders()`/`summarizeOrders()` (`features/orders/filters.ts`) são funções puras — nada de estado escondido em cada card.

- **Filtros básicos**: `PeriodSelector`/`AccountSelector` (os mesmos do Dashboard, `components/filters/`), busca (pedido/produto/comprador), status (multi-select via `DropdownMenuCheckboxItem`).
- **Filtros avançados**: dentro do `FilterPanel` (Etapa 2) — SKU, tipo de envio, **canal** (`Orgânico`/`Ads`/`Externo` — deliberadamente diferente de "conta": é *de onde* a venda veio, não *qual conta* recebeu; ver comentário em `types.ts`), checkboxes "sem SKU"/"margem negativa", ordenação.
- **`OrderCard`**: header (ícone do marketplace + tag da conta + id + copiar + re-sincronizar) → resumo (valor/lucro/margem, badge "Sem custo" + `LinkSkuPopover` quando falta custo) → expandido (itens, "Imprimir" [`window.print()`] + `CostBreakdownPopover`, `StatusTimeline` reaproveitada da Etapa 2 com os passos Pronto/Em trânsito/Entregue, metadados).
- **`RegisterExternalSaleDialog`** ("Registrar venda externa"): `Dialog` novo (`components/ui/dialog.tsx`) com um formulário mínimo que cria um pedido `provider: "EXTERNAL"` só no estado local.

### 9.3 Bugs encontrados testando pelo browser

| # | Onde | Bug | Como foi pego |
|---|---|---|---|
| 1 | `mock-data.ts` (thumbnails) | `` `${cor}/20` `` concatenado em runtime — o scanner do Tailwind só detecta classes literais no código-fonte, essa combinação nunca seria gerada no build | revisão de código antes mesmo de testar (não esperei o browser confirmar pra saber que estava errado) |
| 2 | `register-external-sale-dialog.tsx` | `useState(MOCK_SKUS[0].id)` inferia o tipo como o literal `"sku_1"` (array `as const`) em vez de `string`, quebrando o `onChange` do select | `tsc --noEmit` |
| 3 | `mock-data.ts` (2 pedidos) | Os dois pedidos que eu quis deixar com margem negativa (pra dar o que filtrar) na verdade davam positivo — errei a conta de cabeça montando os valores de taxa/frete/custo | teste manual: filtro "Margem negativa" voltava vazio |
| 4 | `order-card.tsx` (timeline) | Quando o pedido chega no último estágio (Entregue), a `StatusTimeline` mostrava o número "3" no círculo em vez de check — o componente trata o passo *atual* diferente do *concluído*, e o último passo alcançado nunca virava "concluído" | teste manual: expandi um pedido Entregue e vi o "3" solto no meio da timeline |

Depois dos fixes: filtro "Margem negativa" retorna exatamente os 2 pedidos certos (resumo do período vira negativo também, `-R$ 14,36` / `-8.7%`) → "Vincular" SKU recalcula o card **e** o resumo agregado em cascata (testado: lucro do resumo subiu de R$619 para R$702 ao vincular 1 pedido) → breakdown "Custos da venda" bate a conta (`64,90 - 7,79 - 14,90 - 3,89 - 19,90 = 18,42`) → timeline sem o "3" solto → "Selecionar todos" + barra de ações em massa → "Registrar venda externa" cria pedido de verdade no estado (contagem foi de 14 para 16 nos dois testes).

**Nota sobre o teste desta etapa:** o `computer.left_click` por `ref` ficou inconsistente nesta sessão do browser (clique não registrava em elementos Radix, sem padrão claro de quando falhava) — troquei para disparar `pointerdown`/`pointerup`/`click` via JS diretamente nos elementos, que funcionou de forma confiável em todos os casos. Se isso se repetir numa sessão futura, essa é a saída.

## 10. Etapa 5 — Anúncios (`/anuncios/*`) e Estoque (`/estoque`)

### 10.1 `Sku` ganhou campos que faltavam no schema

Pra Estoque fazer sentido, `Sku` (Prisma) precisava de estoque/embalagem, que não existiam desde a Etapa 1: `packagingCostAmount`, `stockLocal`, `stockFull`, `lowStockThreshold`. Migration `20260818202540_add_sku_inventory` gerada e aplicada com `prisma migrate dev` direto contra o Postgres real (não precisei escrever SQL à mão desta vez — já tínhamos banco rodando).

### 10.2 `MOCK_SKUS` virou fonte única (`features/catalog/`)

Antes cada módulo (Pedidos) tinha sua cópia de SKUs mockados. Nesta etapa `features/catalog/mock-data.ts` passou a ser a única fonte — Pedidos, Anúncios e Estoque importam de lá. `LinkSkuPopover` e `MarketplaceTag` também saíram de dentro de `features/orders/` para locais compartilhados (`features/catalog/components/` e `components/marketplace-tag.tsx`, respectivamente), porque Anúncios precisava exatamente dos mesmos componentes.

### 10.3 Anúncios — reuso comprovado do `ExpandableCard`

`ListingCard` (`features/listings/components/listing-card.tsx`) é a prova de que o reuso planejado na Etapa 4 funcionou: nenhuma peça de casca (checkbox, header, resumo, colapsável) foi reescrita — só os slots do `ExpandableCard` foram preenchidos com conteúdo de anúncio (marketplace, status, Catálogo, posição competitiva Ganhando/Perdendo, preço, vendas, faturamento, badges de custo/embalagem faltando, tipo de anúncio, logística).

- **`/anuncios/listagem`**: filtros (busca, canal, status, conta) + avançados (SKU, tag, Catálogo, sem SKU, ordenação) — mesmo padrão de `FilterPanel` das etapas anteriores.
- **`/anuncios/rankeamento`**: posição média nas buscas ao longo de 14 dias, por anúncio. Segui o guia de dataviz de novo: em vez de um gráfico de linha só com N séries (estouraria o teto de ~8 cores categóricas com 9+ anúncios ativos), usei **small multiples** — uma linha de tabela por anúncio, cada uma com seu próprio `Sparkline` (`components/ui/sparkline.tsx`, novo: 2px, tom neutro, só o ponto final carrega a cor de tendência — especificação de `marks-and-anatomy.md`).
- **`/anuncios/catalogos`**: disputa de buy box — seu preço vs. preço vencedor, contagem de concorrentes, com "Ajustar preço" só nos que estão perdendo.

### 10.4 Estoque

`features/catalog/catalog-content.tsx` orquestra: toggle Local/Full (recalcula os 4 KPIs e a coluna de estoque da tabela), "ocultar valores" (mascara custo/embalagem com `••••`), "comparar por data" (popover — sem snapshot histórico real ainda, então só liga um modo visual com deltas mockados ao lado dos KPIs), exportar (`lib/export-csv.ts`, Etapa 2), importar (`Dialog` com input de arquivo — sem parsing real de CSV, é mock) e "Novo SKU" (formulário completo incluindo o vínculo N:N com anúncios via checkboxes).

- **Abas** (`Tabs`, primitivo novo sobre `@radix-ui/react-tabs`): "Meus SKUs" e "Anúncios sem SKU" — as duas usam o `DataTable` da Etapa 2, que até esta etapa não tinha sido usado em nenhuma tela real.
- **Indicador de saúde**: `computeStockHealth()` (`features/catalog/types.ts`) — ruptura (0 unidades) / crítico (≤ metade do limite) / baixo (≤ limite) / saudável, `lowStockThreshold` é por SKU (giro diferente por produto, não um número global).
- **Repasse/Lucro previsto**: usa o preço médio dos anúncios vinculados a cada SKU quando existe vínculo; sem vínculo, estima com uma margem padrão (2.2×custo) só pra o KPI não ficar zerado num SKU novo.

### 10.5 Verificação

Testado pelo browser (mesma sessão): os 12 anúncios renderizam com todos os badges pedidos, "Vincular" recalcula o card (confirmei num anúncio diferente do que pretendia clicar primeiro — script de teste, não bug), "Editar preço" atualiza o valor, "Mais Ações" pausa/ativa de verdade, Rankeamento mostra 9 sparklines (uma por anúncio ativo), Catálogos calcula a disputa corretamente, Estoque: toggle Local↔Full recalculou unidades de 114→102 (bate com a soma real dos campos `stockFull`), "ocultar valores" mascarou os KPIs, aba "Anúncios sem SKU" mostrou os 3 certos, "Novo SKU" com vínculo a anúncio funcionou (na segunda tentativa — a primeira falhou por timing do meu próprio script de teste, não da aplicação).

**Nenhum bug de aplicação nesta etapa** — `type-check`/`lint`/`build` passaram de primeira nos dois pacotes, e os únicos problemas encontrados testando foram do meu script de automação (cliquei no card errado, chequei o DOM cedo demais), não do código construído. Também achei e recuperei de um problema de ambiente: o Postgres local caiu no meio da sessão (motivo não identificado) e a API travou tentando conectar nele — documentado aqui caso aconteça de novo: `pg_isready -p 5433` pra checar, `pg_ctl start` pra religar, e só então reiniciar `pnpm dev`.

## 11. Etapa 6 — Módulo Financeiro (`/financeiro/*`)

Quatro sub-rotas: `/financeiro/resumo` (item pai `/financeiro` redireciona pra cá), `/financeiro/abc`, `/financeiro/dre`, `/financeiro/movimentacoes`. Toda a camada de dados mora em `features/finance/`: `types.ts`, `mock-data.ts`, `filters.ts` (Resumo), `abc.ts`, `dre.ts` — e cada sub-rota tem seu `*-content.tsx` orquestrador, seguindo o padrão já estabelecido nas etapas anteriores.

### 11.1 Uma única base de dados mockados para os três relatórios

`MOCK_SALE_RECORDS` (`features/finance/mock-data.ts`) é gerada uma vez — 13 meses (~395 dias) de vendas pseudo-aleatórias (seed determinístico por hash, não `Math.random`, pro re-render não mudar os números) cruzando todos os `MOCK_SKUS` do catálogo compartilhado (Etapa 5). Resumo, ABC e DRE leem dessa mesma fonte; o período de 13 meses existe especificamente para o gráfico de evolução mensal do DRE (12 meses) ter folga para "mês anterior" no primeiro mês navegável.

### 11.2 Resumo Financeiro

Filtros (período, título, SKU, status, conta) + comparação com o período anterior (`comparePeriod`) + projeção linear do mês (`projectMonthRevenue`, extrapola a média diária do mês corrente). 6 KPIs, gráfico de evolução diária (receita + lucro na mesma unidade R$, pedidos em mini-gráfico de barras separado — mesmo padrão anti-dual-axis do Dashboard/Etapa 3) e donut de composição de custo (taxas/envio/lucro). Tabela com colunas configuráveis e exportação CSV via `DataTable` (Etapa 2).

- **Nova cor validada**: o donut precisava de 3 cores simultâneas (chart-1, chart-2, chart-4). Rodei `validate_palette.js` e o `chart-2` no modo escuro falhava a faixa de luminosidade OKLCH (`0.703`, limite `0.67`) — ajustei `199 75% 55%` → `199 75% 44%` em `globals.css`, revalidado com `--pairs all` e passou limpo.

### 11.3 Análise ABC

Toggle Receita/Quantidade/Lucro (`AbcMetricToggle`) reclassifica tudo: agrupamento por produto (`groupByProduct`), ranking com % individual/acumulado e classe A (≤80%)/B (≤95%)/C (`buildAbcRanking`), cards de resumo por classe (`AbcClassCards`), gráfico de Pareto top 20 e tabela ranqueada com exportação CSV.

- **Gráfico de Pareto sem dual-axis**: a forma clássica de Pareto (barras em R$ num eixo + linha de % acumulado noutro eixo) é exatamente o anti-padrão que o guia de dataviz proíbe. Resolvi indexando as duas séries à mesma unidade — barra = % individual, linha = % acumulado — dividindo um único eixo 0–100%, com uma linha de referência tracejada em 80%.

### 11.4 Análise DRE

Navegador de mês/ano (`MonthNavigator`), comparação automática com o mês anterior nos 4 KPIs, toggle "Movimentações incluídas", gráfico de evolução mensal (12 meses, receita + lucro no mesmo eixo R$) e o demonstrativo em cascata (`DreStatement`, estilizado por `DreLine.kind`: linha/subtotal/total).

- **Correção na ordem da cascata pedida**: o pedido original listava "(–) Custo de Anúncios" *antes* de "= Lucro antes de Ads", o que não fecha — não faria sentido chamar de "antes de Ads" um subtotal que já teve Ads subtraído. `computeDre()` (`features/finance/dre.ts`) implementa a ordem logicamente consistente: `Lucro Bruto → (–) Despesas Operacionais → (–) Custos Fixos → = Lucro antes de Ads → (–) Custo de Anúncios → = LUCRO LÍQUIDO`. Documentado em comentário no código; sinalizando aqui porque é um desvio do texto literal do pedido.
- Com "Movimentações incluídas" desligado, Despesas Operacionais, Custos Fixos **e** Custo de Anúncios são todos zerados juntos — Ads é conceitualmente um `FinancialMovementType.AD_SPEND` no schema Prisma, então cai na mesma chave do toggle.

### 11.5 Movimentações

CRUD completo em memória (sem persistência real — mock client-side, como todo o resto da etapa): `MovementDialog` cria e edita (mesmo diálogo, decide pelo registro recebido, padrão do `EditPriceDialog`/`NewSkuDialog`). Cards de resumo (Entradas, Custo Fixo, Custo Operacional, Recorrentes) recalculam a cada alteração. Tabela com ações de editar/excluir por linha. Importação (`ImportMovementsDialog`, mesmo padrão mock do `ImportSkuDialog` — confirma o arquivo, sem parsing real) e exportação CSV reaproveitando `lib/export-csv.ts`.

### 11.6 Verificação

`type-check`, `lint` e `pnpm build` (produção, todas as 30 rotas) passaram de primeira nos três checkpoints rodados durante a etapa — nenhum bug de aplicação encontrado. Testado no browser: ABC (troca de métrica reordena ranking e recalcula classes corretamente), DRE (navegação de mês troca os números, toggle "Movimentações incluídas" zera as 3 linhas certas e recalcula o total), Movimentações (criar lançamento atualiza o card de categoria correspondente, excluir reverte), Resumo (confirmado que a mudança de cor do `chart-2` não quebrou nada). Toda a interação usou o padrão `realClick` (eventos `pointerdown`/`mousedown`/`pointerup`/`mouseup`/`click` sintéticos) já estabelecido nas etapas anteriores — clique via `ref` simples não dispara o submit dos formulários React (login/registro) de forma confiável.

## 12. Etapa 7 — Publicidade (`/publicidade`) e Descobrir (`/descobrir/*`)

### 12.1 Rotas: mantive `/descobrir/*`, não `/analise/*`

O pedido desta etapa listava as rotas do módulo Descobrir como `/analise/garimpador`, `/analise/concorrentes`, `/analise/anuncio`, `/analise/historico`. Isso conflita com a estrutura já existente: o sidebar (Etapa 2) e as páginas placeholder (também Etapa 2) já usam `/descobrir/garimpador`, `/descobrir/concorrentes`, `/descobrir/analise-anuncio`, `/descobrir/historico`, com a seção "Descobrir" no menu apontando pra elas (`components/layout/sidebar-nav-data.ts`). Criar uma árvore `/analise/*` nova deixaria os links do sidebar quebrados (apontando pra placeholders) e duplicaria as páginas. Mantive as rotas `/descobrir/*` já linkadas no sidebar e implementei o conteúdo pedido nelas — sinalizando aqui porque é um desvio do texto literal do pedido.

### 12.2 Publicidade

`features/ads/` segue o padrão das etapas anteriores: `types.ts`, `mock-data.ts`, `filters.ts`, `components/`, `ads-content.tsx`. Dados por produto (não por campanha) — `AdDailyMetric` é uma projeção diária por SKU pra bater com o formato da tabela ranqueada pedida (que é por produto).

- **Break-even de ACoS**: `breakEvenAcosFor()` calcula a margem de contribuição do produto ANTES de Ads (mesma fórmula de preço/taxa/frete/imposto do módulo Financeiro — `preço = custo × 2.4`, taxa 12%, frete líquido ~7,2%, imposto 6%) — é o teto que o ACoS pode atingir antes do produto começar a dar prejuízo com a campanha.
- **Classificação** (Estrela/Moderado/Risco/Prejuízo): razão `ACoS realizado / break-even`. ≤0.6 Estrela, ≤0.9 Moderado, ≤1.0 Risco, >1.0 Prejuízo — regra de negócio meu, não especificada no pedido (só os nomes das 4 classes foram dados), documentada em `features/ads/filters.ts`.
- **TACoS cruza módulos**: usa a receita TOTAL da loja no período (não só a receita atribuída a Ads), lida de `MOCK_SALE_RECORDS` do Financeiro (Etapa 6) — reuso direto em vez de duplicar dado de vendas.
- **Painel "Saúde dos produtos"**: 3 cards clicáveis (Lucrativo = Estrela+Moderado, Em risco = Risco, Prejuízo = Prejuízo) que filtram a tabela; clicar de novo no ativo limpa o filtro.
- **Alerta de custo faltando**: um produto mockado sem SKU vinculado (`UNLINKED_AD_PRODUCT`) dispara o banner "produtos com Ads sem custo vinculado" — mesmo padrão do `MissingCostBanner` do Dashboard (Etapa 3).
- **Gráfico de evolução diária**: investimento, receita de Ads e lucro pós-Ads, todos em R$ — um único eixo, sem dual-axis (mesmo trio de cores chart-1/chart-2/chart-4 já validado na Etapa 6).

**Bug real encontrado testando pelo browser**: a primeira versão do gerador de mock (`buildAdDailyMetrics`) usava `seededRandom(daySeed)` — mesma seed pra decidir "roda Ads hoje?" e pra outros cálculos — e por coincidência o prefixo `"ads-unlinked-"` produzia uma sequência quase linear que nunca cruzava o limiar de 65% em 60 dias, zerando o produto sem SKU inteiro (não aparecia na tabela nem no alerta). Corrigido usando uma seed própria (`${daySeed}-run}`) só pra essa decisão. Também aproveitei pra trocar de fator de desempenho aleatório por fatores fixos por posição (`PERFORMANCE_FACTORS`), porque com só 8 produtos o aleatório puro tinha caído 100% em "Prejuízo" na primeira geração — não é bug de código, mas uma distribuição mockada ruim pra demonstrar a funcionalidade (o painel de saúde não mostrava nenhum produto Lucrativo).

### 12.3 Descobrir — Garimpador, Concorrentes, Análise de Anúncio, Histórico

`features/discovery/` — tudo é gerado (seed determinístico por hash, mesmo padrão das demais etapas), sem scraping nem API real, conforme pedido ("não implemente a coleta real ainda"). `mock-data.ts` expõe `generateNicheSearch(termo, categoria)`, `generateSellerCatalog(url)` e `generateListingAnalysis(url)` — funções puras que sempre devolvem o mesmo resultado pro mesmo input, definindo a INTERFACE de dados esperada (`types.ts`) que a coleta real vai precisar preencher numa etapa futura.

- **Garimpador**: barra de progresso em 5 etapas (`ProgressStepper`) — `setTimeout` encadeado, ~480ms por etapa, sem `Math.random` na duração (determinístico). Resultado: 3 KPIs, produto destaque, gráfico de tendência de visitas (`AreaChart`, série única), nuvem de palavras-chave (tamanho da fonte por peso), tabela de concorrentes.
- **Concorrentes** e **Análise de Anúncio**: mesmo padrão (campo + botão "Analisar" + loading simples de ~900ms, sem stepper — só o Garimpador pediu progresso em etapas). `SellerProfileCard` é compartilhado entre os dois.
- **Histórico entre rotas de verdade**: como cada ferramenta é uma rota separada, o "reabrir" só funciona se o histórico sobreviver à navegação — implementado com `sessionStorage` (`features/discovery/history-store.ts`, chave `hubwin_discovery_history`, seed inicial de 5 análises pra Histórico não abrir vazio). Cada tela lê `?historyId=` da URL (via `useSearchParams`, por isso as 3 páginas de busca — não a de Histórico — estão envolvidas em `<Suspense>` no `page.tsx`, exigência do Next.js App Router) e recarrega o resultado salvo sem rodar a animação de novo.
- **Filtro por tipo** na tela de Histórico (Todos/Garimpador/Concorrentes/Análise de Anúncio), ordenado do mais recente pro mais antigo.

### 12.4 Verificação

`type-check`, `lint` e `pnpm build` (produção) rodados 2× (achei e corrigi o bug do § 12.2 no meio da etapa, então type-check/lint/build rodaram de novo depois da correção) — limpos nas duas passadas. Testado pelo browser: Publicidade (filtro de saúde por clique reduz a tabela corretamente, alerta de custo faltando aparece com a contagem certa), Garimpador (busca nova roda as 5 etapas do stepper e gera resultado consistente, aparece nas buscas recentes), Concorrentes e Análise de Anúncio (mesmo fluxo, loading simples), Histórico (lista os 3 tipos ordenados, filtro por tipo funciona, "Reabrir" navega pra rota certa com o resultado já carregado, sem re-rodar a busca).

## 13. Etapa 8 — Configurações (`/configuracoes/*`)

### 13.1 Abas laterais como rotas de verdade, não tab-switch

`app/(dashboard)/configuracoes/layout.tsx` monta a casca (título + `SettingsNav`) compartilhada por todas as sub-rotas; cada aba pedida é uma rota própria (`/configuracoes/perfil`, `/seguranca`, `/cobranca`, `/planos`, `/margens`, `/ia`, `/indicacao`, `/integracoes`, `/membros`) em vez de um `Tabs` client-side de estado único — mesma decisão do Financeiro/Descobrir (Etapas 6–7): URL própria por aba, compartilhável, volta do browser funciona. `/configuracoes` (raiz) redireciona pra `/configuracoes/perfil`, igual ao padrão `/financeiro` → `/financeiro/resumo`. `SettingsNav` (`features/settings/components/settings-nav.tsx`) usa `usePathname` pra destacar a aba ativa.

Dois componentes novos em `components/ui/` (não existiam até esta etapa): `Slider` e `Switch`, ambos sobre `@radix-ui/react-slider`/`@radix-ui/react-switch` (instalados nesta etapa), seguindo o mesmo padrão dos outros primitivos (`forwardRef` + `cn()` + classes do design system).

### 13.2 Perfil usa a sessão REAL, não mock

Diferente do resto da etapa, `/configuracoes/perfil` é um Server Component que chama `getSession()` (mesma função que o `DashboardLayout` já usa desde a Etapa 2) e passa `nome`/`e-mail` reais do usuário logado pro `PerfilContent`. Não fazia sentido mockar um nome falso quando a API de auth já devolve o usuário de verdade — e-mail vem read-only da sessão (não editável, como pedido) porque não existe endpoint `PATCH /auth/me` ainda. Nome/telefone/avatar são editáveis só no estado local (sem persistência real, mesmo motivo).

### 13.3 Demais abas — tudo mockado, conforme pedido

- **Segurança**: troca de senha com validação client-side (sem endpoint real ainda), toggle de 2FA (mock, mostra chave de recuperação fake quando ativado), sessões ativas mockadas com "encerrar" removendo do estado local.
- **Cobrança**: histórico de faturas (`DataTable` com export CSV) + cartão mockado com diálogo "Trocar cartão".
- **Planos**: 3 tiers (Starter/Pro/Business) com toggle mensal/anual (recalcula preço/mês em tempo real), destaque "Mais popular" no Pro, plano atual mockado como Pro (`CURRENT_PLAN_ID`); pacotes avulsos de pedidos extra com diálogo de confirmação de compra.
- **Margens**: dois `Slider` (limite Ruim→Boa, limite Boa→Excelente) com clamp mútuo (um não pode passar do outro) e barra de preview colorida das 3 faixas em tempo real; toggle de custo de antecipação/empréstimo.
- **IA (MCP)**: tela só explicativa — exemplos de prompt, "como vai funcionar" em 2 passos, bloqueada com badge "Disponível no plano Business" e botão "Em breve" desabilitado, exatamente como pedido ("pode ficar como em breve/bloqueado por plano"). Nenhuma chamada de rede acontece aqui.
- **Indicação**: link de referral com botão copiar (`navigator.clipboard`), 3 KPIs (indicados/convertidos/crédito), lista de indicados com status Pendente/Convertido.
- **Integrações**: cards das 2 contas mockadas (Mercado Livre + Shopee) com vendas/anúncios/status, ações Editar (visual, sem ação)/Sincronizar (muda status pra "Sincronizando" por 1,2s, mock)/Desconectar (remove da lista), diálogo "Conectar nova conta" (escolha de marketplace, sem OAuth real), bloco de integração com ERP em "Em breve".
- **Membros**: convite por e-mail + papel (`InviteMemberDialog`), troca de papel por `DropdownMenu` por membro (exceto o Dono), remover membro — tudo no estado local (sem endpoint real de gestão de membros ainda).

### 13.4 Bug real encontrado e corrigido testando pelo browser

Em `IndicacaoContent.handleCopy()`, a primeira versão era:
```ts
navigator.clipboard?.writeText(REFERRAL_LINK).catch(() => {});
```
O operador `?.` só protege a chamada de `writeText` — encadear `.catch()` fora da cadeia opcional não é protegido. Quando `navigator.clipboard` é `undefined` (ambiente de teste do browser), `navigator.clipboard?.writeText(...)` avalia pra `undefined`, e chamar `.catch()` nesse `undefined` lança um `TypeError` síncrono que aborta a função ANTES de `setCopied(true)` rodar — o botão "Copiar" nunca mostrava "Copiado". Corrigido para `navigator.clipboard?.writeText(REFERRAL_LINK)?.catch(() => {})` (`?.` também no `.catch()`). Encontrado ao testar o botão pelo browser e ver que o texto de confirmação nunca aparecia.

### 13.5 Verificação

`type-check`, `lint` e `pnpm build` (produção, 36 rotas) limpos — rodados de novo depois do fix do § 13.4, limpos também na segunda passada. Testado pelo browser: as 9 abas renderizam e navegam corretamente com a sessão real; 2FA liga/mostra chave; sessão "App Hubwin · Android" encerrada some da lista; toggle mensal/anual recalcula preço; compra de pacote abre diálogo e confirma; slider de margem responde a teclado e a barra de preview atualiza junto com o texto; Indicação copia o link (após o fix); Integrações sincroniza (mostra "Sincronizando" por ~1,2s) e desconecta (remove da lista) e abre o diálogo de conectar nova conta; Membros muda o papel de um membro via dropdown e convida um novo (aparece na lista como "Convite pendente").

## 14. Etapa 9 — Integrações reais (Mercado Livre)

**Escopo desta etapa**: só Mercado Livre — o usuário optou explicitamente por "Mercado Livre primeiro" quando perguntado (Shopee OAuth + Order/Product/Logistics API fica pra próxima etapa, connector continua stub). Nada aqui foi testado contra a API real do ML ainda: falta `MERCADO_LIVRE_CLIENT_ID`/`CLIENT_SECRET`/`REDIRECT_URI` reais no `.env` — o app precisa ser criado em [developers.mercadolivre.com.br/devcenter](https://developers.mercadolivre.com.br/devcenter). Toda a plumbing (OAuth, fila, criptografia, alertas) foi verificada de ponta a ponta com o servidor rodando de verdade (guards, DI, redirects, tratamento de erro) — só as chamadas HTTP reais ao ML ficam pendentes.

### 14.1 Infra local nova

- **Redis portátil** (`.devtools/redis/`, mesmo padrão do Postgres da Etapa 2 — sem Docker): baixado de `tporadowski/redis` (fork Windows do Redis 5.0.14.1), rodando na porta 6379. BullMQ avisa no boot que recomenda Redis ≥6.2 — funciona no 5.0.14.1 pra tudo que esta etapa usa (fila simples + rate limit por Worker), mas vale trocar por um Redis mais novo (ou um serviço gerenciado) antes de produção.
- **`TOKEN_ENCRYPTION_KEY`**: chave AES-256 (32 bytes, base64) gerada e já colocada no `.env` — usada por `TokenEncryptionService` (`integrations/crypto/`) pra nunca gravar `accessToken`/`refreshToken` em texto puro no Postgres, exatamente como o comentário no schema já previa desde a Etapa 1. Formato armazenado: `iv:authTag:ciphertext` (tudo base64) numa coluna `String?` só.
- **`AlertType.MISSING_COST`** adicionado ao enum (migration `add_alert_type_missing_cost`) — não existia um tipo de alerta pra "pedido sem SKU vinculado".
- **`@nestjs/bullmq`, `@nestjs/schedule`** instalados (faltavam; só `bullmq`/`ioredis` cru já estava no package.json desde a Etapa 1).

### 14.2 OAuth 2.0 — Mercado Livre

`MercadoLivreConnector` (`integrations/connectors/mercado-livre/`) implementa `getAuthorizationUrl`/`exchangeCodeForToken`/`refreshAccessToken`/`fetchAccountInfo` de verdade contra `auth.mercadolivre.com.br` e `api.mercadolibre.com` (cliente HTTP próprio em `mercado-livre.api-client.ts`, usando `fetch` nativo — Node 20+, sem dependência extra).

- **`state` assinado, não uma tabela**: o callback do OAuth é uma navegação do browser vindo direto do ML — não tem cookie de sessão nem header `X-Workspace-Id` disponível (o frontend não está no meio dessa requisição). `OAuthStateService` assina um JWT curto (10min, mesmo `JWT_SECRET` da sessão, `purpose` dedicado) carregando `workspaceId`/`userId`/`provider`, verificado no callback. Evita criar uma tabela só pra isso.
- **`GET /integrations/mercado-livre/connect`** (autenticado, `JwtAuthGuard` + `WorkspaceGuard`) monta a URL e redireciona (302) o browser pro ML.
- **`GET /integrations/mercado-livre/callback`** (público — é o ML quem chama) troca o `code`, busca a conta (`/users/me`) e faz upsert em `MarketplaceAccount` com os tokens já criptografados; qualquer erro (state inválido/expirado, credenciais não configuradas, falha de rede) redireciona de volta pro frontend com `?integration_error=...` genérico — nunca a mensagem crua (fica só no log do servidor).
- **Renovação automática**: `MarketplaceAccountsService.refreshToken()` troca o refresh token; `MarketplaceSyncScheduler.refreshExpiringTokens()` (cron a cada 10min, `@nestjs/schedule`) varre contas a menos de 30min de expirar e enfileira a renovação — proativo, não espera um 401 pra só então tentar renovar.

### 14.3 Sincronização — Orders/Items/Shipments/Billing

`OrderSyncService` (`integrations/order-sync.service.ts`) é o núcleo: `syncAccountOrders` (pull completo/incremental, pagina até `nextPage` acabar ou 200 páginas de trava de segurança) e `syncSingleOrder` (1 pedido — usado pelo webhook).

- **Mapeamento de status**: o ML não tem um enum de pedido igual ao nosso — `order.status` é sobre PAGAMENTO, o status de ENTREGA mora num recurso separado (`GET /shipments/{id}`). `mapOrderStatus()` (`mercado-livre.mappers.ts`) combina os dois pra chegar em `PENDING/PAID/IN_PREPARATION/SHIPPED/DELIVERED/CANCELED/RETURNED`.
- **"Billing/Fees API" na prática**: o ML não expõe uma API de taxas separada por pedido — a comissão (`sale_fee`) já vem embutida em cada `order_item` do próprio payload do pedido. `totalFeeAmount()` soma isso; documentado no código pra não parecer que faltou implementar algo.
- **Items API**: `listListings` busca IDs via `/users/{id}/items/search` e depois os detalhes via multiget `/items?ids=...` (até 20 por chamada, em paralelo).
- **Resolução de SKU/custo**: `resolveItemCost()` casa `OrderItem.externalItemId` → `Listing` (mesma conta) → `ListingSku` (considerando variação) → `Sku.costAmount + packagingCostAmount`, snapshot gravado em `OrderItem.unitCostAmount` no momento da venda (não recalcula com o custo atual do SKU depois, conforme já documentado no schema desde a Etapa 1). `Order.costAmount`/`netProfitAmount` são recalculados no mesmo upsert.
- **Itens recriados a cada sync** (delete + createMany numa transaction) em vez de upsert individual — o schema não tem chave natural única em `OrderItem`, e o pedido inteiro já vem fresco da API a cada sincronização, então não existe "item perdido" pra proteger.

### 14.4 Fila (BullMQ) — retry exponencial e rate limit

Uma fila só, `marketplace-sync` (`integrations/queues/`), com 3 tipos de job discriminados por `data.type` (`SYNC_ACCOUNT_ORDERS`, `SYNC_SINGLE_ORDER`, `REFRESH_TOKEN`), processados por um único `MarketplaceSyncProcessor` (`@nestjs/bullmq` `WorkerHost`).

- **Retry**: `attempts: 5` + backoff exponencial (5s → 10s → 20s → 40s → 80s) nas `defaultJobOptions` da fila.
- **Rate limit**: `limiter: { max: 8, duration: 1000 }` no `@Processor` (≈8 req/s) — número de partida conservador, não um limite oficial documentado pelo ML (não há um número universal público fixo); ajustar com base em `429`/`MercadoLivreApiError.isRateLimited` observados de verdade. **Quando a Shopee entrar**: precisa virar 2 filas (uma por provider), porque hoje o limiter é por Worker/fila — misturar os dois marketplaces numa fila só faria o rate limit de um vazar pro outro.
- **`jobId` estável** (`sync-account:{id}`, `sync-order:{id}:{externalOrderId}`, `refresh-token:{id}`) evita duplicar trabalho — essencial pro polling de fallback não empilhar o sync de um pedido que um webhook já enfileirou segundos antes.

### 14.5 Webhooks + fallback de polling

`POST /integrations/mercado-livre/webhook` (público) responde `200` imediatamente (é o que o ML exige — reenvia/desativa a notificação depois de falhas repetidas) e só enfileira `SYNC_SINGLE_ORDER`; o processamento de verdade acontece na fila, nunca inline no handler. Eventos de tópico diferente de `orders_v2` são reconhecidos mas ignorados por ora (a Etapa 9 pediu tempo real pra pedidos, não pra items/shipments isoladamente).

`MarketplaceSyncScheduler.pollConnectedAccounts()` (cron a cada 15min) reenfileira `SYNC_ACCOUNT_ORDERS` pra TODA conta `CONNECTED` — é o fallback: mesmo que um webhook se perca (instabilidade de rede, app reiniciando no momento exato), nenhum pedido fica parado por mais de ~15min.

### 14.6 Alertas — "produto vendido sem custo cadastrado"

`AlertsService` (`alerts/alerts.service.ts`) — módulo que até esta etapa só tinha o comentário de intenção, sem código. `raise()` é idempotente por `(workspaceId, type, referenceType, referenceId)`: se já existe um `Alert` `OPEN` pra aquela referência, só atualiza `triggeredAt` em vez de duplicar Alert+Notification a cada re-sincronização do mesmo pedido. Distribui uma `Notification` (canal `IN_APP`) por membro `ACTIVE` do workspace.

`OrderSyncService.upsertOrder()` chama `alerts.raiseMissingCost()` só quando o pedido é **novo** (não existia antes desse upsert) e tem pelo menos 1 item sem `skuId` resolvido — bate exatamente com o pedido ("sempre que um NOVO pedido chega sem SKU vinculado"), sem alertar de novo a cada re-sync de um pedido antigo que já foi visto sem custo.

### 14.7 Desvio sinalizado durante a etapa: hospedagem

O usuário mencionou hospedar no Netlify; sinalizei que Netlify Functions são serverless (timeout curto, sem processo persistente) e não sustentam um Worker de BullMQ escutando o Redis continuamente — Netlify serve bem pro `apps/web` (frontend), mas o `apps/api` (com o worker) vai precisar de um host com processo Node contínuo (Railway/Render/Fly.io/VPS) quando for pra produção. Não bloqueia o desenvolvimento local (resolvido com túnel ngrok pro callback/webhook) nem nada do que foi construído nesta etapa — é uma decisão de infra pra quando o deploy acontecer.

### 14.8 Verificação

`type-check`, `lint` e `pnpm build` (produção, os dois pacotes) limpos. Verificação de runtime real (servidor rodando de verdade, não só compilação):

- Boot completo do NestJS sem erro de DI — achei e corrigi 1 bug real nesse processo: `@UseGuards(WorkspaceGuard)` não resolvia `WorkspacesService` porque `IntegrationsModule` importava só `AuthModule` (que exporta o guard) mas não `WorkspacesModule` — `@UseGuards()` por referência de classe resolve as dependências do guard no contexto do módulo que o USA, não no módulo que o exportou. Corrigido importando `WorkspacesModule` também em `IntegrationsModule`.
- `GET /connect` sem sessão → `401` (guard funcionando).
- `GET /connect` autenticado, sem `MERCADO_LIVRE_CLIENT_ID` configurado → antes vazava um `500` genérico; corrigido pra redirecionar com `?integration_error=not_configured` (mesmo padrão do callback).
- `GET /callback` com `state` inválido → erro logado (`jwt malformed`), redirect genérico, nada vaza pro browser.
- `POST /webhook` com payload válido de pedido pra conta não conectada → `200 {"ok":true}` + warning no log (não derruba a notificação do lado do ML, que é o que importa).
- Rotas mapeadas corretas no boot: `/api/v1/integrations/mercado-livre/{connect,callback,webhook}`.
- **Não verificado** (depende das credenciais reais do ML): troca de `code` por token, refresh de token, `listOrders`/`fetchOrder`/`listListings` contra a API real, recebimento de um webhook de verdade do ML. Isso é o próximo passo assim que o `.env` for preenchido.

## 15. Rebrand — "Hubwin" → "Órbita"

Nova identidade visual aplicada a partir de um brand kit fornecido pelo usuário (`brand-kit-orbita.zip`, gerado numa sessão anterior) — racional completo em [`docs/identidade-visual.md`](docs/identidade-visual.md). Resumo: fundo dark quase preto + laranja vibrante era a identidade do concorrente direto (Hunter Hub); a proposta troca por um duotone índigo→ciano (`#6659FF` → `#0891A6`), tipografia Space Grotesk (títulos/números) + Inter (corpo), e uma metáfora de marca (órbita/satélite) diferente da do concorrente (caça).

Perguntei ao usuário duas coisas antes de aplicar, porque mudavam o escopo: (1) renomear o produto pra "Órbita" ou manter "Hubwin" só com visual novo — escolheu renomear; (2) remapear os tokens existentes pra nova paleta ou só trocar `--primary` — escolheu remapear tudo. As duas decisões abaixo refletem essas escolhas.

### 15.1 Remapeamento de tokens, não um sistema paralelo

O kit foi escrito como se o projeto não existisse ainda (`src/app`, tokens `surface-1`/`ink-primary`/`status-good` do zero). O projeto real já tinha ~150 arquivos usando os tokens shadcn/ui-padrão (`--primary`, `--success`, `--chart-1..5` etc.) definidos desde a Etapa 2. Em vez de introduzir os nomes de token do kit (o que deixaria dois sistemas paralelos e não mudaria nada visualmente, já que nenhum componente usa `bg-surface-1`), **remapeei os VALORES dos tokens existentes** para a paleta do kit — os nomes não mudaram, zero componente precisou ser reescrito.

Hex → HSL convertidos por script (não à mão) e a hierarquia de superfícies do kit (`bg-base` < `surface-1` < `surface-2`, só 3 níveis) foi encaixada na hierarquia de 4+ níveis que o projeto já tinha (`sidebar`/`background`/`card`/`secondary`), documentado em comentário no próprio `globals.css`.

### 15.2 Paleta de gráficos revalidada do zero

O kit só define 3 cores de marca + 3 de status — não os 5 tons categóricos que `--chart-1..5` precisa. Rodei `dataviz/scripts/validate_palette.js --pairs all` (mesmo processo rigoroso das Etapas 3/6/7) com os hex do kit direto e **falhou** nos dois modos (verde `#1D8A5A`/`#30A46C` colidia de separação com o ciano `#0891A6` sob simulação de daltonismo). Ajustei chart-4 (verde) e chart-5 (âmbar) — mantendo a família de cor da marca, só afastando o hue — até `ALL CHECKS PASS` em light e dark:

| Slot | Light | Dark | Papel |
|---|---|---|---|
| chart-1 | `#6659FF` | `#6659FF` | Marca (índigo) |
| chart-2 | `#0891A6` | `#0891A6` | Marca (ciano) |
| chart-3 | `#EC4899` | `#EC4899` | Marca (rosa) |
| chart-4 | `#16A34A` | `#16A34A` | Verde (não é o `#1D8A5A`/`#30A46C` do kit — colidia com o ciano) |
| chart-5 | `#9A6600` | `#B45309` | Âmbar — a versão dark é uma tonalidade diferente da light porque o âmbar original colidia com o verde sob protan especificamente nesse fundo escuro (mesmo tipo de ajuste já feito em chart-2 nas etapas anteriores) |

### 15.3 Logo — desvio do kit: ícone + texto, não a wordmark SVG

`logo-orbita.svg` (o logotipo completo, ícone + nome) tem o texto "órbita" fixo em preto (`fill="#14151C"`) — só funciona sobre fundo claro (o próprio `identidade-visual.md` § 5 avisa disso). A sidebar e o layout de autenticação usam `bg-background`/`bg-sidebar`, que são **escuros por padrão** (dark mode é o tema padrão do produto desde a Etapa 2). Usar a wordmark SVG ali resultaria em texto preto invisível sobre fundo quase preto.

Resolvido usando só `icone-orbita.svg` (tem fundo próprio embutido, funciona em qualquer superfície) + o nome "Órbita" como **texto de verdade** (`font-display` + o token de cor correto do contexto — `text-sidebar-foreground` na sidebar, `text-foreground` no layout de auth), que se adapta automaticamente entre claro/escuro (a wordmark estática não adaptaria). `logo-orbita.svg` continua salvo em `public/brand/` para usos futuros com fundo claro garantido (ex.: site institucional, e-mail).

### 15.4 Fonte de destaque sem tocar ~30 páginas

Espalhar `font-display` (Space Grotesk) manualmente em cada `<h1>` de cada página tocaria ~30 arquivos. Em vez disso, uma regra em `@layer base` no `globals.css` aplica a fonte a `h1, h2, h3` globalmente — e `KpiCard` (componente único reusado por todo o produto) ganhou `font-display` no valor grande. Duas edições cobrem "títulos e números grandes de KPI" (pedido do kit) no app inteiro.

### 15.5 Bug real encontrado testando no browser

`next/image` rejeita SVG por padrão (a rota `/_next/image` devolve `400` — precisa de `images.dangerouslyAllowSVG: true` no `next.config.mjs`, ou `unoptimized` no componente). O ícone da marca não carregava (`naturalWidth: 0`) até eu adicionar a prop `unoptimized` nas 3 instâncias (sidebar expandida/recolhida + layout de auth) — SVG já é vetor, não ganha nada do otimizador raster mesmo. Também adicionei `priority` (ícone acima da dobra, evita o lazy-load padrão atrasar o LCP do header).

### 15.6 O que NÃO foi renomeado

Identificadores internos de código (`@hubwin/web`, `@hubwin/api`, pasta `hubwin/`, nome do workspace pnpm) continuam "hubwin" — renomear pacotes npm workspace é uma operação maior (toca lockfile, todos os imports `@hubwin/*`, CI se existisse) e não é o que "identidade visual" pede. Só o nome do PRODUTO como aparece pro usuário (títulos de página, sidebar, telas de auth, README/ARCHITECTURE) virou "Órbita". Menções a "Hubwin" dentro de texto narrativo de etapas ANTERIORES a esta (ex.: "App Hubwin · Android" na verificação da Etapa 8) foram mantidas como registro histórico — era o nome do produto naquele momento.

### 15.7 Verificação

`type-check`/`lint`/`build` de produção limpos (rodados de novo depois do fix do § 15.5). Testado no browser via inspeção de estilo computado (não só visual): `body` background/color batem exatamente com os tokens novos em claro E escuro; `--chart-1`/`--chart-4` carregam os valores certos; heading usa `Space Grotesk` de verdade (`getComputedStyle().fontFamily`); botão primário usa o índigo (`rgb(101, 87, 255)` ≈ `#6659FF`); ícone da marca carrega (100×100, `complete: true`) depois do fix do § 15.5; título de página, sidebar e telas de auth mostram "Órbita" em vez de "Hubwin".

## 16. Backend real de Catalog e Discovery (pré-requisito da extensão de navegador)

Antes da extensão (Etapa 10.1), os dois endpoints que ela precisa chamar não existiam de verdade — `catalog` e `discovery` eram módulos vazios desde a Etapa 1, com toda a lógica só no frontend mockado (Etapas 5 e 7). Perguntei ao usuário como sequenciar isso (backend real primeiro / extensão contra mock / esperar tudo) — escolheu backend real primeiro.

### 16.1 Catalog — CRUD de SKU de verdade

`CatalogController`/`CatalogService` (`apps/api/src/catalog/`): `GET /catalog/skus` (lista, com busca por `?q=` em código/nome), `GET /catalog/skus/:id`, `POST /catalog/skus` (cria, valida código duplicado por workspace → `409`), `PATCH /catalog/skus/:id` (update parcial — é o que a extensão usa pra "cadastrar rapidamente o custo": manda só `{ costAmount }`), `POST /catalog/skus/:id/link-listing` (vincula a um `Listing` já sincronizado, mesma operação do `LinkSkuPopover` do frontend — Etapa 4/5 — agora persistindo de verdade). Sem `Listing` sincronizado (depende da Etapa 9 rodar contra a API real do ML), `link-listing` devolve `404` com mensagem explicando o motivo, em vez de falhar silenciosamente.

### 16.2 Discovery — endpoints reais, ainda sem coleta real

`DiscoveryController`/`DiscoveryService` (`apps/api/src/discovery/`): `POST /discovery/garimpador`, `/concorrentes`, `/anuncio` — mesma lógica de geração determinística por seed/hash do mock do frontend (Etapa 7), reimplementada no backend (não compartilhada via pacote — é código descartável, será substituído quando a coleta real existir). A diferença real desta etapa: agora existe uma chamada de API de verdade (que a extensão pode disparar sem abrir o app) e cada análise grava em `SearchHistory` (modelo já existia desde a Etapa 1, nunca tinha sido usado) — `GET /discovery/history` lista as últimas 50.

### 16.3 Verificação

`type-check`/`lint`/`build` limpos. Testado via HTTP contra o servidor rodando de verdade (registro → login → cookie de sessão): criar SKU, `PATCH` só o custo (confirma que os outros campos não mudam), criar com código duplicado → `409` com mensagem clara, listar, `link-listing` sem `Listing` sincronizado → `404` com mensagem explicando o motivo, `POST /discovery/garimpador` gera resultado e persiste em `SearchHistory` (confirmado lendo de volta via `GET /discovery/history`).

## 17. Etapa 10.1 — Extensão de navegador (Chrome, Manifest V3)

`apps/extension/` — cadastra custo de SKU e dispara análise de concorrente a partir da página do anúncio, sem abrir o painel. JS puro (sem TypeScript/bundler, deliberado — ver `apps/extension/README.md` § "Por que não tem build step"), carregável direto via "Carregar sem compactação" no `chrome://extensions`.

### 17.1 Autenticação sem cookie — mudança no backend de auth

A extensão não tem acesso ao cookie `httpOnly` de sessão (por design — nem deveria). Três ajustes no backend, sem quebrar o site:

- `JwtStrategy` (`apps/api/src/auth/strategies/jwt.strategy.ts`): passou a aceitar `Authorization: Bearer` além do cookie (`ExtractJwt.fromExtractors([cookie, bearer])`, cookie primeiro).
- `POST /auth/login`/`register`: continuam setando os cookies exatamente como antes, mas agora TAMBÉM devolvem `tokens.accessToken`/`tokens.refreshToken` no corpo da resposta — o site ignora esse campo (usa os cookies), só a extensão usa.
- `POST /auth/refresh`/`logout`: aceitam o refresh token no corpo (`RefreshDto`, opcional) como fallback quando não há cookie — usado só pela extensão.
- **Cookies renomeados** de `hubwin_at`/`hubwin_rt` para `orbita_at`/`orbita_rt` (resquício do rebrand da Etapa "Rebrand" que passou batido na hora — corrigido aqui de propósito).

### 17.2 Por que toda chamada de API acontece no `background.js`, nunca no content script

Duas razões, documentadas em `lib/api.js`: (1) requests do service worker com `host_permissions` declarado não passam pela checagem normal de CORS de página — um `fetch` direto do content script passaria; (2) mantém o token fora do contexto da página do marketplace, que a extensão não controla. Popup e content script só trocam mensagens com o background via `chrome.runtime.sendMessage`.

### 17.3 Detecção de anúncio na página

`content-script.js` roda em páginas do Mercado Livre e Shopee (`content_scripts.matches` no manifest) e extrai o `externalListingId` por regex na URL — `MLB-?(\d+)` pro Mercado Livre (normalizado sem hífen, mesmo formato gravado em `Listing.externalListingId` pelo sync da Etapa 9), `-i\.(\d+)\.(\d+)` pra Shopee. Só desenha o widget flutuante se reconhecer a página E o usuário já estiver logado na extensão (`GET_STATE` primeiro).

### 17.4 O que "Vincular" faz de verdade

Fluxo real (não mock): busca o SKU por código (`GET /catalog/skus?q=`), cria se não existir ou só atualiza `costAmount` se existir (`POST`/`PATCH` reais, Etapa 16.1), depois chama `POST /catalog/skus/:id/link-listing`. Como a Shopee ainda não tem connector real (Etapa 9), "Vincular" numa página da Shopee sempre devolve `404` — comportamento esperado e documentado, não um bug.

### 17.5 Verificação

Validado o que dava pra validar sem abrir um Chrome de verdade: sintaxe de todos os `.js` (`node --check` nos scripts clássicos, `node -e "import(...)"` nos módulos ES — `background.js` chega até `chrome is not defined`, confirmando que o parse/import passou e só falha por rodar fora de um browser, como esperado), `manifest.json` é JSON válido, e os 3 ajustes de auth (Bearer, refresh via body, cookies renomeados) testados via HTTP contra o servidor real (login devolve `tokens` no corpo, `/auth/me` autentica com o Bearer devolvido, `/auth/refresh` funciona só com `refreshToken` no corpo sem cookie nenhum, e o fluxo de cookie do site continua funcionando sem regressão).

**Não verificado**: carregar a extensão de verdade num Chrome (popup, injeção do content script numa página real do ML, clique end-to-end) — isso precisa de "Carregar sem compactação" num Chrome de verdade, que não tentei fazer sozinho (é uma mudança persistente no navegador do usuário; instruções em `apps/extension/README.md`).

## 18. Pontuação de Oportunidade (0-100) — primeira feature inspirada no concorrente "Hunter Spy"

Contexto: o usuário mostrou a extensão concorrente "Hunter Spy" ("nossa IA exclusiva analisa 15 variáveis e te dá uma nota de 0-100") e pediu algo parecido, aceitando explicitamente rodar com dados gerados (scraping real fica pra depois — Etapa 16 continua valendo) e delegando a mim a ordem de prioridade das features ("o que for melhor em termos de vendas"). Escolhida a Pontuação de Oportunidade como primeira entrega por três motivos: é o gancho de marketing mais forte do concorrente, e — diferente de qualquer feature que dependa de scraping — dava pra construir **hoje**, porque o Garimpador (Etapa 7/16) já gera todos os números de entrada que o score precisa.

**Importante**: isto não é uma cópia da "IA de 15 variáveis" do concorrente. É um algoritmo autoral, documentado e determinístico — soma ponderada de 5 fatores (não 15, não é IA/ML) com fórmula pública, não caixa-preta.

### 18.1 O algoritmo (`apps/api/src/discovery/opportunity-score.ts`)

`computeOpportunityScore(input)` recebe `totalSales`, `addressableMarket`, `competitorCount`, `visitsTrendGrowthPercent`, `estimatedMarginPercent` — todos já calculados/gerados pelo `DiscoveryService.garimpador()` — e devolve `{ score, factors }`, onde cada fator tem `label`/`weight`/`score` (0-100) pra UI conseguir mostrar o "porquê" da nota, não só o número final:

- **Demanda** (peso 0,25) e **Tamanho do mercado** (peso 0,15): escala logarítmica (`logScore`) — vendas/mercado variam em ordens de grandeza, então diferença linear não faz sentido pra pontuação.
- **Concorrência** (peso 0,20): linear invertido, `100 - competidores × 10` — 10+ concorrentes já zera essa parte (mercado saturado).
- **Tendência de visitas** (peso 0,15): centrado em 50 (estável), varia ±1 ponto por 1% de crescimento/queda no período.
- **Margem estimada** (peso 0,25): linear até 35% de margem = nota máxima (mesmo limiar "Excelente" já usado em Configurações → Margens, Etapa 8 — consistência entre módulos).

### 18.2 Onde os números de entrada vêm de (ainda gerados, não coletados)

`competitorCount`, `visitsTrendGrowthPercent` são gerados por seed determinístico (mesmo padrão de todo o módulo Discovery desde a Etapa 7). `estimatedMarginPercent` reaproveita a MESMA fórmula de custo do módulo Financeiro (custo = preço ÷ 2,4, taxa 12%, frete líquido 7,2%, imposto 6%) aplicada ao preço médio observado no nicho — não é um número novo inventado, é a estrutura de custo já usada em todo o resto do produto.

### 18.3 Frontend — ligado ao endpoint real, não ao mock antigo

Diferente do resto do módulo Discovery (que ainda é 100% mock no frontend), o Garimpador (`apps/web/features/discovery/garimpador-content.tsx`) agora chama `POST /discovery/garimpador` de verdade (`apiFetch` com `workspaceId`, mesmo padrão da Etapa "Conecta Integrações ao backend real") e mescla a resposta real (score, fatores, vendas/mercado/visitas) por cima do resultado gerado localmente — que continua sendo a única fonte pra tendência de visitas (gráfico), nuvem de palavras-chave e tabela de concorrentes, porque o backend ainda não gera esses dados. Se a chamada falhar (rede, sessão expirada), a busca não quebra — só fica sem o card de Pontuação de Oportunidade.

`OpportunityScoreCard` (`apps/web/features/discovery/components/opportunity-score-card.tsx`): anel de progresso em SVG puro (sem lib de gráfico), faixa de cor por score (≥70 verde "Ótima oportunidade", ≥45 âmbar "Oportunidade moderada", <45 vermelho "Baixa oportunidade") e barra por fator mostrando o breakdown.

`runStages()` (animação do stepper de progresso) precisou aceitar `onDone` assíncrono — antes o "sumir com o stepper" era síncrono, e trocar pra `await` na chamada real evita um flash de tela vazia entre o fim da animação e a resposta da API.

### 18.4 Verificação

`type-check`/`lint` limpos em `@hubwin/api` e `@hubwin/web`. Testado via curl direto contra `/discovery/garimpador` com 3 termos diferentes ("escorredor de louça" → 70, "capinha de celular" → 70, "organizador de gaveta" → 75) confirmando scores variados e coerentes com os fatores de entrada. Testado end-to-end no navegador (registro → login → busca no Garimpador): `POST /api/v1/discovery/garimpador` retorna `201`, card de Pontuação de Oportunidade renderiza com score 77 "Ótima oportunidade" e os 5 fatores com barras, sem erros no console.

## 19. Ferramentas bônus e filtro de logística — continuação do Etapa 18

Depois de aprovar a Pontuação de Oportunidade, o usuário pediu pra seguir com o resto das ideias inspiradas no Hunter Spy, delegando a ordem a mim. Escolhidas mais duas entregas de baixo risco/alto retorno (sem depender de scraping): as "ferramentas bônus" (calculadora de lucro + gerador de EAN) e um filtro simples na tabela de concorrentes do Garimpador.

### 19.1 Nova aba "Ferramentas" (`/descobrir/ferramentas`)

`apps/web/features/discovery/tools.ts` — cálculo puro, sem API (o usuário está simulando um produto que nem tem ainda, não há pedido real pra consultar):

- **Calculadora de lucro inteligente** (`computeProfitCalculator` + `suggestPriceForTargetMargin`): dado preço/custo/embalagem/frete/comissão/imposto/ads, devolve lucro e margem líquida por unidade. A parte "inteligente": `suggestPriceForTargetMargin` resolve o preço algebricamente pra bater uma margem-alvo — como comissão/imposto/ads são todos % do PREÇO (não do custo), não é um simples "custo ÷ (1 − margem)"; isola o preço numa equação com todos os percentuais do lado dele e devolve `null` quando a soma dos percentuais + margem-alvo passa de 100% (não existe preço finito que resolva).
- **Gerador de EAN-13** (`generateEan13`): dígito verificador GS1 válido (mod 10, pesos 1/3 alternados), prefixo `789` (faixa GS1 Brasil) só pra parecer plausível — deixado explícito na UI que NÃO é um código registrado de verdade (isso exige associação paga à GS1 Brasil, fora do escopo).

**Bug pego e corrigido antes de fechar a etapa**: `EanGeneratorCard` inicializava o código no `useState(() => generateEan13())`, que roda tanto no primeiro render do servidor quanto no primeiro render do cliente — como `generateEan13` usa `Math.random()`, os dois rodavam com valores diferentes, causando erro de hidratação do React (confirmado no console: "Text content did not match... Warning: An error occurred during hydration"). Corrigido gerando o código só depois de montar (`useEffect` com `code` começando `null`), documentado no comentário do componente.

### 19.2 Filtro por logística no Garimpador

`garimpador-content.tsx`: chips de alternância (Full/Correios/Coleta/Agência — os mesmos valores de `LogisticsType` já usados desde a Etapa 7, não os nomes do Hunter Spy "Full/Flex/Catálogo", que são conceitos específicos do ML e quebrariam consistência com o resto do produto) acima da tabela de concorrentes; `Set<LogisticsType>` vazio = sem filtro, senão mostra só as linhas cujo `logisticsType` está no set. Reseta a cada nova busca/seleção de histórico.

### 19.3 Verificação

`type-check`/`lint` limpos. Testado no navegador: `/descobrir/ferramentas` renderiza sem erro de hidratação nem exceção (confirmado lendo o console limpo numa aba nova, depois de identificar que os erros anteriores eram de compilações antigas do Fast Refresh), EAN gerado conferido manualmente (checksum bate: 12 dígitos `789185119118` → dígito verificador `3`, igual ao mostrado na tela). Filtro testado disparando uma busca real e clicando "Correios" via `dispatchEvent`/`click()`: tabela foi de 8 para 4 linhas, todas com logística "Correios".

## 20. Análise de Anúncio real + dois bugs reais de sincronização (achados em produção)

Depois que o usuário conectou uma conta real do Mercado Livre (Configurações → Integrações), três problemas apareceram testando de verdade contra produção — nenhum visível em `type-check`/`lint`, só rodando contra dados reais.

### 20.1 Análise de Anúncio busca o item de verdade

O usuário colou o link de um anúncio real e recebeu de volta um título genérico ("Kit Produto Analisado") — a tela nunca tinha feito coleta real (Etapa 7). Tentativas nessa ordem:

1. **Scraping direto da página** — bloqueado pelo ML como "tráfego suspeito" (detecção anti-bot) já no primeiro request.
2. **API pública de item sem token** (`GET api.mercadolibre.com/items/{id}`) — `403 PA_UNAUTHORIZED_RESULT_FROM_POLICIES`. O ML mudou essa política: hoje exige um Bearer token válido mesmo pra item público de outro vendedor.
3. **API de item COM token de uma conta conectada** — funciona. `DiscoveryService.tryFetchRealListing()` (`apps/api/src/discovery/discovery.service.ts`) extrai o `MLB<id>` da URL por regex, busca qualquer conta `MERCADO_LIVRE` conectada do workspace (não precisa ser a dona do anúncio), renova o token se estiver perto de expirar, e chama `GET /items/{id}` + `GET /users/{seller_id}` direto (`mlFetch`, sem passar pelo `MarketplaceConnector` — código deliberadamente solto, mesmo racional do resto do `DiscoveryService`: descartável, vai ser substituído quando existir coleta de verdade pra outras telas).

**Limite real, documentado na UI**: título/preço/imagem/vendedor vêm reais; vendas/visitas/conversão de 30 dias continuam GERADOS — a API do ML não expõe essas métricas pra anúncio de outro vendedor, só pro dono logado. O card mostra um selo "Dados reais" e uma nota explicando exatamente essa fronteira.

### 20.2 Bug real: `Listing` nunca era sincronizada

"Sincronizar" numa conta conectada só enfileirava `SYNC_ACCOUNT_ORDERS` — nunca existiu job pra anúncios, então `Listing` ficava sempre vazia e "anúncios ativos" travado em 0 pra sempre, mesmo sincronizando repetidamente (e pedidos de itens sem `Listing` nunca resolviam custo/SKU, já que `resolveItemCost` depende dela existir). Corrigido: novo job `SYNC_ACCOUNT_LISTINGS` + `OrderSyncService.syncAccountListings()` (mesmo padrão de paginação/erro de `syncAccountOrders`), enfileirado junto com pedidos tanto no clique manual (`POST /integrations/accounts/:id/sync`) quanto — novo também — automaticamente no callback do OAuth (antes o primeiro sync exigia clique manual, apesar do comentário no código já prever isso).

### 20.3 Bug real: BullMQ rejeita `:` no jobId

Mesmo depois do fix acima, "Sincronizar" continuava dando 500 sem sincronizar nada. Causa raiz, achada lendo o log de runtime do Railway (não aparece em `type-check`/`lint`, nem em teste local sem fila real): `jobId()` (`apps/api/src/integrations/queues/marketplace-sync.types.ts`) usava `:` como separador (`sync-account:${id}`), e o **BullMQ recusa qualquer jobId customizado que contenha `:`** ("Error: Custom Id cannot contain :"). Isso quebrava TODO enfileiramento — inclusive o sync de pedidos, desde a Etapa 9, sempre, silenciosamente (a chamada dava 500, a tela só continuava em 0/0 sem mostrar nada). Trocado `:` por `-` em todos os padrões de jobId.

### 20.4 Verificação

`type-check`/`lint`/`build` limpos nas três correções. Análise de Anúncio testada com o link real do usuário (produto de decoração de cozinha) — título/preço/imagem batendo com o anúncio de verdade, selo "Dados reais" visível. Sincronização testada disparando "Sincronizar" na conta real conectada; diagnosticado via Railway Deploy Logs (não local) — o erro `Custom Id cannot contain :` só aparece com Redis/BullMQ de produção processando o job de verdade, por isso não foi pego antes de testar em produção.

## 21. Estoque conectado ao backend real (contas novas começam vazias)

Usuário reportou "diversos cadastros de produtos que não consigo remover" — a tela de Estoque (`apps/web/features/catalog/catalog-content.tsx`) nunca tinha sido conectada ao backend real de Catálogo (que existe desde a Etapa 16.1): o `useState(MOCK_SKUS)` inicializava toda conta, de qualquer workspace, com os mesmos 8 produtos de demonstração fixos, "deletar" só filtrava o estado local (voltavam ao recarregar a página).

### 21.1 O que mudou

- **Backend**: `DELETE /catalog/skus/:id` (não existia — só create/update/list). Hard delete de verdade: seguro porque `OrderItem.sku` usa `onDelete: SetNull` (pedido já sincronizado preserva histórico, só perde o vínculo de custo daqui pra frente) e `ListingSku.sku` usa `onDelete: Cascade` (vínculo com anúncio some junto, correto).
- **Frontend**: `catalog-content.tsx` busca (`GET /catalog/skus`), cria (`POST`) e remove (`DELETE`) de verdade via `apps/web/features/catalog/api.ts` — `NewSkuDialog.onCreate` virou assíncrono (aguarda a API antes de fechar o diálogo, mostra erro sem fechar se falhar); exclusão é otimista (some da tela na hora, reverte se a API falhar) com confirmação nativa (`window.confirm`) antes.
- `LinkSkuPopover` (compartilhado com Pedidos e Anúncios, que continuam mockados) ganhou um prop opcional `skus` — o Estoque passa o catálogo real, os outros dois continuam usando `MOCK_SKUS` por padrão, sem quebrar nada.

### 21.2 O que continua mockado (de propósito, não descuido)

A aba "Anúncios sem SKU" dentro do Estoque continua usando `MOCK_LISTINGS` — não existe `GET /listings` no backend ainda (só a sincronização escreve na tabela `Listing`, ninguém lê pra fora). Os módulos Pedidos e Anúncios → Listagem/Catálogos/Rankeamento também continuam 100% mockados — escopo maior, fica pra uma etapa dedicada.

### 21.3 Verificação

`type-check`/`lint` limpos em `@hubwin/api` e `@hubwin/web`. Testado no navegador com conta nova: Estoque abre com "0 SKU(s) cadastrado(s)" e "Nenhum SKU cadastrado" (confirma o pedido do usuário — zerado por padrão); cadastrado 1 SKU de teste via "Novo SKU" → aparece na tabela; removido via botão de lixeira → some; **recarregada a página** → continua em 0 (confirma que é persistência real no Postgres, não só estado local em memória).

## 22. Landing page pública (antes da tela de login)

Antes desta etapa, `/` só existia como redirect — sem sessão, o `middleware.ts` já mandava direto pra `/login` antes de qualquer coisa renderizar. Pedido do usuário: uma página de apresentação com a cara da marca, benefícios, ganchos, e um CTA de teste grátis por tempo limitado (BETA), no estilo do concorrente "Hunter Spy" mas com identidade e copy própria da Órbita — mesmo espírito da Pontuação de Oportunidade (Etapa 18): inspirado no concorrente, não copiado dele.

### 22.1 `middleware.ts` — "/" vira rota pública

`isPublicPath` agora inclui `pathname === "/"` (igualdade exata, não `startsWith` — todo path começa com "/", então um `startsWith("/")` tornaria a checagem inútil, marcando tudo como público). Quem já tem sessão continua nunca vendo a landing: o segundo `if` do middleware já redireciona `hasSession && isPublicPath` pro dashboard, e isso vale pra "/" igual vale pra "/login".

### 22.2 `apps/web/features/marketing/landing-content.tsx`

Server Component só (sem `"use client"` — nada na página precisa de estado no cliente; o FAQ usa `<details>`/`<summary>` nativos em vez de um Accordion com JS). Seções: header fixo, hero com CTA duplo + uma prévia estilizada do dashboard (sem números carimbados como se fossem estatística real — só ilustra o layout), grid de 6 benefícios (puxados de features que EXISTEM de verdade no produto, não inventadas pra marketing), "como funciona" em 3 passos, um destaque específico pra Pontuação de Oportunidade (Etapa 18 — o gancho mais forte contra o Hunter Spy), seção de planos reaproveitando `MOCK_PLANS` de Configurações → Planos **literal, sem duplicar dados** (pedido explícito do usuário: "os planos serão iguais"), FAQ, CTA final com o gradiente da marca, e rodapé.

**Decisão deliberada de honestidade**: nenhum número de prova social inventado (nada de "+2.000 sellers", contador de clientes, depoimento fake) — o produto está genuinamente em BETA aberto sem base de usuários ainda, e fingir isso seria mentira na cara do visitante. A seção de planos já deixa claro que o teste é grátis e sem cartão, o que é verdade hoje (não existe cobrança real implementada em lugar nenhum do produto ainda — "Cobrança"/"Planos" em Configurações também são mockados).

### 22.3 Verificação

`type-check`/`lint` limpos. Testado no navegador: sessão de teste deslogada via `POST /auth/logout` (cookie httpOnly não dava pra limpar via `document.cookie` do JS, então usei o endpoint real), `/` renderiza a landing inteira (todas as 8 seções, os 3 planos com os preços reais de `MOCK_PLANS`, FAQ) sem nenhum erro no console. Sessão logada continua sendo redirecionada direto pro dashboard ao visitar "/", confirmando que o middleware não quebrou esse caminho.
