import { cn } from "@/lib/utils";

export interface StatRowItem {
  label: string;
  value: string;
  /** Tom opcional pro valor (ex.: lucro negativo em vermelho). Default = cor de texto normal. */
  tone?: "default" | "success" | "destructive";
}

const TONE_CLASSES: Record<NonNullable<StatRowItem["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  destructive: "text-destructive",
};

export interface StatRowProps {
  items: StatRowItem[];
  className?: string;
}

/**
 * Linha de estatísticas compactas (label + valor), dividida em colunas —
 * mais leve que um `KpiCard` (sem ícone/chip/link). Usado no resumo de
 * período do Dashboard e de Pedidos; qualquer módulo com um "resumo rápido"
 * no topo (Financeiro, Publicidade...) reaproveita este componente.
 */
export function StatRow({ items, className }: StatRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-card sm:divide-x sm:divide-y-0",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <div key={item.label} className="px-5 py-3.5">
          <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
          <p className={cn("mt-0.5 text-lg font-semibold", TONE_CLASSES[item.tone ?? "default"])}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
