"use client";

import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { MockSku } from "@/features/catalog/types";
import { formatNumber } from "@/lib/format";
import { MOCK_LISTINGS } from "./mock-data";
import {
  filterAndSortListings,
  initialListingsFilters,
  uniqueTags,
  type ListingsFilterState,
} from "./filters";
import type { MockListing } from "./types";
import { ListingCard } from "./components/listing-card";
import { ListingsFilters } from "./components/listings-filters";

export function ListingsContent() {
  const [listings, setListings] = useState<MockListing[]>(MOCK_LISTINGS);
  const [filters, setFilters] = useState<ListingsFilterState>(initialListingsFilters);

  const visibleListings = useMemo(
    () => filterAndSortListings(listings, filters),
    [listings, filters],
  );
  const availableTags = useMemo(() => uniqueTags(listings), [listings]);

  function handleLinkSku(listingId: string, sku: MockSku) {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === listingId
          ? { ...listing, skuCode: sku.code, fromCatalog: true, hasPackagingCost: sku.packagingCostAmount > 0 }
          : listing,
      ),
    );
  }

  function handleEditPrice(listingId: string, newPrice: number) {
    setListings((prev) =>
      prev.map((listing) => (listing.id === listingId ? { ...listing, price: newPrice } : listing)),
    );
  }

  function handleToggleStatus(listingId: string) {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === listingId
          ? { ...listing, status: listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }
          : listing,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Anúncios</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatNumber(visibleListings.length)} anúncio(s)
        </p>
      </div>

      <ListingsFilters filters={filters} onChange={setFilters} availableTags={availableTags} />

      <div className="flex flex-col gap-3">
        {visibleListings.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nenhum anúncio encontrado"
            description="Ajuste os filtros para ver seus anúncios."
          />
        ) : (
          visibleListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onLinkSku={handleLinkSku}
              onEditPrice={handleEditPrice}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
