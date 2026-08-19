import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const GARIMPADOR_STAGES = ["Buscando", "Coletando", "Visitas", "Métricas", "Finalizando"] as const;

export function ProgressStepper({ currentStage }: { currentStage: number }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8">
      <div className="flex w-full max-w-lg items-center">
        {GARIMPADOR_STAGES.map((stage, i) => {
          const isDone = i < currentStage;
          const isActive = i === currentStage;
          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                    isDone && "border-success bg-success/15 text-success",
                    isActive && "border-primary bg-primary/15 text-primary",
                    !isDone && !isActive && "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : i + 1}
                </span>
                <span className={cn("text-xs whitespace-nowrap", isActive ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {stage}
                </span>
              </div>
              {i < GARIMPADOR_STAGES.length - 1 ? (
                <div className={cn("mx-2 h-px flex-1", isDone ? "bg-success" : "bg-border")} />
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">Analisando o nicho — isso leva alguns segundos…</p>
    </div>
  );
}
