import { MOCK_SKUS } from "@/features/catalog/mock-data";
import { isConfirmedSale } from "./filters";
import type { AbcClass, AbcMetric, AbcProduct, AbcRankedProduct, SaleRecord } from "./types";

function groupByProduct(records: SaleRecord[]): AbcProduct[] {
  const groups = new Map<string, AbcProduct>();

  for (const record of records.filter(isConfirmedSale)) {
    const key = record.skuCode ?? record.title;
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += record.quantity;
      existing.revenue += record.revenue;
      existing.netProfit += record.netProfit;
    } else {
      groups.set(key, {
        title: record.title,
        skuCode: record.skuCode,
        quantity: record.quantity,
        revenue: record.revenue,
        netProfit: record.netProfit,
        avgTicket: 0,
        turnover: 0,
      });
    }
  }

  return Array.from(groups.values()).map((product) => {
    const sku = MOCK_SKUS.find((s) => s.code === product.skuCode);
    const stock = sku ? sku.stockLocal + sku.stockFull : 0;
    return {
      ...product,
      avgTicket: product.quantity > 0 ? product.revenue / product.quantity : 0,
      turnover: stock > 0 ? Math.round((product.quantity / stock) * 100) / 100 : product.quantity > 0 ? 99 : 0,
    };
  });
}

function metricValueOf(product: AbcProduct, metric: AbcMetric): number {
  if (metric === "revenue") return product.revenue;
  if (metric === "quantity") return product.quantity;
  return product.netProfit;
}

function classify(cumulativePercent: number): AbcClass {
  if (cumulativePercent <= 80) return "A";
  if (cumulativePercent <= 95) return "B";
  return "C";
}

export function buildAbcRanking(records: SaleRecord[], metric: AbcMetric): AbcRankedProduct[] {
  const products = groupByProduct(records);
  const sorted = [...products].sort((a, b) => metricValueOf(b, metric) - metricValueOf(a, metric));
  const total = sorted.reduce((sum, p) => sum + Math.max(0, metricValueOf(p, metric)), 0);

  let cumulative = 0;
  return sorted.map((product, index) => {
    const value = Math.max(0, metricValueOf(product, metric));
    const individualPercent = total > 0 ? (value / total) * 100 : 0;
    cumulative += individualPercent;
    return {
      ...product,
      position: index + 1,
      metricValue: value,
      individualPercent,
      cumulativePercent: Math.min(100, cumulative),
      abcClass: classify(cumulative),
    };
  });
}

export interface AbcClassSummary {
  abcClass: AbcClass;
  productCount: number;
  valueShare: number;
}

export function summarizeAbcClasses(ranking: AbcRankedProduct[]): AbcClassSummary[] {
  return (["A", "B", "C"] as const).map((abcClass) => {
    const items = ranking.filter((p) => p.abcClass === abcClass);
    return {
      abcClass,
      productCount: items.length,
      valueShare: items.reduce((sum, p) => sum + p.individualPercent, 0),
    };
  });
}
