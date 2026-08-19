# Identidade Visual — Proposta

## 1. Por que fugir do laranja (e do quê mais)

O concorrente (Hunter Hub) usa: **fundo dark quase preto + laranja vibrante como única cor de destaque** + um ícone de escudo/hexágono como marca. Para não parecer "clone", a proposta muda três coisas ao mesmo tempo — não só a cor:

1. **Cor de destaque**: sai o laranja monocromático, entra um **duotone Índigo → Ciano** (gradiente), que é a linguagem visual mais associada hoje a produtos de dados/IA/SaaS modernos (Linear, Vercel, Stripe, ferramentas de analytics em geral) — e não tem nenhuma leitura de "concorrente direto".
2. **Metáfora da marca**: o nome/ícone do concorrente remete a "caça" (Hunter = caçador). Proponho trocar para uma metáfora de **clareza e controle** (órbita/pulso/bússola) — o produto existe pra você *enxergar* o que já vende, não "caçar" oportunidades. Isso também evita qualquer semelhança conceitual de marca.
3. **Textura visual**: gradiente + cantos mais arredondados + glow sutil no lugar de blocos sólidos de cor chapada — dá uma sensação mais "software 2025" do que "utilitário".

## 2. Direções de nome (escolha uma, ou use como ponto de partida)

| Nome | Por quê funciona |
|---|---|
| **Órbita** *(recomendado)* | Cada marketplace conectado é um "satélite" orbitando um hub central. Gera um logotipo natural (anel/órbita), curto, fácil de falar, sem concorrência direta de marca no nicho. |
| **Pulsa** | Remete ao "pulso do negócio" — dado em tempo real, monitoramento contínuo. Bom para posicionamento "dashboard vivo". |
| **Nortia** | Remete a "norte/bússola" — o produto te dá direção/clareza de decisão. Soa mais corporativo/sério. |

O restante deste documento assume **Órbita**, mas a paleta e o sistema de componentes funcionam com qualquer um dos três (só troca o ícone).

## 3. Paleta de cores (validada para contraste e daltonismo)

> Testei as combinações abaixo com um validador de acessibilidade (contraste, separação para daltonismo protan/deutan/tritan e leitura em fundo claro/escuro) — não é só "olho estético", passou em checagem técnica.

### Marca (uso em CTAs, ícone, gráficos de identidade)

| Token | Dark mode | Light mode | Uso |
|---|---|---|---|
| `brand.primary` (Índigo) | `#6659FF` | `#6659FF` | Cor primária: botão de ação, logotipo, links, foco |
| `brand.secondary` (Ciano/Petróleo) | `#0891A6` | `#0891A6` | Parceira do gradiente, segunda série em gráficos, ícones secundários |
| `brand.tertiary` (Rosa) | `#EC4899` | `#EC4899` | Terceira série de gráfico quando necessário (nunca como cor principal) |

Gradiente de marca (logo, hero, botão primário em destaque): `linear-gradient(135deg, #6659FF 0%, #0891A6 100%)`.

### Neutros / superfícies

| Token | Dark mode | Light mode |
|---|---|---|
| `bg.base` | `#0A0B10` | `#FFFFFF` |
| `bg.surface-1` | `#14151C` | `#F7F7FA` |
| `bg.surface-2` | `#1B1D28` | `#EFEFF5` |
| `border` | `#2A2C3B` | `#E2E2EA` |
| `text.primary` | `#F5F6FA` | `#14151C` |
| `text.secondary` | `#A6A8B8` | `#55576B` |
| `text.muted` | `#6E7086` | `#8A8CA0` |

### Status (sempre acompanhado de ícone + texto, nunca só a cor)

| Token | Dark mode | Light mode | Uso |
|---|---|---|---|
| `status.good` | `#30A46C` | `#1D8A5A` | Lucro, meta batida, "ganhando" |
| `status.warning` | `#C08109` | `#9A6600` | Atenção, margem apertada |
| `status.critical` | `#E23F6B` | `#C22458` | Prejuízo, "perdendo", erro |

> Nota: manter amber/vermelho para alerta é convenção universal de UI (semáforo), independe da marca — o que muda é que essas cores **nunca** aparecem soltas como identidade visual do produto, só dentro de badges/ícones de status.

## 4. Tipografia

- **Títulos e números grandes de KPI:** `Space Grotesk` (600/700) — geométrica, um pouco excêntrica, dá o ar "moderno/tech" sem parecer fria.
- **Corpo de texto, tabelas, formulários:** `Inter` (400/500) — altíssima legibilidade em telas densas de dado.
- **Números tabulares** (valores monetários, percentuais em tabela): usar `font-variant-numeric: tabular-nums` para alinhar colunas.

## 5. Logotipo (conceito)

Marca: um **anel de órbita incompleto** (elipse aberta, ~280°) com um pequeno "satélite" (ponto) pousado sobre o traço, ambos em gradiente Índigo → Ciano. Ao lado, o nome em `Space Grotesk`, minúsculo, peso 600, tracking levemente negativo.

- Versão ícone isolado (favicon, avatar, app mobile): só o anel + satélite.
- Versão horizontal (header do produto): ícone + nome.
- Nunca usar o ícone sozinho sem o "satélite" — é o que dá identidade ao anel (sem ele vira só um círculo genérico).
- Área de proteção mínima: altura do "satélite" livre de qualquer elemento ao redor.
- Não usar sobre fundos que não sejam `bg.base`/`bg.surface-1` ou branco puro — o gradiente perde contraste em fundos coloridos.

## 6. Voz e tom

Direto, orientado a ação, sem jargão técnico desnecessário — igual ao padrão observado no concorrente, mas com uma pitada a mais de "copiloto" (ex.: "Vamos organizar seus custos primeiro" em vez de "Cadastre seu primeiro SKU"). Evitar tom "vendedor"/hype; o produto lida com dinheiro real do lojista, então a confiança visual (dados claros, sem excesso de efeito) importa mais que o impacto estético.

---

Anexo a este documento: um **brand board interativo** (HTML) com a paleta, tipografia, logotipo e os componentes de UI já aplicados (cards de KPI, gráfico, badges, tabela) para você visualizar tudo junto, em dark e light mode.
