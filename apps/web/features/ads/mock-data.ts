import { MOCK_SKUS } from "@/features/catalog/mock-data";
import type { AdDailyMetric } from "./types";

/** Mesmo multiplicador usado em features/finance/mock-data.ts — pro preço de
 * venda bater entre os dois módulos (mesmos produtos, mesma margem). */
const SALE_PRICE_MULTIPLIER = 2.4;

const PROVIDERS = [
  { provider: "MERCADO_LIVRE" as const, accountLabel: "Loja da Maria · Mercado Livre" },
  { provider: "SHOPEE" as const, accountLabel: "Loja da Maria · Shopee" },
];

// 60 dias — cobre os períodos do PeriodSelector (7d/30d) com folga pra
// comparação, sem precisar dos 13 meses do Financeiro (Ads não tem DRE anual aqui).
const HISTORY_DAYS = 60;

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

/** Mesma fórmula de `breakEvenAcosFor` em features/ads/filters.ts — duplicada
 * aqui (não importada) porque o mock precisa dela pra GERAR um ACoS realista
 * por produto, e importar a versão "de leitura" de filters.ts criaria uma
 * dependência circular (filters.ts consome este arquivo). */
function breakEvenAcosFor(costAmount: number, packagingCostAmount: number): number {
  const unitPrice = costAmount * SALE_PRICE_MULTIPLIER;
  if (unitPrice <= 0) return 0;
  const fee = unitPrice * 0.12;
  const shippingNet = unitPrice * 0.072;
  const tax = unitPrice * 0.06;
  const contributionMargin = unitPrice - costAmount - packagingCostAmount - fee - shippingNet - tax;
  return (contributionMargin / unitPrice) * 100;
}

/** Produto extra que roda Ads mas não tem SKU/custo vinculado — dispara o
 * alerta "produtos com Ads sem custo vinculado", igual ao caso de "anúncios
 * sem SKU" já existente em Anúncios/Estoque (Etapa 5). */
const UNLINKED_AD_PRODUCT = { title: "Varal de Parede Retrátil (anúncio novo)", skuCode: null };

/** Fator fixo (não aleatório) por posição do produto — garante que a demo
 * mostre as 4 classificações (Estrela/Moderado/Risco/Prejuízo) em vez de
 * deixar ao acaso com só 8 produtos. ACoS realizado = break-even × fator. */
const PERFORMANCE_FACTORS = [0.35, 0.55, 0.75, 0.85, 0.95, 1.1, 1.3, 1.6];

function buildAdDailyMetrics(): AdDailyMetric[] {
  const records: AdDailyMetric[] = [];
  const now = new Date();

  const products = [
    ...MOCK_SKUS.map((sku, i) => ({
      title: sku.name,
      skuCode: sku.code,
      breakEvenAcos: breakEvenAcosFor(sku.costAmount, sku.packagingCostAmount),
      performanceFactor: PERFORMANCE_FACTORS[i % PERFORMANCE_FACTORS.length]!,
      unitPrice: Math.round(sku.costAmount * SALE_PRICE_MULTIPLIER * 100) / 100,
    })),
    { ...UNLINKED_AD_PRODUCT, breakEvenAcos: null, performanceFactor: 1, unitPrice: 45 },
  ];

  for (let dayOffset = 0; dayOffset < HISTORY_DAYS; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(10, 0, 0, 0);

    for (const product of products) {
      const key = product.skuCode ?? "unlinked";
      const daySeed = `ads-${key}-${dayOffset}`;
      // Seed própria (não `daySeed` puro) pro check de "roda Ads hoje": o
      // hash multiplicativo simples produz sequências quase lineares pra
      // certos prefixos (ex.: "ads-unlinked-0..59" ficava sempre abaixo do
      // limiar, zerando o produto sem SKU inteiro) — sufixo extra quebra o padrão.
      const runsAds = seededRandom(`${daySeed}-run`) > 0.35; // ~65% de chance de ter investimento nesse dia
      if (!runsAds) continue;

      const providerPick = PROVIDERS[Math.floor(seededRandom(`${daySeed}-prov`) * PROVIDERS.length)]!;
      const investment = Math.round((15 + seededRandom(`${daySeed}-inv`) * 45) * 100) / 100;

      // ACoS do dia = break-even do produto × fator de desempenho, com um
      // pouco de ruído diário — sem break-even (produto sem custo), assume
      // um ACoS "neutro" fixo de 30% só pra gerar algum número plausível.
      const noise = 0.85 + seededRandom(`${daySeed}-noise`) * 0.3;
      const targetAcos = (product.breakEvenAcos ?? 30) * product.performanceFactor * noise;
      const adsRevenue = targetAcos > 0 ? Math.round((investment / (targetAcos / 100)) * 100) / 100 : 0;
      const adsOrders = Math.max(0, Math.round(adsRevenue / product.unitPrice));

      records.push({
        date,
        skuCode: product.skuCode,
        productTitle: product.title,
        provider: providerPick.provider,
        accountLabel: providerPick.accountLabel,
        investment,
        adsRevenue,
        adsOrders,
      });
    }
  }

  return records.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const MOCK_AD_DAILY_METRICS: AdDailyMetric[] = buildAdDailyMetrics();
