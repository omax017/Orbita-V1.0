"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, Gauge, Megaphone, Percent, Target, TrendingUp, Wallet } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { MOCK_AD_DAILY_METRICS } from "./mock-data";
import {
  buildAdsDailySeries,
  computeAdsKpis,
  filterAdMetrics,
  healthBucketOf,
  initialAdsFilters,
  summarizeAdProducts,
  type AdsFilterState,
} from "./filters";
import type { AdHealthBucket } from "./types";
import { AdsFilters } from "./components/ads-filters";
import { NoCostAlert } from "./components/no-cost-alert";
import { ProductHealthPanel } from "./components/product-health-panel";
import { AdsDailyChart } from "./components/ads-daily-chart";
import { adsTableColumns } from "./components/ads-table-columns";

export function AdsContent() {
  const [filters, setFilters] = useState<AdsFilterState>(initialAdsFilters);
  const [healthFilter, setHealthFilter] = useState<AdHealthBucket | null>(null);

  const filtered = useMemo(() => filterAdMetrics(MOCK_AD_DAILY_METRICS, filters), [filters]);
  const products = useMemo(() => summarizeAdProducts(filtered), [filtered]);
  const kpis = useMemo(() => computeAdsKpis(filtered, products, filters.period), [filtered, products, filters.period]);
  const dailySeries = useMemo(() => buildAdsDailySeries(filtered), [filtered]);

  const noCostProducts = useMemo(() => products.filter((p) => !p.hasCostLinked), [products]);
  const noCostInvestment = useMemo(() => noCostProducts.reduce((s, p) => s + p.investment, 0), [noCostProducts]);

  const healthCounts = useMemo(() => {
    const counts: Record<AdHealthBucket, number> = { Lucrativo: 0, "Em risco": 0, Prejuízo: 0 };
    for (const p of products) {
      const bucket = healthBucketOf(p);
      if (bucket) counts[bucket] += 1;
    }
    return counts;
  }, [products]);

  const tableRows = useMemo(() => {
    if (!healthFilter) return products;
    return products.filter((p) => healthBucketOf(p) === healthFilter);
  }, [products, healthFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Publicidade</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Desempenho de Ads por produto — {filters.period.label.toLowerCase()}</p>
      </div>

      <AdsFilters filters={filters} onChange={setFilters} />

      <NoCostAlert count={noCostProducts.length} investmentAffected={noCostInvestment} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} label="Lucro por Ads" value={formatCurrency(kpis.profitFromAds)} hint="produtos com custo vinculado" />
        <KpiCard icon={Gauge} label="ROI pós-Ads" value={formatPercent(kpis.roiAfterAdsPercent)} />
        <KpiCard icon={CircleDollarSign} label="Receita de Ads" value={formatCurrency(kpis.adsRevenue)} />
        <KpiCard icon={Wallet} label="Investimento" value={formatCurrency(kpis.investment)} />
        <KpiCard icon={Target} label="ROAS" value={`${kpis.roas.toFixed(2).replace(".", ",")}x`} hint="receita de Ads / investimento" />
        <KpiCard icon={Percent} label="ACoS" value={formatPercent(kpis.acos)} hint={`break-even médio: ${formatPercent(kpis.breakEvenAcos)}`} />
        <KpiCard icon={Megaphone} label="TACoS" value={formatPercent(kpis.tacosPercent)} hint="investimento / receita total da loja" />
      </div>

      <ProductHealthPanel counts={healthCounts} active={healthFilter} onSelect={setHealthFilter} />

      <AdsDailyChart data={dailySeries} />

      <DataTable
        columns={adsTableColumns}
        data={tableRows}
        exportFilename="publicidade"
        emptyState={{ icon: Megaphone, title: "Nenhum produto com investimento em Ads no período" }}
      />
    </div>
  );
}
