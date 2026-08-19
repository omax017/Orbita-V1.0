import type { MockListing } from "./types";

export interface PositionPoint {
  day: number;
  position: number;
}

export interface ListingRanking {
  listingId: string;
  history: PositionPoint[];
  currentPosition: number;
  bestPosition: number;
  trend: "up" | "down" | "flat";
}

// Hash determinístico simples — mesma listagem sempre gera a mesma "curva"
// de posição, sem precisar guardar histórico real (Math.random mudaria a
// cada render).
function seededVariation(seed: string, day: number): number {
  let hash = 0;
  const input = `${seed}-${day}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) & 0xffffffff;
  }
  return (Math.abs(hash) % 100) / 100; // 0..1
}

const HISTORY_DAYS = 14;

/**
 * Gera a "curva" de posição (1 = melhor) dos últimos 14 dias por anúncio —
 * pensado como posição média nas buscas do termo principal, não só a
 * disputa de buy box (`competitivePosition`, que é mais específica de
 * Catálogo e continua mostrada como badge ao lado).
 */
export function buildRankingData(listings: MockListing[]): ListingRanking[] {
  return listings
    .filter((listing) => listing.status === "ACTIVE")
    .map((listing) => {
      // Ponto de partida por anúncio, pra uns começarem bem colocados e
      // outros não — baseado na própria posição competitiva mockada.
      const basePosition =
        listing.competitivePosition === "WINNING"
          ? 3
          : listing.competitivePosition === "LOSING"
            ? 12
            : 7;

      const history: PositionPoint[] = Array.from({ length: HISTORY_DAYS }, (_, i) => {
        const variation = seededVariation(listing.id, i);
        const drift = listing.competitivePosition === "WINNING" ? -i * 0.15 : i * 0.1;
        const position = Math.max(1, Math.round(basePosition + drift + variation * 4 - 2));
        return { day: i, position };
      });

      const first = history[0]?.position ?? basePosition;
      const last = history[history.length - 1]?.position ?? basePosition;
      const trend = last < first ? "up" : last > first ? "down" : "flat";

      return {
        listingId: listing.id,
        history,
        currentPosition: last,
        bestPosition: Math.min(...history.map((p) => p.position)),
        trend,
      };
    });
}
