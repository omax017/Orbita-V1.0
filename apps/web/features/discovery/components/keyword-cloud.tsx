import type { KeywordTag } from "../types";

function sizeClassFor(weight: number): string {
  if (weight >= 9) return "text-2xl font-semibold text-foreground";
  if (weight >= 7) return "text-xl font-semibold text-foreground";
  if (weight >= 5) return "text-base font-medium text-foreground";
  if (weight >= 3) return "text-sm text-muted-foreground";
  return "text-xs text-muted-foreground";
}

export function KeywordCloud({ keywords }: { keywords: KeywordTag[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Nuvem de palavras-chave</h2>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {keywords.map((kw) => (
          <span key={kw.term} className={sizeClassFor(kw.weight)}>
            {kw.term}
          </span>
        ))}
      </div>
    </div>
  );
}
