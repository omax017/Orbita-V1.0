import { isConfirmedSale } from "./filters";
import type { FinancialMovementRecord, SaleRecord } from "./types";

export interface DreLine {
  label: string;
  value: number;
  kind: "line" | "subtotal" | "total";
}

export interface DreResult {
  grossSales: number;
  confirmedSales: number;
  revenue: number;
  contributionMarginPercent: number;
  netProfit: number;
  lines: DreLine[];
}

function inMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/**
 * Cascata do DRE. Nota: o pedido original listava "(–) Custo de Anúncios"
 * antes de "= Lucro antes de Ads", o que não fecha (não dava pra chamar de
 * "antes de Ads" já tendo subtraído Ads) — o cálculo abaixo corrige a ordem:
 * Lucro antes de Ads é o subtotal ANTES de deduzir Ads, e só então chega no
 * Lucro Líquido. Ver ARCHITECTURE.md.
 *
 * "Movimentações incluídas" desligado tira tudo que vem de
 * FinancialMovement manual — Despesas Operacionais, Custos Fixos e Custo de
 * Anúncios (Ads também é um FinancialMovementType no schema), deixando só o
 * que vem direto da sincronização de pedidos.
 */
export function computeDre(
  records: SaleRecord[],
  movements: FinancialMovementRecord[],
  adSpend: number,
  year: number,
  month: number,
  includeMovements: boolean,
): DreResult {
  const monthRecords = records.filter((r) => inMonth(r.date, year, month));
  const confirmed = monthRecords.filter(isConfirmedSale);
  const returned = monthRecords.filter((r) => r.status === "RETURNED");

  const revenue = confirmed.reduce((s, r) => s + r.revenue, 0);
  const fees = confirmed.reduce((s, r) => s + r.feeAmount, 0);
  const shipping = confirmed.reduce((s, r) => s + r.shippingAmount, 0);
  const shippingBonus = confirmed.reduce((s, r) => s + r.shippingBonus, 0);
  const netReceived = revenue - fees - shipping + shippingBonus;

  const refunds = returned.reduce((s, r) => s + r.revenue, 0);
  const productCost = confirmed.reduce((s, r) => s + r.costAmount, 0);
  const packagingCost = confirmed.reduce((s, r) => s + r.packagingCostAmount, 0);
  const tax = confirmed.reduce((s, r) => s + r.taxAmount, 0);
  const grossProfit = netReceived - refunds - productCost - packagingCost - tax;

  const monthMovements = movements.filter((m) => inMonth(m.date, year, month));
  const operatingCosts = includeMovements
    ? -monthMovements.filter((m) => m.category === "Custo Operacional").reduce((s, m) => s + m.amount, 0)
    : 0;
  const fixedCosts = includeMovements
    ? -monthMovements.filter((m) => m.category === "Custo Fixo").reduce((s, m) => s + m.amount, 0)
    : 0;
  const profitBeforeAds = grossProfit - operatingCosts - fixedCosts;
  const adSpendValue = includeMovements ? adSpend : 0;
  const netProfit = profitBeforeAds - adSpendValue;

  const lines: DreLine[] = [
    { label: "Receita Confirmada", value: revenue, kind: "line" },
    { label: "Taxas de Marketplace", value: -fees, kind: "line" },
    { label: "Frete pago pelo vendedor", value: -shipping, kind: "line" },
    { label: "Bônus de frete", value: shippingBonus, kind: "line" },
    { label: "Valor Líquido Recebido", value: netReceived, kind: "subtotal" },
    { label: "Devoluções", value: -refunds, kind: "line" },
    { label: "Custo dos Produtos", value: -productCost, kind: "line" },
    { label: "Custo de Embalagem", value: -packagingCost, kind: "line" },
    { label: "Impostos", value: -tax, kind: "line" },
    { label: "Lucro Bruto", value: grossProfit, kind: "subtotal" },
    { label: "Despesas Operacionais", value: -operatingCosts, kind: "line" },
    { label: "Custos Fixos", value: -fixedCosts, kind: "line" },
    { label: "Lucro antes de Ads", value: profitBeforeAds, kind: "subtotal" },
    { label: "Custo de Anúncios", value: -adSpendValue, kind: "line" },
    { label: "LUCRO LÍQUIDO", value: netProfit, kind: "total" },
  ];

  return {
    grossSales: monthRecords.length,
    confirmedSales: confirmed.length,
    revenue,
    contributionMarginPercent: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    netProfit,
    lines,
  };
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export function formatMonthLabel(year: number, month: number): string {
  const label = MONTH_LABEL.format(new Date(year, month, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Últimos 12 meses de receita/lucro — pro gráfico de evolução mensal do DRE. */
export function buildMonthlyDreHistory(
  records: SaleRecord[],
  movements: FinancialMovementRecord[],
  adSpend: number,
): Array<{ month: string; revenue: number; profit: number }> {
  const now = new Date();
  const points: Array<{ month: string; revenue: number; profit: number }> = [];

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const result = computeDre(records, movements, adSpend, date.getFullYear(), date.getMonth(), true);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
    points.push({
      month: label.charAt(0).toUpperCase() + label.slice(1),
      revenue: result.revenue,
      profit: result.netProfit,
    });
  }

  return points;
}
