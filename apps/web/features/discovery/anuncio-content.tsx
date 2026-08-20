"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, CircleDollarSign, FileSearch, Loader2, Percent, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { apiFetch } from "@/lib/api-client";
import { generateListingAnalysis } from "./mock-data";
import { findDiscoveryEntry, loadDiscoveryHistory, saveDiscoveryEntry } from "./history-store";
import type { ListingAnalysisResult, SellerProfile } from "./types";
import { SellerProfileCard } from "./components/seller-profile-card";
import { RecentSearchesList } from "./components/recent-searches-list";

/** Resposta de `POST /discovery/anuncio` (backend real, Etapa 20) — título,
 * preço, imagem e vendedor podem vir REAIS (API do ML, usando o token de uma
 * conta conectada do workspace) quando `isReal: true`; senão o backend já
 * devolve os mesmos campos gerados que o mock local produziria. */
interface AnuncioApiResult {
  isReal?: boolean;
  title?: string;
  price: number;
  thumbnailUrl?: string | null;
  permalink?: string | null;
  totalSalesAllTime?: number;
  sales30d: number;
  visits30d: number;
  conversionPercent: number;
  revenue30d: number;
  seller?: SellerProfile | null;
}

export function AnuncioContent({ workspaceId }: { workspaceId: string }) {
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

  async function handleAnalyze() {
    if (!url.trim() || loading) return;
    const trimmedUrl = url.trim();
    setLoading(true);

    // Continua gerando localmente primeiro (thumbnailColor, seller de
    // fallback) — o backend só SOBRESCREVE título/preço/imagem/vendedor
    // quando consegue um item real (ver comentário em discovery.service.ts).
    const analysis = generateListingAnalysis(trimmedUrl);
    try {
      const apiResult = await apiFetch<AnuncioApiResult>("/discovery/anuncio", {
        method: "POST",
        workspaceId,
        body: JSON.stringify({ url: trimmedUrl }),
      });
      analysis.isReal = apiResult.isReal ?? false;
      analysis.price = apiResult.price;
      analysis.sales30d = apiResult.sales30d;
      analysis.visits30d = apiResult.visits30d;
      analysis.conversionPercent = apiResult.conversionPercent;
      analysis.revenue30d = apiResult.revenue30d;
      if (apiResult.isReal) {
        if (apiResult.title) analysis.title = apiResult.title;
        analysis.thumbnailUrl = apiResult.thumbnailUrl ?? null;
        analysis.permalink = apiResult.permalink ?? null;
        analysis.totalSalesAllTime = apiResult.totalSalesAllTime;
        if (apiResult.seller) analysis.seller = apiResult.seller;
      }
    } catch {
      // Sem conexão/sessão expirada etc. — segue só com os dados gerados.
    }

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
              {result.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- imagem externa (CDN do ML), sem domínio configurado em next/image
                <img src={result.thumbnailUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className={cn("h-14 w-14 shrink-0 rounded-lg", result.thumbnailColor)} />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">{result.title}</p>
                  {result.isReal ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                      <BadgeCheck className="h-3 w-3" />
                      Dados reais
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(result.price)}
                  {result.isReal && result.totalSalesAllTime !== undefined
                    ? ` · ${formatNumber(result.totalSalesAllTime)} vendas no histórico do anúncio`
                    : null}
                </p>
                {result.isReal && result.permalink ? (
                  <a href={result.permalink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                    Ver no Mercado Livre
                  </a>
                ) : null}
              </div>
            </div>
            {result.isReal ? (
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                Título, preço, imagem e vendedor vêm da API oficial do Mercado Livre. Vendas/visitas/conversão dos últimos 30 dias continuam estimados — o ML só expõe isso pro próprio dono do anúncio.
              </p>
            ) : null}
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
