import { StatRow } from "@/components/ui/stat-row";
import { formatCurrency, formatPercent } from "@/lib/format";

export interface QuickMetricsRowProps {
  avgTicket: number;
  contributionMarginPercent: number;
  activeAccounts: number;
}

export function QuickMetricsRow({
  avgTicket,
  contributionMarginPercent,
  activeAccounts,
}: QuickMetricsRowProps) {
  return (
    <StatRow
      items={[
        { label: "Ticket médio", value: formatCurrency(avgTicket) },
        { label: "Margem de contribuição", value: formatPercent(contributionMarginPercent) },
        { label: "Contas ativas", value: String(activeAccounts) },
      ]}
    />
  );
}
