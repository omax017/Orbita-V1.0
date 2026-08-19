import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Variação percentual vs. período anterior. Omitir quando não houver comparativo. */
  changePercent?: number;
  hint?: string;
  /** Link de ação (ex.: "ver todos os pedidos") — some quando ausente. */
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

/**
 * Card de KPI padrão do dashboard: ícone + label + valor grande + chip de
 * variação % + link de ação opcional. Base do design system — todo módulo
 * (Pedidos, Financeiro, Ads...) usa este mesmo componente para métricas de topo.
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  changePercent,
  hint,
  actionHref,
  actionLabel = "Ver detalhes",
  className,
}: KpiCardProps) {
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        {changePercent !== undefined ? (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              isPositive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(changePercent).toFixed(1)}%
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      <span className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}

      {actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
