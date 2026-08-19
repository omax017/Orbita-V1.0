"use client";

import { Bar, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { AbcRankedProduct } from "../types";

// Barra = % individual, linha = % acumulado — os DOIS já são percentuais
// (0–100%), então dividem o mesmo eixo sem ser um dual-axis de verdade
// (a alternativa clássica de Pareto — barras em R$ + linha em % em eixos
// diferentes — é exatamente o anti-padrão que o guia de dataviz bane).
const BAR_COLOR = "hsl(var(--chart-1))";
const LINE_COLOR = "hsl(var(--chart-2))";

interface ParetoTooltipPayload {
  dataKey: string;
  value: number;
  payload: AbcRankedProduct & { label: string };
}

function ParetoTooltip({ active, payload }: { active?: boolean; payload?: ParetoTooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const product = payload[0]!.payload;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="max-w-[220px] truncate text-xs font-medium text-foreground">{product.title}</p>
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <p>Individual: <span className="font-semibold text-foreground">{formatPercent(product.individualPercent)}</span></p>
        <p>Acumulado: <span className="font-semibold text-foreground">{formatPercent(product.cumulativePercent)}</span></p>
        <p>Valor: <span className="font-semibold text-foreground">{formatCurrency(product.metricValue)}</span></p>
      </div>
    </div>
  );
}

export function ParetoChart({ ranking }: { ranking: AbcRankedProduct[] }) {
  const top20 = ranking.slice(0, 20).map((p) => ({ ...p, label: `#${p.position}` }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Curva de Pareto</h2>
          <p className="text-xs text-muted-foreground">Top 20 produtos — % individual e % acumulado</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-2.5 rounded-sm" style={{ backgroundColor: BAR_COLOR, opacity: 0.7 }} />
            % individual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: LINE_COLOR }} />
            % acumulado
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={top20} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="0" />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(v: number) => `${v}%`}
            domain={[0, 100]}
            width={40}
          />
          <ReferenceLine y={80} stroke="hsl(var(--warning))" strokeDasharray="4 4" label={{ value: "80%", fill: "hsl(var(--warning))", fontSize: 11, position: "insideTopLeft" }} />
          <Tooltip content={<ParetoTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
          <Bar dataKey="individualPercent" name="% individual" fill={BAR_COLOR} fillOpacity={0.7} radius={[3, 3, 0, 0]} maxBarSize={24} />
          <Line type="monotone" dataKey="cumulativePercent" name="% acumulado" stroke={LINE_COLOR} strokeWidth={2} dot={{ r: 3, fill: LINE_COLOR }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
