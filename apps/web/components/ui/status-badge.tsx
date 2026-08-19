import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pill de status usado em tabelas densas (Pedidos, Anúncios, etc.) — bolinha
 * colorida + label. Diferente de `Badge` (genérico), `StatusBadge` expõe um
 * `tone` semântico fixo em vez de cores arbitrárias, para toda tela usar o
 * mesmo vocabulário visual de status.
 */
const dotVariants = cva("size-1.5 shrink-0 rounded-full", {
  variants: {
    tone: {
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
      info: "bg-chart-2",
      neutral: "bg-muted-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});

const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        destructive: "border-transparent bg-destructive/15 text-destructive",
        info: "border-transparent bg-chart-2/15 text-chart-2",
        neutral: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface StatusBadgeProps extends VariantProps<typeof pillVariants> {
  label: string;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ label, tone, dot = true, className }: StatusBadgeProps) {
  return (
    <span className={cn(pillVariants({ tone }), className)}>
      {dot ? <span className={dotVariants({ tone })} /> : null}
      {label}
    </span>
  );
}
