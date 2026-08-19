"use client";

import { useState } from "react";
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
import { LayoutList, LineChart as LineChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatCurrencyCompact, formatNumber } from "@/lib/format";
import type { MonthlyPoint } from "../mock-data";

// hsl(var(--x)) resolve em runtime via CSS custom property — funciona tanto
// em <Line stroke=…> quanto em <Bar fill=…> porque o SVG herda a variável do
// ancestral no DOM. Cores validadas com dataviz/scripts/validate_palette.js
// (ver comentário em app/globals.css) — revenue e profit ficam no MESMO eixo
// (os dois são R$; não é um dual-axis) por decisão explícita: um gráfico com
// dois y-scales diferentes (aqui seria R$ vs. contagem de pedidos) inventa
// correlação que não existe nos dados — por isso "pedidos" virou um
// mini-gráfico à parte, alinhado pelo mesmo eixo X.
const REVENUE_COLOR = "hsl(var(--chart-1))";
const PROFIT_COLOR = "hsl(var(--chart-4))";
const ORDERS_COLOR = "hsl(var(--muted-foreground))";

interface TooltipPayloadEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="h-0.5 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold tabular-nums text-foreground">
        {formatNumber(value)} pedidos
      </p>
    </div>
  );
}

export interface PerformanceChartProps {
  data: MonthlyPoint[];
}

/**
 * Faturamento + lucro (linha dupla, mesmo eixo de R$) dos últimos 6 meses,
 * com pedidos num mini-gráfico de barras alinhado por mês logo abaixo.
 * Alterna para uma tabela equivalente ("Ver como tabela") — todo gráfico
 * tem uma versão em tabela, é o par WCAG-limpo dele.
 */
export function PerformanceChart({ data }: PerformanceChartProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Performance mensal</h2>
          <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
        </div>

        <div className="flex items-center gap-4">
          {!showTable ? (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-0.5 w-4 rounded-full"
                  style={{ backgroundColor: REVENUE_COLOR }}
                />
                Faturamento
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-0.5 w-4 rounded-full"
                  style={{ backgroundColor: PROFIT_COLOR }}
                />
                Lucro líquido
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: ORDERS_COLOR, opacity: 0.5 }}
                />
                Pedidos
              </span>
            </div>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => setShowTable((v) => !v)}
          >
            {showTable ? <LineChartIcon className="h-3.5 w-3.5" /> : <LayoutList className="h-3.5 w-3.5" />}
            {showTable ? "Ver como gráfico" : "Ver como tabela"}
          </Button>
        </div>
      </div>

      {showTable ? (
        <PerformanceTable data={data} />
      ) : (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value: number) => formatCurrencyCompact(value)}
                width={64}
              />
              <Tooltip
                content={<MoneyTooltip />}
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Faturamento"
                stroke={REVENUE_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Lucro líquido"
                stroke={PROFIT_COLOR}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={72}>
            <BarChart data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip content={<OrdersTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar
                dataKey="orders"
                name="Pedidos"
                fill={ORDERS_COLOR}
                fillOpacity={0.5}
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function PerformanceTable({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted-foreground">
          <tr className="border-b border-border">
            <th className="py-2 text-left font-medium">Mês</th>
            <th className="py-2 text-right font-medium">Faturamento</th>
            <th className="py-2 text-right font-medium">Lucro líquido</th>
            <th className="py-2 text-right font-medium">Pedidos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((point) => (
            <tr key={point.month}>
              <td className="py-2 text-foreground">{point.month}</td>
              <td className="py-2 text-right tabular-nums text-foreground">
                {formatCurrency(point.revenue)}
              </td>
              <td className="py-2 text-right tabular-nums text-foreground">
                {formatCurrency(point.profit)}
              </td>
              <td className="py-2 text-right tabular-nums text-foreground">
                {formatNumber(point.orders)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
