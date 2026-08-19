"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleDollarSign, FileSearch, Loader2, Percent, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { generateListingAnalysis } from "./mock-data";
import { findDiscoveryEntry, loadDiscoveryHistory, saveDiscoveryEntry } from "./history-store";
import type { ListingAnalysisResult } from "./types";
import { SellerProfileCard } from "./components/seller-profile-card";
import { RecentSearchesList } from "./components/recent-searches-list";

export function AnuncioContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ListingAnalysisResult | null>(null);
  const [recent, setRecent] = useState(() => loadDiscoveryHistory().filter((e) => e.type === "ANUNCIO"));

  useEffect(() => {
    const historyId = searchParams.get("historyId");
    if (!historyId) return;
    const entry = findDiscoveryEntry(historyId);
    if (entry?.type === "ANUNCIO") {
      setUrl(entry.result.sourceUrl);
      setResult(entry.result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnalyze() {
    if (!url.trim() || loading) return;
    setLoading(true);
    setTimeout(() => {
      const analysis = generateListingAnalysis(url.trim());
      setResult(analysis);
      setLoading(false);
      const updated = saveDiscoveryEntry({
        id: `hist_${Date.now()}`,
        type: "ANUNCIO",
        label: analysis.sourceUrl,
        createdAt: new Date(),
        result: analysis,
      });
      setRecent(updated.filter((e) => e.type === "ANUNCIO"));
    }, 900);
  }

  function handleSelectRecent(id: string) {
    const entry = findDiscoveryEntry(id);
    if (entry?.type === "ANUNCIO") {
      setUrl(entry.result.sourceUrl);
      setResult(entry.result);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Análise de Anúncio</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Cole o link ou ID de um anúncio para ver as métricas individuais</p>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4">
        <div className="min-w-[280px] flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Link ou ID do anúncio</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://produto.mercadolivre.com.br/MLB-..."
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
        </div>
        <Button onClick={handleAnalyze} disabled={!url.trim() || loading} className="gap-1.5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
          Analisar
        </Button>
      </div>

      <RecentSearchesList items={recent.map((e) => ({ id: e.id, label: e.label, createdAt: e.createdAt }))} onSelect={handleSelectRecent} />

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Analisando o anúncio…</p>
        </div>
      ) : null}

      {!result && !loading ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-12 text-center">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cole o link de um anúncio para analisar.</p>
        </div>
      ) : null}

      {result && !loading ? (
        <>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className={cn("h-14 w-14 shrink-0 rounded-lg", result.thumbnailColor)} />
              <div>
                <p className="font-medium text-foreground">{result.title}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(result.price)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={ShoppingCart} label="Vendas (30d)" value={formatNumber(result.sales30d)} />
            <KpiCard icon={TrendingUp} label="Visitas (30d)" value={formatNumber(result.visits30d)} />
            <KpiCard icon={Percent} label="Conversão" value={formatPercent(result.conversionPercent)} />
            <KpiCard icon={CircleDollarSign} label="Faturamento (30d)" value={formatCurrency(result.revenue30d)} />
          </div>

          <SellerProfileCard seller={result.seller} />
        </>
      ) : null}
    </div>
  );
}
