"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, Percent, Receipt, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { MOCK_SALE_RECORDS, mockAdSpendForMonth } from "./mock-data";
import {
  buildCostComposition,
  buildDailySeries,
  comparePeriod,
  filterSaleRecords,
  initialResumoFilters,
  percentChange,
  projectMonthRevenue,
  summarizeResumo,
  type ResumoFilterState,
} from "./filters";
import { DailyEvolutionChart } from "./components/daily-evolution-chart";
import { CostCompositionDonut } from "./components/cost-composition-donut";
import { ResumoFilters } from "./components/resumo-filters";
import { salesTableColumns } from "./components/sales-table-columns";

export function ResumoContent() {
  const [filters, setFilters] = useState<ResumoFilterState>(initialResumoFilters);
  const adSpend = useMemo(() => mockAdSpendForMonth(), []);

  const filtered = useMemo(() => filterSaleRecords(MOCK_SALE_RECORDS, filters), [filters]);
  const summary = useMemo(() => summarizeResumo(filtered, adSpend), [filtered, adSpend]);
  const previousSummary = useMemo(
    () => comparePeriod(MOCK_SALE_RECORDS, filters.period, adSpend),
    [filters.period, adSpend],
  );
  const dailySeries = useMemo(() => buildDailySeries(filtered), [filtered]);
  const costComposition = useMemo(() => buildCostComposition(filtered), [filtered]);
  const projectedRevenue = useMemo(() => projectMonthRevenue(MOCK_SALE_RECORDS), []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resumo Financeiro</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Comparado com {filters.period.label.toLowerCase()} anterior · Projeção do mês:{" "}
            <span className="font-medium text-foreground">{formatCurrency(projectedRevenue)}</span>
          </p>
        </div>
      </div>

      <ResumoFilters filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={ShoppingCart}
          label="Vendas brutas"
          value={String(summary.grossSales)}
          changePercent={percentChange(summary.grossSales, previousSummary.grossSales)}
          hint="pedidos confirmados"
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Receita"
          value={formatCurrency(summary.revenue)}
          changePercent={percentChange(summary.revenue, previousSummary.revenue)}
        />
        <KpiCard
          icon={Receipt}
          label="Ticket médio"
          value={formatCurrency(summary.avgTicket)}
          changePercent={percentChange(summary.avgTicket, previousSummary.avgTicket)}
        />
        <KpiCard
          icon={Wallet}
          label="Custos totais"
          value={formatCurrency(summary.totalCosts)}
          changePercent={percentChange(summary.totalCosts, previousSummary.totalCosts)}
          hint="taxas + frete + embalagem + imposto + produto"
        />
        <KpiCard
          icon={TrendingUp}
          label="Lucro líquido"
          value={`${formatCurrency(summary.netProfit)} (${formatPercent(summary.netProfitPercent)})`}
          changePercent={percentChange(summary.netProfit, previousSummary.netProfit)}
        />
        <KpiCard
          icon={Percent}
          label="Lucro pós-Ads"
          value={formatPercent(summary.netProfitAfterAdsPercent)}
          changePercent={percentChange(summary.netProfitAfterAdsPercent, previousSummary.netProfitAfterAdsPercent)}
          hint="considerando gasto com Ads do mês"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyEvolutionChart data={dailySeries} />
        </div>
        <CostCompositionDonut data={costComposition} />
      </div>

      <DataTable
        columns={salesTableColumns}
        data={filtered}
        exportFilename="resumo-financeiro"
        emptyState={{ icon: Receipt, title: "Nenhuma venda no período" }}
      />
    </div>
  );
}
