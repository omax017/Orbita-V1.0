import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusTimelineStep {
  key: string;
  label: string;
  /** timestamp já formatado (ex.: "18/08 14:32") — formatação fica a cargo de quem usa o componente. */
  timestamp?: string;
}

export interface StatusTimelineProps {
  steps: StatusTimelineStep[];
  /** índice (0-based) do step atual em `steps`. */
  currentIndex: number;
  /** quando true, o step atual é tratado como uma falha (ex.: pedido cancelado) — pinta de vermelho em vez de laranja. */
  isError?: boolean;
  className?: string;
}

/**
 * Timeline horizontal de status (bolinhas conectadas) — usada no drawer de
 * detalhe de Pedido (Pendente → Pago → Preparação → Enviado → Entregue) e em
 * qualquer outro fluxo com estágios sequenciais.
 */
export function StatusTimeline({
  steps,
  currentIndex,
  isError = false,
  className,
}: StatusTimelineProps) {
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;
        const currentIsError = isCurrent && isError;

        return (
          <li key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && !currentIsError && "border-primary bg-background text-primary",
                  currentIsError && "border-destructive bg-destructive text-destructive-foreground",
                  !isDone && !isCurrent && "border-border bg-background text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : currentIsError ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    "mx-1 h-0.5 flex-1",
                    isDone ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className="mt-2 px-1 text-center">
              <p
                className={cn(
                  "text-xs font-medium",
                  isCurrent || isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {step.timestamp ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{step.timestamp}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
