"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleDollarSign, Pickaxe, Search, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import { DISCOVERY_CATEGORIES, generateNicheSearch } from "./mock-data";
import { findDiscoveryEntry, loadDiscoveryHistory, saveDiscoveryEntry } from "./history-store";
import type { NicheSearchResult } from "./types";
import { GARIMPADOR_STAGES, ProgressStepper } from "./components/progress-stepper";
import { VisitsTrendChart } from "./components/visits-trend-chart";
import { KeywordCloud } from "./components/keyword-cloud";
import { competitorTableColumns } from "./components/competitor-table-columns";
import { RecentSearchesList } from "./components/recent-searches-list";

const selectClasses = cn(
  "flex h-9 w-full max-w-[220px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

export function GarimpadorContent() {
  const searchParams = useSearchParams();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>(DISCOVERY_CATEGORIES[0]);
  const [stage, setStage] = useState<number | null>(null);
  const [result, setResult] = useState<NicheSearchResult | null>(null);
  const [recent, setRecent] = useState(() => loadDiscoveryHistory().filter((e) => e.type === "GARIMPADOR"));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const historyId = searchParams.get("historyId");
    if (!historyId) return;
    const entry = findDiscoveryEntry(historyId);
    if (entry?.type === "GARIMPADOR") {
      setTerm(entry.result.term);
      setCategory(entry.result.category);
      setResult(entry.result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runStages(onDone: () => void) {
    setStage(0);
    const advance = (next: number) => {
      timerRef.current = setTimeout(() => {
        if (next >= GARIMPADOR_STAGES.length) {
          onDone();
          setStage(null);
          return;
        }
        setStage(next);
        advance(next + 1);
      }, 480);
    };
    advance(1);
  }

  function handleSearch() {
    if (!term.trim() || stage !== null) return;
    runStages(() => {
      const niche = generateNicheSearch(term.trim(), category);
      setResult(niche);
      const updated = saveDiscoveryEntry({
        id: `hist_${Date.now()}`,
        type: "GARIMPADOR",
        label: `${niche.term} — ${niche.category}`,
        createdAt: new Date(),
        result: niche,
      });
      setRecent(updated.filter((e) => e.type === "GARIMPADOR"));
    });
  }

  function handleSelectRecent(id: string) {
    const entry = findDiscoveryEntry(id);
    if (entry?.type === "GARIMPADOR") {
      setTerm(entry.result.term);
      setCategory(entry.result.category);
      setResult(entry.result);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Garimpador de Produtos</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Descubra o potencial de um nicho antes de investir</p>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4">
        <div className="min-w-[240px] flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Termo de busca</label>
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ex.: escorredor de louça"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Categoria</label>
          <select className={selectClasses} value={category} onChange={(e) => setCategory(e.target.value)}>
            {DISCOVERY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <Button onClick={handleSearch} disabled={!term.trim() || stage !== null} className="gap-1.5">
          <Search className="h-4 w-4" />
          Buscar
        </Button>
      </div>

      <RecentSearchesList items={recent.map((e) => ({ id: e.id, label: e.label, createdAt: e.createdAt }))} onSelect={handleSelectRecent} />

      {stage !== null ? <ProgressStepper currentStage={stage} /> : null}

      {!result && stage === null ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-12 text-center">
          <Pickaxe className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Busque um termo para garimpar o nicho.</p>
        </div>
      ) : null}

      {result && stage === null ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard icon={ShoppingCart} label="Vendas totais do nicho" value={formatNumber(result.totalSales)} hint="últimos 30 dias" />
            <KpiCard icon={CircleDollarSign} label="Mercado endereçável" value={formatCurrency(result.addressableMarket)} />
            <KpiCard icon={TrendingUp} label="Visitas (30d)" value={formatNumber(result.visits30d)} />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Produto destaque</h2>
            <div className="flex items-center gap-3">
              <span className={cn("h-14 w-14 shrink-0 rounded-lg", result.featuredProduct.thumbnailColor)} />
              <div>
                <p className="font-medium text-foreground">{result.featuredProduct.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(result.featuredProduct.price)} · {formatNumber(result.featuredProduct.sales30d)} vendas (30d) ·{" "}
                  {formatNumber(result.featuredProduct.visits30d)} visitas
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <VisitsTrendChart data={result.visitsTrend} />
            <KeywordCloud keywords={result.keywords} />
          </div>

          <DataTable
            columns={competitorTableColumns}
            data={result.competitors}
            exportFilename="garimpador-concorrentes"
            emptyState={{ icon: Pickaxe, title: "Nenhum concorrente encontrado" }}
          />
        </>
      ) : null}
    </div>
  );
}
