"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, ShoppingCart, Wallet } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { AccountSelector } from "@/components/filters/account-selector";
import { PeriodSelector } from "@/components/filters/period-selector";
import { ALL_ACCOUNTS_ID } from "@/components/filters/types";
import type { PeriodSelection } from "@/components/filters/types";
import { buildPeriod } from "@/components/filters/period-utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import { MOCK_ACCOUNTS, MOCK_HAS_SKUS, buildDashboardData, buildMonthlyPerformance } from "./mock-data";
import { OnboardingSkuCard } from "./components/onboarding-sku-card";
import { MissingCostBanner } from "./components/missing-cost-banner";
import { QuickMetricsRow } from "./components/quick-metrics-row";
import { PeakHourInsight } from "./components/peak-hour-insight";
import { SmartAlertsPanel } from "./components/smart-alerts-panel";
import { FeaturedProductCard } from "./components/featured-product-card";
import { PerformanceChart } from "./components/performance-chart";

const GREETING_DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

function greetingForHour(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export interface DashboardContentProps {
  userName: string;
}

export function DashboardContent({ userName }: DashboardContentProps) {
  const [period, setPeriod] = useState<PeriodSelection>(() => buildPeriod("30d"));
  const [accountId, setAccountId] = useState<string>(ALL_ACCOUNTS_ID);

  const data = useMemo(() => buildDashboardData(period, accountId), [period, accountId]);
  const monthlyPerformance = useMemo(() => buildMonthlyPerformance(accountId), [accountId]);

  const now = useMemo(() => new Date(), []);
  const firstName = userName.split(" ")[0];
  const dateLabel = GREETING_DATE_FORMAT.format(now);
  const dateLabelCapitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {greetingForHour(now.getHours())}, {firstName}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{dateLabelCapitalized}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          <AccountSelector accounts={MOCK_ACCOUNTS} value={accountId} onChange={setAccountId} />
        </div>
      </div>

      {!MOCK_HAS_SKUS ? <OnboardingSkuCard /> : null}

      <MissingCostBanner
        count={data.ordersMissingCost.count}
        revenueAffected={data.ordersMissingCost.revenueAffected}
      />

      <QuickMetricsRow
        avgTicket={data.quickMetrics.avgTicket}
        contributionMarginPercent={data.quickMetrics.contributionMarginPercent}
        activeAccounts={data.quickMetrics.activeAccounts}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={CircleDollarSign}
          label="Faturamento"
          value={formatCurrency(data.kpis.revenue.value)}
          changePercent={data.kpis.revenue.changePercent}
          hint={`vs. período anterior (${period.label.toLowerCase()})`}
          actionHref="/financeiro/resumo"
        />
        <KpiCard
          icon={ShoppingCart}
          label="Total de vendas"
          value={formatNumber(data.kpis.totalSales.value)}
          changePercent={data.kpis.totalSales.changePercent}
          hint="pedidos no período"
          actionHref="/pedidos"
        />
        <KpiCard
          icon={Wallet}
          label="Lucro líquido"
          value={formatCurrency(data.kpis.netProfit.value)}
          changePercent={data.kpis.netProfit.changePercent}
          hint="após taxas, frete, imposto e Ads"
          actionHref="/financeiro/dre"
        />
      </div>

      <PeakHourInsight
        rangeLabel={data.peakHour.rangeLabel}
        ordersCount={data.peakHour.ordersCount}
        percentAboveAverage={data.peakHour.percentAboveAverage}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SmartAlertsPanel alerts={data.smartAlerts} />
        </div>
        <FeaturedProductCard product={data.featuredProduct} />
      </div>

      <PerformanceChart data={monthlyPerformance} />
    </div>
  );
}
