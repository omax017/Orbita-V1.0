"use client";

import { useMemo, useState } from "react";
import { Boxes, Download, Eye, EyeOff, Package, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { KpiCard } from "@/components/ui/kpi-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportRowsToCsv } from "@/lib/export-csv";
import { formatCurrency, formatNumber } from "@/lib/format";
import { MOCK_LISTINGS } from "@/features/listings/mock-data";
import type { MockListing } from "@/features/listings/types";
import { MOCK_SKUS } from "./mock-data";
import { computeStockHealth, type MockSku } from "./types";
import { computeCatalogKpis } from "./kpis";
import { buildSkuColumns } from "./components/sku-columns";
import { buildMissingSkuColumns } from "./components/missing-sku-columns";
import { StockHealthBadge } from "./components/stock-health-badge";
import { NewSkuDialog } from "./components/new-sku-dialog";
import { ImportSkuDialog } from "./components/import-sku-dialog";
import { CompareByDatePopover } from "./components/compare-by-date-popover";

// Deltas mockados exibidos no modo "comparar por data" — não existe
// snapshot histórico real de estoque ainda (ver comentário no popover).
const MOCK_COMPARISON_DELTAS = { units: 4.2, cost: -2.8, payout: 6.1, profit: 9.4 };

export function CatalogContent() {
  const [skus, setSkus] = useState<MockSku[]>(MOCK_SKUS);
  const [listings, setListings] = useState<MockListing[]>(MOCK_LISTINGS);
  const [hideValues, setHideValues] = useState(false);
  const [stockView, setStockView] = useState<"local" | "full">("local");
  const [compareDate, setCompareDate] = useState<string | null>(null);

  const kpis = useMemo(() => computeCatalogKpis(skus, listings, stockView), [skus, listings, stockView]);

  const healthCounts = useMemo(() => {
    const counts = { OUT_OF_STOCK: 0, CRITICAL: 0, LOW: 0, HEALTHY: 0 };
    for (const sku of skus) counts[computeStockHealth(sku)] += 1;
    return counts;
  }, [skus]);

  const missingSkuListings = useMemo(() => listings.filter((l) => l.skuCode === null), [listings]);

  const skuColumns = useMemo(
    () => buildSkuColumns({ hideValues, listings, stockView }),
    [hideValues, listings, stockView],
  );

  function handleLinkSkuFromListing(listingId: string, sku: MockSku) {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, skuCode: sku.code, fromCatalog: true } : l)),
    );
  }

  const missingSkuColumns = useMemo(
    () => buildMissingSkuColumns({ onLink: handleLinkSkuFromListing }),
    [],
  );

  function handleCreateSku(sku: MockSku, linkedListingIds: string[]) {
    setSkus((prev) => [sku, ...prev]);
    if (linkedListingIds.length > 0) {
      setListings((prev) =>
        prev.map((l) =>
          linkedListingIds.includes(l.id) ? { ...l, skuCode: sku.code, fromCatalog: true } : l,
        ),
      );
    }
  }

  function handleExport() {
    const headers = ["SKU", "Nome", "Custo", "Embalagem", "Estoque local", "Estoque Full", "Saúde"];
    const rows = skus.map((sku) => [
      sku.code,
      sku.name,
      String(sku.costAmount),
      String(sku.packagingCostAmount),
      String(sku.stockLocal),
      String(sku.stockFull),
      computeStockHealth(sku),
    ]);
    exportRowsToCsv("estoque", headers, rows);
  }

  const valueOrMask = (formatted: string) => (hideValues ? "••••" : formatted);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Estoque</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatNumber(skus.length)} SKU(s) cadastrado(s)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setHideValues((v) => !v)}
            aria-label={hideValues ? "Mostrar valores" : "Ocultar valores"}
          >
            {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <CompareByDatePopover
            active={compareDate !== null}
            compareLabel={compareDate}
            onApply={setCompareDate}
            onClear={() => setCompareDate(null)}
          />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
          <ImportSkuDialog />
          <NewSkuDialog
            listings={listings}
            existingCodes={skus.map((s) => s.code)}
            onCreate={handleCreateSku}
          />
        </div>
      </div>

      <div className="inline-flex w-fit rounded-lg bg-muted p-1 text-sm">
        {(["local", "full"] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setStockView(view)}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              stockView === view
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view === "local" ? "Estoque Local" : "Estoque Full"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Boxes}
          label="Unidades em estoque"
          value={valueOrMask(formatNumber(kpis.unitsInStock))}
          changePercent={compareDate ? MOCK_COMPARISON_DELTAS.units : undefined}
          hint={compareDate ? `vs. ${compareDate}` : stockView === "local" ? "Estoque local" : "Estoque Full"}
        />
        <KpiCard
          icon={Wallet}
          label="Custo total em estoque"
          value={valueOrMask(formatCurrency(kpis.totalCostInStock))}
          changePercent={compareDate ? MOCK_COMPARISON_DELTAS.cost : undefined}
          hint="produto + embalagem"
        />
        <KpiCard
          icon={Package}
          label="Repasse previsto"
          value={valueOrMask(formatCurrency(kpis.expectedPayout))}
          changePercent={compareDate ? MOCK_COMPARISON_DELTAS.payout : undefined}
          hint="se todo o estoque vender"
        />
        <KpiCard
          icon={TrendingUp}
          label="Lucro previsto"
          value={valueOrMask(formatCurrency(kpis.expectedProfit))}
          changePercent={compareDate ? MOCK_COMPARISON_DELTAS.profit : undefined}
          hint="repasse − custo em estoque"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground">Saúde do estoque:</span>
        <StockHealthBadge health="OUT_OF_STOCK" />
        <span className="text-xs text-muted-foreground">{healthCounts.OUT_OF_STOCK}</span>
        <StockHealthBadge health="CRITICAL" />
        <span className="text-xs text-muted-foreground">{healthCounts.CRITICAL}</span>
        <StockHealthBadge health="LOW" />
        <span className="text-xs text-muted-foreground">{healthCounts.LOW}</span>
        <StockHealthBadge health="HEALTHY" />
        <span className="text-xs text-muted-foreground">{healthCounts.HEALTHY}</span>
      </div>

      <Tabs defaultValue="skus">
        <TabsList>
          <TabsTrigger value="skus">Meus SKUs</TabsTrigger>
          <TabsTrigger value="missing">Anúncios sem SKU ({missingSkuListings.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="skus">
          <DataTable
            columns={skuColumns}
            data={skus}
            exportFilename="meus-skus"
            emptyState={{ icon: Boxes, title: "Nenhum SKU cadastrado" }}
          />
        </TabsContent>
        <TabsContent value="missing">
          <DataTable
            columns={missingSkuColumns}
            data={missingSkuListings}
            emptyState={{ icon: Package, title: "Todos os anúncios têm SKU vinculado" }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
