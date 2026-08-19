"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatRow } from "@/components/ui/stat-row";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { buildBuyBoxData } from "./catalog-dispute-mock";
import { MOCK_LISTINGS } from "./mock-data";
import type { MockListing } from "./types";
import { EditPriceDialog } from "./components/edit-price-dialog";
import { CompetitiveBadge } from "./components/competitive-badge";

export function CatalogosContent() {
  const [listings, setListings] = useState<MockListing[]>(MOCK_LISTINGS);
  const disputes = useMemo(() => buildBuyBoxData(listings), [listings]);
  const byListingId = useMemo(() => new Map(listings.map((l) => [l.id, l])), [listings]);

  const winningCount = disputes.filter((d) => d.isWinning).length;
  const losingCount = disputes.length - winningCount;
  const winRate = disputes.length > 0 ? (winningCount / disputes.length) * 100 : 0;

  function handleEditPrice(listingId: string, newPrice: number) {
    setListings((prev) =>
      prev.map((listing) => (listing.id === listingId ? { ...listing, price: newPrice } : listing)),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Catálogos</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Anúncios de Catálogo em disputa de buy box (a "ficha" que aparece pro comprador)
        </p>
      </div>

      <StatRow
        items={[
          { label: "Em disputa", value: formatNumber(disputes.length) },
          { label: "Ganhando", value: formatNumber(winningCount), tone: "success" },
          { label: "Perdendo", value: formatNumber(losingCount), tone: "destructive" },
          { label: "Taxa de vitória", value: formatPercent(winRate) },
        ]}
      />

      {disputes.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nenhum anúncio de Catálogo em disputa"
          description="Anúncios marcados como Catálogo aparecem aqui quando entram em disputa de buy box."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {disputes.map((dispute) => {
            const listing = byListingId.get(dispute.listingId);
            if (!listing) return null;
            return (
              <div
                key={dispute.listingId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`h-10 w-10 shrink-0 rounded-md ${listing.thumbnailColor}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {dispute.competitorsCount} concorrente(s) na disputa
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Seu preço</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(dispute.yourPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Preço vencedor</p>
                    <p
                      className={`text-sm font-semibold ${dispute.isWinning ? "text-success" : "text-destructive"}`}
                    >
                      {formatCurrency(dispute.winningPrice)}
                    </p>
                  </div>
                  <CompetitiveBadge position={listing.competitivePosition} />
                  {!dispute.isWinning ? (
                    <EditPriceDialog
                      listingTitle={listing.title}
                      currentPrice={listing.price}
                      onSave={(price) => handleEditPrice(listing.id, price)}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
