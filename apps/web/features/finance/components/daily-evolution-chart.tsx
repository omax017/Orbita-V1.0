"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatCurrencyCompact, formatNumber } from "@/lib/format";

// Mesmo padrão do PerformanceChart do Dashboard (Etapa 3): faturamento e
// lucro no mesmo eixo (os dois são R$), pedidos num mini-gráfico de barras
// separado — nunca dual-axis. Ver ARCHITECTURE.md § 8.2.
const REVENUE_COLOR = "hsl(var(--chart-1))";
const PROFIT_COLOR = "hsl(var(--chart-4))";
const ORDERS_COLOR = "hsl(var(--muted-foreground))";

export interface DailyPoint {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
}

interface TooltipPayloadEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold tabular-nums text-foreground">{formatNumber(payload[0]?.value ?? 0)} vendas</p>
    </div>
  );
}

export function DailyEvolutionChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Evolução diária</h2>
          <p className="text-xs text-muted-foreground">Faturamento, lucro e vendas no período</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: REVENUE_COLOR }} />
            Receita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: PROFIT_COLOR }} />
            Lucro
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-2.5 rounded-sm" style={{ backgroundColor: ORDERS_COLOR, opacity: 0.5 }} />
            Pedidos
          </span>
        </div>
      </div>

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(v: number) => formatCurrencyCompact(v)}
              width={60}
            />
            <Tooltip content={<MoneyTooltip />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }} />
            <Line type="monotone" dataKey="revenue" name="Receita" stroke={REVENUE_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
            <Line type="monotone" dataKey="profit" name="Lucro" stroke={PROFIT_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
          </LineChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={64}>
          <BarChart data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip content={<OrdersTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="orders" name="Pedidos" fill={ORDERS_COLOR} fillOpacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
