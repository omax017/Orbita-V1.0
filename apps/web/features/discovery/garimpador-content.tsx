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
import { apiFetch } from "@/lib/api-client";
import { DISCOVERY_CATEGORIES, generateNicheSearch } from "./mock-data";
import { findDiscoveryEntry, loadDiscoveryHistory, saveDiscoveryEntry } from "./history-store";
import type { LogisticsType, NicheSearchResult, OpportunityScoreFactor } from "./types";
import { GARIMPADOR_STAGES, ProgressStepper } from "./components/progress-stepper";
import { VisitsTrendChart } from "./components/visits-trend-chart";
import { KeywordCloud } from "./components/keyword-cloud";
import { competitorTableColumns } from "./components/competitor-table-columns";
import { RecentSearchesList } from "./components/recent-searches-list";
import { OpportunityScoreCard } from "./components/opportunity-score-card";

/** Resposta de `POST /discovery/garimpador` (backend real, Etapa 16) — vendas,
 * mercado e visitas usam a mesma fórmula seedada do gerador local (por isso
 * batem numericamente), mas a Pontuação de Oportunidade é calculada de
 * verdade no backend (`opportunity-score.ts`), não é mockada. */
interface GarimpadorApiResult {
  totalSales: number;
  addressableMarket: number;
  visits30d: number;
  competitorCount: number;
  visitsTrendGrowthPercent: number;
  estimatedMarginPercent: number;
  opportunityScore: number;
  opportunityFactors: OpportunityScoreFactor[];
}

const selectClasses = cn(
  "flex h-9 w-full max-w-[220px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

const LOGISTICS_FILTERS: LogisticsType[] = ["Full", "Correios", "Coleta", "Agência"];

export function GarimpadorContent({ workspaceId }: { workspaceId: string }) {
  const searchParams = useSearchParams();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>(DISCOVERY_CATEGORIES[0]);
  const [stage, setStage] = useState<number | null>(null);
  const [result, setResult] = useState<NicheSearchResult | null>(null);
  const [recent, setRecent] = useState(() => loadDiscoveryHistory().filter((e) => e.type === "GARIMPADOR"));
  const [logisticsFilter, setLogisticsFilter] = useState<Set<LogisticsType>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toggleLogisticsFilter(type: LogisticsType) {
    setLogisticsFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

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

  function runStages(onDone: () => void | Promise<void>) {
    setStage(0);
    const advance = (next: number) => {
      timerRef.current = setTimeout(() => {
        if (next >= GARIMPADOR_STAGES.length) {
          // `onDone` pode ser assíncrono (chamada real ao backend) — só some
          // com o stepper depois que o resultado já estiver pronto, senão a
          // tela pisca em "vazio" entre o fim da animação e a resposta da API.
          Promise.resolve(onDone()).finally(() => setStage(null));
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
    const trimmedTerm = term.trim();
    setLogisticsFilter(new Set());
    runStages(async () => {
      // Visualização (tendência, nuvem de palavras, tabela de concorrentes)
      // continua gerada localmente — o backend ainda não coleta esses dados
      // (ver mock-data.ts). O que É real: a Pontuação de Oportunidade, que
      // vem de `POST /discovery/garimpador` e também grava no histórico do
      // workspace (`SearchHistory`), não só no localStorage deste navegador.
      const niche = generateNicheSearch(trimmedTerm, category);
      try {
        const apiResult = await apiFetch<GarimpadorApiResult>("/discovery/garimpador", {
          method: "POST",
          workspaceId,
          body: JSON.stringify({ termo: trimmedTerm, categoria: category }),
        });
        Object.assign(niche, apiResult);
      } catch {
        // Se a chamada falhar (rede, sessão expirada etc.), mantém a busca
        // funcionando com os dados locais — só sem a Pontuação de Oportunidade.
      }
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
      setLogisticsFilter(new Set());
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

          {result.opportunityScore !== undefined && result.opportunityFactors ? (
            <OpportunityScoreCard score={result.opportunityScore} factors={result.opportunityFactors} />
          ) : null}

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

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filtrar por logística:</span>
            {LOGISTICS_FILTERS.map((type) => {
              const active = logisticsFilter.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleLogisticsFilter(type)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>

          <DataTable
            columns={competitorTableColumns}
            data={
              logisticsFilter.size === 0
                ? result.competitors
                : result.competitors.filter((c) => logisticsFilter.has(c.logisticsType))
            }
            exportFilename="garimpador-concorrentes"
            emptyState={{ icon: Pickaxe, title: "Nenhum concorrente encontrado" }}
          />
        </>
      ) : null}
    </div>
  );
}
