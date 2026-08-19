"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Compass, FileSearch, History, Pickaxe } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadDiscoveryHistory } from "./history-store";
import type { DiscoveryAnalysisType } from "./types";

const TYPE_META: Record<DiscoveryAnalysisType, { label: string; icon: typeof Pickaxe; href: string }> = {
  GARIMPADOR: { label: "Garimpador", icon: Pickaxe, href: "/descobrir/garimpador" },
  CONCORRENTE: { label: "Concorrentes", icon: Compass, href: "/descobrir/concorrentes" },
  ANUNCIO: { label: "Análise de Anúncio", icon: FileSearch, href: "/descobrir/analise-anuncio" },
};

const FILTERS: { value: DiscoveryAnalysisType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "GARIMPADOR", label: "Garimpador" },
  { value: "CONCORRENTE", label: "Concorrentes" },
  { value: "ANUNCIO", label: "Análise de Anúncio" },
];

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function HistoricoContent() {
  const [filter, setFilter] = useState<DiscoveryAnalysisType | "ALL">("ALL");
  const history = useMemo(() => loadDiscoveryHistory().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()), []);
  const filtered = useMemo(() => (filter === "ALL" ? history : history.filter((e) => e.type === filter)), [history, filter]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Histórico</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Análises salvas do módulo Descobrir</p>
      </div>

      <div className="inline-flex w-fit rounded-lg bg-muted p-1 text-sm">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-colors",
              filter === f.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-12 text-center">
          <History className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma análise salva ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((entry) => {
            const meta = TYPE_META[entry.type];
            const Icon = meta.icon;
            return (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta.label} · {DATE_FORMAT.format(entry.createdAt)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`${meta.href}?historyId=${entry.id}`}
                  className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Reabrir
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
