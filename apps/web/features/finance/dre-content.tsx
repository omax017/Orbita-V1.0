"use client";

import { useMemo, useState } from "react";
import { Download, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/export-csv";
import { MOCK_MOVEMENTS, MOCK_SALE_RECORDS, mockAdSpendForMonth } from "./mock-data";
import { buildMonthlyDreHistory, computeDre, shiftMonth } from "./dre";
import { percentChange } from "./filters";
import { MonthNavigator } from "./components/month-navigator";
import { DreMonthlyChart } from "./components/dre-monthly-chart";
import { DreStatement } from "./components/dre-statement";

export function DreContent() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [includeMovements, setIncludeMovements] = useState(true);

  const adSpend = useMemo(() => mockAdSpendForMonth(), []);

  const dre = useMemo(
    () => computeDre(MOCK_SALE_RECORDS, MOCK_MOVEMENTS, adSpend, year, month, includeMovements),
    [year, month, includeMovements, adSpend],
  );

  const previous = useMemo(() => {
    const prev = shiftMonth(year, month, -1);
    return computeDre(MOCK_SALE_RECORDS, MOCK_MOVEMENTS, adSpend, prev.year, prev.month, includeMovements);
  }, [year, month, includeMovements, adSpend]);

  const history = useMemo(
    () => buildMonthlyDreHistory(MOCK_SALE_RECORDS, MOCK_MOVEMENTS, adSpend),
    [adSpend],
  );

  function goPrev() {
    const { year: y, month: m } = shiftMonth(year, month, -1);
    setYear(y);
    setMonth(m);
  }

  function goNext() {
    const { year: y, month: m } = shiftMonth(year, month, 1);
    setYear(y);
    setMonth(m);
  }

  function handleExport() {
    exportRowsToCsv(
      "dre",
      ["Linha", "Valor"],
      dre.lines.map((line) => [line.label, formatCurrency(line.value)]),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Análise DRE</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Demonstrativo de Resultado do Exercício</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthNavigator year={year} month={month} onPrev={goPrev} onNext={goNext} />
          <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={includeMovements}
              onChange={(e) => setIncludeMovements(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Movimentações incluídas
          </label>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={ShoppingCart}
          label="Vendas brutas"
          value={String(dre.grossSales)}
          changePercent={percentChange(dre.grossSales, previous.grossSales)}
        />
        <KpiCard
          icon={ShoppingCart}
          label="Vendas confirmadas"
          value={String(dre.confirmedSales)}
          changePercent={percentChange(dre.confirmedSales, previous.confirmedSales)}
        />
        <KpiCard
          icon={Wallet}
          label="Margem de contribuição"
          value={formatPercent(dre.contributionMarginPercent)}
          changePercent={percentChange(dre.contributionMarginPercent, previous.contributionMarginPercent)}
        />
        <KpiCard
          icon={TrendingUp}
          label="Lucro líquido"
          value={formatCurrency(dre.netProfit)}
          changePercent={percentChange(dre.netProfit, previous.netProfit)}
        />
      </div>

      <DreMonthlyChart data={history} />

      <DreStatement lines={dre.lines} />
    </div>
  );
}
