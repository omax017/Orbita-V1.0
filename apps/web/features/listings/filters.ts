import { ALL_ACCOUNTS_ID } from "@/components/filters/types";
import type { ListingChannel, ListingStatus, MockListing } from "./types";

export type ListingSortOption = "recent" | "price_desc" | "sales_desc" | "revenue_desc";

export const LISTING_SORT_LABEL: Record<ListingSortOption, string> = {
  recent: "Mais recentes",
  price_desc: "Maior preço",
  sales_desc: "Mais vendidos",
  revenue_desc: "Maior faturamento",
};

export interface ListingsFilterState {
  search: string;
  accountId: string;
  channel: ListingChannel | "all";
  statuses: Set<ListingStatus>;
  skuQuery: string;
  tag: string | "all";
  onlyCatalog: boolean;
  onlyMissingSku: boolean;
  sortBy: ListingSortOption;
}

export function initialListingsFilters(): ListingsFilterState {
  return {
    search: "",
    accountId: ALL_ACCOUNTS_ID,
    channel: "all",
    statuses: new Set(),
    skuQuery: "",
    tag: "all",
    onlyCatalog: false,
    onlyMissingSku: false,
    sortBy: "recent",
  };
}

function accountMatches(listing: MockListing, accountId: string): boolean {
  if (accountId === ALL_ACCOUNTS_ID) return true;
  if (accountId === "acc_ml") return listing.provider === "MERCADO_LIVRE";
  if (accountId === "acc_shopee") return listing.provider === "SHOPEE";
  return true;
}

export function filterAndSortListings(
  listings: MockListing[],
  filters: ListingsFilterState,
): MockListing[] {
  const filtered = listings.filter((listing) => {
    if (!accountMatches(listing, filters.accountId)) return false;
    if (filters.channel !== "all" && listing.channel !== filters.channel) return false;
    if (filters.statuses.size > 0 && !filters.statuses.has(listing.status)) return false;
    if (filters.tag !== "all" && listing.tag !== filters.tag) return false;
    if (filters.onlyCatalog && !listing.fromCatalog) return false;
    if (filters.onlyMissingSku && listing.skuCode !== null) return false;

    if (filters.skuQuery.trim()) {
      const q = filters.skuQuery.trim().toLowerCase();
      if (!listing.skuCode?.toLowerCase().includes(q)) return false;
    }

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const matches =
        listing.title.toLowerCase().includes(q) || listing.externalId.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case "price_desc":
        return b.price - a.price;
      case "sales_desc":
        return b.salesCount - a.salesCount;
      case "revenue_desc":
        return b.revenue - a.revenue;
      case "recent":
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });
}

export function countActiveListingsFilters(filters: ListingsFilterState): number {
  let count = 0;
  if (filters.skuQuery.trim()) count += 1;
  if (filters.tag !== "all") count += 1;
  if (filters.onlyCatalog) count += 1;
  if (filters.onlyMissingSku) count += 1;
  if (filters.sortBy !== "recent") count += 1;
  return count;
}

export function uniqueTags(listings: MockListing[]): string[] {
  const tags = new Set<string>();
  for (const listing of listings) {
    if (listing.tag) tags.add(listing.tag);
  }
  return Array.from(tags).sort();
}
