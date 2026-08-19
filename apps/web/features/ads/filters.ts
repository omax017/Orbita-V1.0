import { ALL_ACCOUNTS_ID, type PeriodSelection } from "@/components/filters/types";
import { buildPeriod } from "@/components/filters/period-utils";
import { MOCK_SKUS } from "@/features/catalog/mock-data";
import { isConfirmedSale } from "@/features/finance/filters";
import { MOCK_SALE_RECORDS } from "@/features/finance/mock-data";
import type { AdClassification, AdDailyMetric, AdHealthBucket, AdProductSummary, AdsKpis } from "./types";
import { AD_HEALTH_BUCKET_OF } from "./types";

const SALE_PRICE_MULTIPLIER = 2.4;

export interface AdsFilterState {
  period: PeriodSelection;
  accountId: string;
  skuQuery: string;
}

export function initialAdsFilters(): AdsFilterState {
  return { period: buildPeriod("30d"), accountId: ALL_ACCOUNTS_ID, skuQuery: "" };
}

function accountMatches(record: AdDailyMetric, accountId: string): boolean {
  if (accountId === ALL_ACCOUNTS_ID) return true;
  if (accountId === "acc_ml") return record.provider === "MERCADO_LIVRE";
  if (accountId === "acc_shopee") return record.provider === "SHOPEE";
  return true;
}

