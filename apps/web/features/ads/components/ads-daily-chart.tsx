"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";

interface AdsDailyPoint {
  date: string;
  investment: number;
  adsRevenue: number;
  profit: number;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
}

function AdsTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const investment = payload.find((p) => p.dataKey === "investment")?.value ?? 0;
  const adsRevenue = payload.find((p) => p.dataKey === "adsRevenue")?.value ?? 0;
  const profit = payload.find((p) => p.dataKey === "profit")?.value ?? 0;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <p>Investimento: <span className="font-semibold text-foreground">{formatCurrency(investment)}</span></p>
        <p>Receita de Ads: <span className="font-semibold text-foreground">{formatCurrency(adsRevenue)}</span></p>
        <p>Lucro pós-Ads: <span className="font-semibold text-foreground">{formatCurrency(profit)}</span></p>
      </div>
    </div>
  );
}

// Investimento, receita de Ads e lucro pós-Ads são todos R$ — um único eixo, sem dual-axis.
export function AdsDailyChart({ data }: { data: AdsDailyPoint[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Evolução diária</h2>
          <p className="text-xs text-muted-foreground">Investimento, receita de Ads e lucro pós-Ads</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            Investimento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
            Receita de Ads
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
            Lucro pós-Ads
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(v: number) => formatCurrencyCompact(v)}
            width={56}
          />
          <Tooltip content={<AdsTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
          <Line type="monotone" dataKey="investment" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="adsRevenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
