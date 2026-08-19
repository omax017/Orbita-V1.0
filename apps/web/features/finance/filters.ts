import { ALL_ACCOUNTS_ID, type PeriodSelection } from "@/components/filters/types";
import { buildPeriod } from "@/components/filters/period-utils";
import type { OrderStatus } from "@/features/orders/types";
import type { SaleRecord } from "./types";

export interface ResumoFilterState {
  period: PeriodSelection;
  title: string;
  skuQuery: string;
  statuses: Set<OrderStatus>;
  accountId: string;
}

export function initialResumoFilters(): ResumoFilterState {
  return {
    period: buildPeriod("30d"),
    title: "",
    skuQuery: "",
    statuses: new Set(),
    accountId: ALL_ACCOUNTS_ID,
  };
}

function accountMatches(record: SaleRecord, accountId: string): boolean {
  if (accountId === ALL_ACCOUNTS_ID) return true;
  if (accountId === "acc_ml") return record.provider === "MERCADO_LIVRE";
  if (accountId === "acc_shopee") return record.provider === "SHOPEE";
  return true;
}

const CONFIRMED_STATUSES: OrderStatus[] = ["PAID", "IN_PREPARATION", "SHIPPED", "DELIVERED"];

export function isConfirmedSale(record: SaleRecord): boolean {
  return CONFIRMED_STATUSES.includes(record.status);
}

export function filterSaleRecords(records: SaleRecord[], filters: ResumoFilterState): SaleRecord[] {
  return records.filter((record) => {
    if (record.date < filters.period.from || record.date > filters.period.to) return false;
    if (!accountMatches(record, filters.accountId)) return false;
    if (filters.statuses.size > 0 && !filters.statuses.has(record.status)) return false;

    if (filters.title.trim()) {
      if (!record.title.toLowerCase().includes(filters.title.trim().toLowerCase())) return false;
    }
    if (filters.skuQuery.trim()) {
      if (!record.skuCode?.toLowerCase().includes(filters.skuQuery.trim().toLowerCase())) return false;
    }

    return true;
  });
}

export interface ResumoSummary {
  grossSales: number;
  revenue: number;
  avgTicket: number;
  totalCosts: number;
  netProfit: number;
  netProfitPercent: number;
  netProfitAfterAdsPercent: number;
}

export function summarizeResumo(records: SaleRecord[], adSpend: number): ResumoSummary {
  const confirmed = records.filter(isConfirmedSale);
  const grossSales = confirmed.length;
  const revenue = confirmed.reduce((sum, r) => sum + r.revenue, 0);
  const totalCosts = confirmed.reduce(
    (sum, r) => sum + r.feeAmount + r.shippingAmount - r.shippingBonus + r.packagingCostAmount + r.taxAmount + r.costAmount,
    0,
  );
  const netProfit = confirmed.reduce((sum, r) => sum + r.netProfit, 0);
  const netProfitAfterAds = netProfit - adSpend;

  return {
    grossSales,
    revenue,
    avgTicket: grossSales > 0 ? revenue / grossSales : 0,
    totalCosts,
    netProfit,
    netProfitPercent: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    netProfitAfterAdsPercent: revenue > 0 ? (netProfitAfterAds / revenue) * 100 : 0,
  };
}

/** Projeção simples do mês: extrapola a média diária do período pros dias restantes do mês corrente. */
export function projectMonthRevenue(records: SaleRecord[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startOfMonth.getTime()) / 86_400_000));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const monthRecords = records.filter((r) => r.date >= startOfMonth && isConfirmedSale(r));
  const monthRevenue = monthRecords.reduce((sum, r) => sum + r.revenue, 0);
  const dailyAvg = monthRevenue / daysElapsed;

  return Math.round(dailyAvg * daysInMonth);
}

export function comparePeriod(records: SaleRecord[], period: PeriodSelection, adSpend: number) {
  const previous = records.filter(
    (r) => r.date >= period.previousFrom && r.date <= period.previousTo,
  );
  return summarizeResumo(previous, adSpend);
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export { percentChange };

const DAY_LABEL = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

export function buildDailySeries(records: SaleRecord[]) {
  const byDay = new Map<string, { date: string; revenue: number; profit: number; orders: number }>();

  for (const record of records.filter(isConfirmedSale)) {
    const key = record.date.toISOString().slice(0, 10);
    const label = DAY_LABEL.format(record.date);
    const existing = byDay.get(key);
    if (existing) {
      existing.revenue += record.revenue;
      existing.profit += record.netProfit;
      existing.orders += 1;
    } else {
      byDay.set(key, { date: label, revenue: record.revenue, profit: record.netProfit, orders: 1 });
    }
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, point]) => point);
}

export function buildCostComposition(records: SaleRecord[]) {
  const confirmed = records.filter(isConfirmedSale);
  const fees = confirmed.reduce((s, r) => s + r.feeAmount, 0);
  const shipping = confirmed.reduce((s, r) => s + r.shippingAmount - r.shippingBonus, 0);
  const profit = confirmed.reduce((s, r) => s + r.netProfit, 0);
  return { fees, shipping: Math.max(0, shipping), profit: Math.max(0, profit) };
}
