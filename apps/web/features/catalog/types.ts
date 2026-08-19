/** Espelha o model Sku do Prisma (apps/api/prisma/schema.prisma). */
export interface MockSku {
  id: string;
  code: string;
  name: string;
  costAmount: number;
  packagingCostAmount: number;
  stockLocal: number;
  stockFull: number;
  lowStockThreshold: number;
  imageColor: string;
  active: boolean;
}

/**
 * O vínculo N:N (ListingSku) fica materializado do lado do Listing —
 * `MockListing.skuCode` (ver features/listings/types.ts) — em vez de
 * duplicado aqui, pra não ter duas fontes de verdade sobre quem está
 * vinculado a quem. Quem precisa da contagem por SKU deriva com
 * `countLinkedListings()` abaixo, cruzando com a lista de anúncios.
 */
export function countLinkedListings(
  skuCode: string,
  listings: Array<{ skuCode: string | null }>,
): number {
  return listings.filter((listing) => listing.skuCode === skuCode).length;
}

export type StockHealth = "OUT_OF_STOCK" | "CRITICAL" | "LOW" | "HEALTHY";

export const STOCK_HEALTH_LABEL: Record<StockHealth, string> = {
  OUT_OF_STOCK: "Ruptura",
  CRITICAL: "Crítico",
  LOW: "Baixo",
  HEALTHY: "Saudável",
};

/**
 * Regra: 0 unidades = ruptura; até metade do limite = crítico; até o limite
 * = baixo; acima disso = saudável. `lowStockThreshold` é por SKU (giro
 * diferente por produto), não um valor global fixo.
 */
export function computeStockHealth(sku: Pick<MockSku, "stockLocal" | "stockFull" | "lowStockThreshold">): StockHealth {
  const total = sku.stockLocal + sku.stockFull;
  if (total <= 0) return "OUT_OF_STOCK";
  if (total <= sku.lowStockThreshold / 2) return "CRITICAL";
  if (total <= sku.lowStockThreshold) return "LOW";
  return "HEALTHY";
}
