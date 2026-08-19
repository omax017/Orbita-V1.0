import { Clock } from "lucide-react";
import { formatNumber } from "@/lib/format";

export interface PeakHourInsightProps {
  rangeLabel: string;
  ordersCount: number;
  percentAboveAverage: number;
}

/** Insight de uma linha: horário com mais pedidos no dia. */
export function PeakHourInsight({ rangeLabel, ordersCount, percentAboveAverage }: PeakHourInsightProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
        <Clock className="h-4 w-4" />
      </span>
      <p className="text-sm text-foreground">
        Pico de vendas hoje: <strong className="font-semibold">{rangeLabel}</strong> —{" "}
        {formatNumber(ordersCount)} pedidos nesse intervalo, {percentAboveAverage}% acima da
        média do dia.
      </p>
    </div>
  );
}
