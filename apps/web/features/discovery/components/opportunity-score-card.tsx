import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpportunityScoreFactor } from "../types";

function bandFor(score: number): { label: string; text: string; bg: string; ring: string } {
  if (score >= 70) return { label: "Ótima oportunidade", text: "text-success", bg: "bg-success/15", ring: "stroke-success" };
  if (score >= 45) return { label: "Oportunidade moderada", text: "text-warning", bg: "bg-warning/15", ring: "stroke-warning" };
  return { label: "Baixa oportunidade", text: "text-destructive", bg: "bg-destructive/15", ring: "stroke-destructive" };
}

/** Anel de progresso simples via SVG — evita puxar uma lib de gráfico só pra isso. */
function ScoreRing({ score, className }: { score: number; className?: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  return (
    <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
      <circle cx="48" cy="48" r={radius} strokeWidth="10" className="fill-none stroke-border" />
      <circle
        cx="48"
        cy="48"
        r={radius}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn("fill-none transition-[stroke-dashoffset] duration-700", className)}
      />
    </svg>
  );
}

export function OpportunityScoreCard({
  score,
  factors,
}: {
  score: number;
  factors: OpportunityScoreFactor[];
}) {
  const band = bandFor(score);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Gauge className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Pontuação de Oportunidade</h2>
          <p className="text-xs text-muted-foreground">Combina demanda, mercado, concorrência, tendência e margem</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <ScoreRing score={score} className={band.ring} />
          <span className="absolute font-display text-2xl font-semibold text-foreground">{score}</span>
        </div>

        <div className="flex-1 space-y-2.5">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", band.bg, band.text)}>
            {band.label}
          </span>

          <div className="space-y-1.5">
            {factors.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-xs">
                <span className="w-40 shrink-0 truncate text-muted-foreground">{f.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", band.ring.replace("stroke-", "bg-"))}
                    style={{ width: `${Math.round(f.score)}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right font-medium text-foreground">{Math.round(f.score)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
