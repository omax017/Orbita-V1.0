"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/format";
import type { VisitsTrendPoint } from "../types";

interface TooltipPayload {
  value: number;
}

function VisitsTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Visitas: <span className="font-semibold text-foreground">{formatNumber(payload[0]!.value)}</span>
      </p>
    </div>
  );
}

export function VisitsTrendChart({ data }: { data: VisitsTrendPoint[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-1 text-sm font-semibold text-foreground">Tendência de visitas</h2>
      <p className="mb-3 text-xs text-muted-foreground">Últimos 30 dias do nicho</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} interval={4} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={44} />
          <Tooltip content={<VisitsTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
          <Area type="monotone" dataKey="visits" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#visitsFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
