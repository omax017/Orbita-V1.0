import type { MockListing } from "./types";

export interface BuyBoxDispute {
  listingId: string;
  yourPrice: number;
  winningPrice: number;
  competitorsCount: number;
  isWinning: boolean;
}

/** Só anúncios de Catálogo entram em disputa de buy box — os demais não competem por essa posição. */
export function buildBuyBoxData(listings: MockListing[]): BuyBoxDispute[] {
  return listings
    .filter((listing) => listing.fromCatalog && listing.competitivePosition !== "UNKNOWN")
    .map((listing) => {
      const isWinning = listing.competitivePosition === "WINNING";
      const winningPrice = isWinning ? listing.price : Math.round((listing.price - listing.price * 0.08) * 100) / 100;
      return {
        listingId: listing.id,
        yourPrice: listing.price,
        winningPrice,
        competitorsCount: isWinning ? 2 : 3,
        isWinning,
      };
    });
}
