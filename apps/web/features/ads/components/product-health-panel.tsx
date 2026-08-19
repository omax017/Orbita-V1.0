import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { AdHealthBucket } from "../types";

const META: Record<AdHealthBucket, { title: string; classes: string; activeClasses: string }> = {
  Lucrativo: { title: "Lucrativo", classes: "border-success/30 bg-success/5", activeClasses: "ring-2 ring-success" },
  "Em risco": { title: "Em risco", classes: "border-warning/30 bg-warning/5", activeClasses: "ring-2 ring-warning" },
  Prejuízo: { title: "Prejuízo", classes: "border-destructive/30 bg-destructive/5", activeClasses: "ring-2 ring-destructive" },
};

const ORDER: AdHealthBucket[] = ["Lucrativo", "Em risco", "Prejuízo"];

export interface ProductHealthPanelProps {
  counts: Record<AdHealthBucket, number>;
  active: AdHealthBucket | null;
  onSelect: (bucket: AdHealthBucket | null) => void;
}

/** Cards clicáveis — clicar filtra a tabela abaixo pela classe de saúde; clicar de novo no já ativo limpa o filtro. */
export function ProductHealthPanel({ counts, active, onSelect }: ProductHealthPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {ORDER.map((bucket) => {
        const meta = META[bucket];
        const isActive = active === bucket;
        return (
          <button
            key={bucket}
            type="button"
            onClick={() => onSelect(isActive ? null : bucket)}
            className={cn(
              "rounded-xl border p-4 text-left transition-shadow",
              meta.classes,
              isActive && meta.activeClasses,
            )}
          >
            <p className="text-sm font-semibold text-foreground">{meta.title}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {formatNumber(counts[bucket])}{" "}
              <span className="text-sm font-normal text-muted-foreground">produto(s)</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isActive ? "Filtrando a tabela — clique para limpar" : "Clique para filtrar a tabela"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
