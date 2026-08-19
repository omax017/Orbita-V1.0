"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleDollarSign, Compass, Loader2, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatCurrency, formatNumber } from "@/lib/format";
import { generateSellerCatalog } from "./mock-data";
import { findDiscoveryEntry, loadDiscoveryHistory, saveDiscoveryEntry } from "./history-store";
import type { SellerCatalogResult } from "./types";
import { SellerProfileCard } from "./components/seller-profile-card";
import { competitorTableColumns } from "./components/competitor-table-columns";
import { RecentSearchesList } from "./components/recent-searches-list";

export function ConcorrentesContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SellerCatalogResult | null>(null);
  const [recent, setRecent] = useState(() => loadDiscoveryHistory().filter((e) => e.type === "CONCORRENTE"));

  useEffect(() => {
    const historyId = searchParams.get("historyId");
    if (!historyId) return;
    const entry = findDiscoveryEntry(historyId);
    if (entry?.type === "CONCORRENTE") {
      setUrl(entry.result.sourceUrl);
      setResult(entry.result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnalyze() {
    if (!url.trim() || loading) return;
    setLoading(true);
    setTimeout(() => {
      const catalog = generateSellerCatalog(url.trim());
      setResult(catalog);
      setLoading(false);
      const updated = saveDiscoveryEntry({
        id: `hist_${Date.now()}`,
        type: "CONCORRENTE",
        label: catalog.sourceUrl,
        createdAt: new Date(),
        result: catalog,
      });
      setRecent(updated.filter((e) => e.type === "CONCORRENTE"));
    }, 900);
  }

  function handleSelectRecent(id: string) {
    const entry = findDiscoveryEntry(id);
    if (entry?.type === "CONCORRENTE") {
      setUrl(entry.result.sourceUrl);
      setResult(entry.result);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Análise de Concorrentes</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Cole o link de um produto para ver o catálogo completo do vendedor</p>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4">
        <div className="min-w-[280px] flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Link do produto</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.mercadolivre.com.br/p/..."
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
        </div>
        <Button onClick={handleAnalyze} disabled={!url.trim() || loading} className="gap-1.5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
          Analisar
        </Button>
      </div>

      <RecentSearchesList items={recent.map((e) => ({ id: e.id, label: e.label, createdAt: e.createdAt }))} onSelect={handleSelectRecent} />

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Buscando o catálogo do vendedor…</p>
        </div>
      ) : null}

      {!result && !loading ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-12 text-center">
          <Compass className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cole o link de um produto para analisar o vendedor.</p>
        </div>
      ) : null}

      {result && !loading ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <SellerProfileCard seller={result.seller} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <KpiCard icon={ShoppingCart} label="Vendas totais" value={formatNumber(result.totalSales)} />
              <KpiCard icon={TrendingUp} label="Visitas (30d)" value={formatNumber(result.visits30d)} />
              <KpiCard icon={CircleDollarSign} label="Mercado endereçável" value={formatCurrency(result.addressableMarket)} />
            </div>
          </div>

          <DataTable
            columns={competitorTableColumns}
            data={result.listings}
            exportFilename="concorrentes-catalogo"
            emptyState={{ icon: Compass, title: "Nenhum anúncio encontrado" }}
          />
        </>
      ) : null}
    </div>
  );
}
