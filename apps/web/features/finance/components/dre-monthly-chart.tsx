"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrencyCompact, formatCurrency } from "@/lib/format";

interface MonthlyPoint {
  month: string;
  revenue: number;
  profit: number;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  payload: MonthlyPoint;
}

function MonthlyTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;
  const profit = payload.find((p) => p.dataKey === "profit")?.value ?? 0;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <p>Receita: <span className="font-semibold text-foreground">{formatCurrency(revenue)}</span></p>
        <p>Lucro líquido: <span className="font-semibold text-foreground">{formatCurrency(profit)}</span></p>
      </div>
    </div>
  );
}

// Receita e lucro compartilham a mesma unidade (R$) — um único eixo, sem
// dual-axis. Mesmo padrão do PerformanceChart do Dashboard (Etapa 3).
export function DreMonthlyChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Evolução mensal</h2>
          <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
            Receita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
            Lucro líquido
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(v: number) => formatCurrencyCompact(v)}
            width={56}
          />
          <Tooltip content={<MonthlyTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
          <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
