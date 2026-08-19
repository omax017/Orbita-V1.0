import type { MockListing } from "@/features/listings/types";
import type { MockSku } from "./types";

export interface CatalogKpis {
  unitsInStock: number;
  totalCostInStock: number;
  expectedPayout: number;
  expectedProfit: number;
}

/**
 * Repasse previsto: pra cada SKU, usa o preço médio dos anúncios vinculados
 * (o que ele realmente vende por); sem anúncio vinculado, estima com uma
 * margem padrão (2.2x o custo) — é só pra o KPI não ficar zerado num SKU
 * recém-cadastrado sem vínculo ainda.
 */
export function computeCatalogKpis(
  skus: MockSku[],
  listings: MockListing[],
  stockView: "local" | "full",
): CatalogKpis {
  let unitsInStock = 0;
  let totalCostInStock = 0;
  let expectedPayout = 0;

  for (const sku of skus) {
    const qty = stockView === "local" ? sku.stockLocal : sku.stockFull;
    unitsInStock += qty;
    totalCostInStock += qty * (sku.costAmount + sku.packagingCostAmount);

    const linkedPrices = listings
      .filter((listing) => listing.skuCode === sku.code)
      .map((listing) => listing.price);
    const avgPrice =
      linkedPrices.length > 0
        ? linkedPrices.reduce((sum, p) => sum + p, 0) / linkedPrices.length
        : sku.costAmount * 2.2;

    expectedPayout += qty * avgPrice;
  }

  return {
    unitsInStock,
    totalCostInStock,
    expectedPayout,
    expectedProfit: expectedPayout - totalCostInStock,
  };
}
