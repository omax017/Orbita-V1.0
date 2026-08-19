import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { DreLine } from "../dre";

function rowClasses(kind: DreLine["kind"]): string {
  if (kind === "total") return "border-t-2 border-foreground/20 pt-2.5 mt-1 text-base font-semibold text-foreground";
  if (kind === "subtotal") return "border-t border-border pt-2 mt-1 text-sm font-semibold text-foreground";
  return "text-sm text-muted-foreground";
}

export function DreStatement({ lines }: { lines: DreLine[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Demonstrativo de Resultado</h2>
      <div className="flex flex-col">
        {lines.map((line) => (
          <div key={line.label} className={cn("flex items-center justify-between py-1.5", rowClasses(line.kind))}>
            <span className={cn(line.kind !== "line" && "text-foreground")}>{line.label}</span>
            <span
              className={cn(
                "tabular-nums",
                line.kind !== "line" && "text-foreground",
                line.value < 0 && "text-destructive",
                line.kind === "total" && (line.value >= 0 ? "text-success" : "text-destructive"),
              )}
            >
              {line.value < 0 ? "− " : ""}
              {formatCurrency(Math.abs(line.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