export function filterAdMetrics(records: AdDailyMetric[], filters: AdsFilterState): AdDailyMetric[] {
  return records.filter((r) => {
    if (r.date < filters.period.from || r.date > filters.period.to) return false;
    if (!accountMatches(r, filters.accountId)) return false;
    if (filters.skuQuery.trim()) {
      const q = filters.skuQuery.trim().toLowerCase();
      if (!r.skuCode?.toLowerCase().includes(q) && !r.productTitle.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

/** Margem de contribuição por unidade ANTES de Ads (mesma fórmula do módulo
 * Financeiro: preço = custo × 2.4, taxa 12%, frete líquido ~7.2%, imposto 6%)
 * — é o teto que o ACoS pode atingir antes do produto começar a dar prejuízo. */
function breakEvenAcosFor(costAmount: number, packagingCostAmount: number): number {
  const unitPrice = costAmount * SALE_PRICE_MULTIPLIER;
  if (unitPrice <= 0) return 0;
  const fee = unitPrice * 0.12;
  const shippingNet = unitPrice * 0.072;
  const tax = unitPrice * 0.06;
  const contributionMargin = unitPrice - costAmount - packagingCostAmount - fee - shippingNet - tax;
  return (contributionMargin / unitPrice) * 100;
}

function classify(acos: number, breakEvenAcos: number | null): AdClassification | null {
  if (breakEvenAcos === null || breakEvenAcos <= 0) return null;
  const ratio = acos / breakEvenAcos;
  if (ratio <= 0.6) return "Estrela";
  if (ratio <= 0.9) return "Moderado";
  if (ratio <= 1.0) return "Risco";
  return "Prejuízo";
}

export function summarizeAdProducts(records: AdDailyMetric[]): AdProductSummary[] {
  const groups = new Map<string, { skuCode: string | null; productTitle: string; investment: number; adsOrders: number; adsRevenue: number }>();

  for (const r of records) {
    const key = r.skuCode ?? r.productTitle;
    const existing = groups.get(key);
    if (existing) {
      existing.investment += r.investment;
      existing.adsOrders += r.adsOrders;
      existing.adsRevenue += r.adsRevenue;
    } else {
      groups.set(key, { skuCode: r.skuCode, productTitle: r.productTitle, investment: r.investment, adsOrders: r.adsOrders, adsRevenue: r.adsRevenue });
    }
  }

  return Array.from(groups.values()).map((g) => {
    const sku = MOCK_SKUS.find((s) => s.code === g.skuCode);
    const hasCostLinked = !!sku;
    const roas = g.investment > 0 ? g.adsRevenue / g.investment : 0;
    const acos = g.adsRevenue > 0 ? (g.investment / g.adsRevenue) * 100 : 0;
    const breakEvenAcos = sku ? breakEvenAcosFor(sku.costAmount, sku.packagingCostAmount) : null;
    const contributionMarginPercent = breakEvenAcos;
    const profitAfterAds = contributionMarginPercent !== null ? (contributionMarginPercent / 100) * g.adsRevenue - g.investment : null;
    const roiAfterAds = profitAfterAds !== null && g.investment > 0 ? (profitAfterAds / g.investment) * 100 : null;
    const marginAfterAds = profitAfterAds !== null && g.adsRevenue > 0 ? (profitAfterAds / g.adsRevenue) * 100 : null;

    return {
      skuCode: g.skuCode,
      productTitle: g.productTitle,
      hasCostLinked,
      investment: g.investment,
      adsOrders: g.adsOrders,
      adsRevenue: g.adsRevenue,
      roas,
      acos,
      breakEvenAcos,
      profitAfterAds,
      roiAfterAds,
      marginAfterAds,
      classification: classify(acos, breakEvenAcos),
    };
  });
}

export function healthBucketOf(summary: AdProductSummary): AdHealthBucket | null {
  if (!summary.classification) return null;
  return AD_HEALTH_BUCKET_OF[summary.classification];
}

/** TACoS usa a receita TOTAL da loja (não só a atribuída a Ads) — por isso
 * cruza com o Financeiro em vez de somar `adsRevenue`. */
export function computeAdsKpis(records: AdDailyMetric[], products: AdProductSummary[], period: PeriodSelection): AdsKpis {
  const investment = records.reduce((s, r) => s + r.investment, 0);
  const adsRevenue = records.reduce((s, r) => s + r.adsRevenue, 0);
  const roas = investment > 0 ? adsRevenue / investment : 0;
  const acos = adsRevenue > 0 ? (investment / adsRevenue) * 100 : 0;

  const linked = products.filter((p) => p.hasCostLinked);
  const profitFromAds = linked.reduce((s, p) => s + (p.profitAfterAds ?? 0), 0);
  const roiAfterAdsPercent = investment > 0 ? (profitFromAds / investment) * 100 : 0;
  const breakEvenAcos =
    linked.length > 0
      ? linked.reduce((s, p) => s + (p.breakEvenAcos ?? 0) * p.adsRevenue, 0) / Math.max(1, linked.reduce((s, p) => s + p.adsRevenue, 0))
      : 0;

  const storeRevenue = MOCK_SALE_RECORDS.filter(
    (r) => r.date >= period.from && r.date <= period.to && isConfirmedSale(r),
  ).reduce((s, r) => s + r.revenue, 0);
  const tacosPercent = storeRevenue > 0 ? (investment / storeRevenue) * 100 : 0;

  return { profitFromAds, roiAfterAdsPercent, adsRevenue, investment, roas, acos, breakEvenAcos, tacosPercent };
}

const DAY_LABEL = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

export function buildAdsDailySeries(records: AdDailyMetric[]) {
  const byDay = new Map<string, { date: string; investment: number; adsRevenue: number; profit: number }>();

  for (const r of records) {
    const sku = MOCK_SKUS.find((s) => s.code === r.skuCode);
    const breakEven = sku ? breakEvenAcosFor(sku.costAmount, sku.packagingCostAmount) : null;
    const profit = breakEven !== null ? (breakEven / 100) * r.adsRevenue - r.investment : -r.investment;

    const key = r.date.toISOString().slice(0, 10);
    const label = DAY_LABEL.format(r.date);
    const existing = byDay.get(key);
    if (existing) {
      existing.investment += r.investment;
      existing.adsRevenue += r.adsRevenue;
      existing.profit += profit;
    } else {
      byDay.set(key, { date: label, investment: r.investment, adsRevenue: r.adsRevenue, profit });
    }
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, point]) => point);
}
