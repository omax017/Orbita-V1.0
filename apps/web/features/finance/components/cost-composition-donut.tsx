"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";

// 3 fatias, part-to-whole — dentro do que o guia de dataviz permite pra
// donut/pie ("≤ 6 segmentos", nunca pra comparar valores próximos). Cores
// validadas all-pairs (light + dark) com validate_palette.js — ver
// comentário em globals.css.
const SEGMENTS = [
  { key: "fees", label: "Taxas", color: "hsl(var(--chart-1))" },
  { key: "shipping", label: "Envio", color: "hsl(var(--chart-2))" },
  { key: "profit", label: "Lucro", color: "hsl(var(--chart-4))" },
] as const;

export interface CostCompositionData {
  fees: number;
  shipping: number;
  profit: number;
}

interface DonutTooltipPayload {
  name: string;
  value: number;
  payload: { fill: string };
}

function DonutTooltip({ active, payload, total }: { active?: boolean; payload?: DonutTooltipPayload[]; total: number }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]!;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2 text-xs">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
        <span className="text-muted-foreground">{entry.name}</span>
        <span className="ml-auto font-semibold tabular-nums text-foreground">{formatCurrency(entry.value)}</span>
      </div>
      <p className="mt-0.5 text-right text-xs text-muted-foreground">
        {total > 0 ? formatPercent((entry.value / total) * 100) : "—"}
      </p>
    </div>
  );
}

export function CostCompositionDonut({ data }: { data: CostCompositionData }) {
  const total = data.fees + data.shipping + data.profit;
  const chartData = SEGMENTS.map((seg) => ({ name: seg.label, value: Math.max(0, data[seg.key]), fill: seg.color }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Composição do faturamento</h2>
      <p className="text-xs text-muted-foreground">Taxas, envio e lucro sobre a receita do período</p>

      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-[180px] w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} strokeWidth={2} stroke="hsl(var(--card))">
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {SEGMENTS.map((seg) => {
            const value = Math.max(0, data[seg.key]);
            return (
              <div key={seg.key} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-muted-foreground">{seg.label}</span>
                <span className="ml-auto font-medium text-foreground">
                  {total > 0 ? formatPercent((value / total) * 100) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
