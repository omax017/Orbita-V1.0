import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "@/lib/format";
import type { AbcClassSummary } from "../abc";

const CLASS_META: Record<string, { title: string; description: string; classes: string }> = {
  A: { title: "Classe A", description: "~80% do valor — foco de gestão", classes: "border-success/30 bg-success/5" },
  B: { title: "Classe B", description: "80%–95% do valor", classes: "border-warning/30 bg-warning/5" },
  C: { title: "Classe C", description: "Cauda longa — 5% restante", classes: "border-border bg-card" },
};

export function AbcClassCards({ summaries }: { summaries: AbcClassSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {summaries.map((summary) => {
        const meta = CLASS_META[summary.abcClass]!;
        return (
          <div key={summary.abcClass} className={cn("rounded-xl border p-4", meta.classes)}>
            <p className="text-sm font-semibold text-foreground">{meta.title}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {formatNumber(summary.productCount)}{" "}
              <span className="text-sm font-normal text-muted-foreground">produto(s)</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatPercent(summary.valueShare)} do valor · {meta.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
