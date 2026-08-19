import { StatRow } from "@/components/ui/stat-row";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { OrdersSummary } from "../filters";

export function OrdersSummaryBar({ summary }: { summary: OrdersSummary }) {
  return (
    <StatRow
      items={[
        { label: "Pedidos", value: formatNumber(summary.count) },
        { label: "Faturamento", value: formatCurrency(summary.revenue) },
        {
          label: "Lucro",
          value: formatCurrency(summary.netProfit),
          tone: summary.netProfit >= 0 ? "success" : "destructive",
        },
        {
          label: "Margem",
          value: formatPercent(summary.marginPercent),
          tone: summary.marginPercent >= 0 ? "default" : "destructive",
        },
      ]}
    />
  );
}
