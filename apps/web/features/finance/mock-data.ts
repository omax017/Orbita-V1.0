import { MOCK_SKUS } from "@/features/catalog/mock-data";
import type { FinancialMovementRecord, SaleRecord } from "./types";

/** Tudo mockado — conecta com Order/OrderItem/FinancialMovement reais na etapa de integrações. */

const PROVIDERS = [
  { provider: "MERCADO_LIVRE" as const, accountLabel: "Loja da Maria · Mercado Livre" },
  { provider: "SHOPEE" as const, accountLabel: "Loja da Maria · Shopee" },
];

// Preço de venda por SKU — não é o mesmo objeto de Anúncios (podem variar
// por canal), mas usa os MESMOS produtos/custos do catálogo pra tudo bater.
const SALE_PRICE_MULTIPLIER = 2.4;

// 13 meses (~395 dias) — cobre os 12 meses do gráfico de evolução do DRE +
// folga pra "mês anterior" no primeiro mês navegável não ficar sem dado.
const HISTORY_DAYS = 395;
const STATUSES_POOL = ["DELIVERED", "DELIVERED", "DELIVERED", "SHIPPED", "PAID", "CANCELED", "RETURNED"] as const;

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function buildSaleRecords(): SaleRecord[] {
  const records: SaleRecord[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < HISTORY_DAYS; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(9 + Math.floor(seededRandom(`h-${dayOffset}`) * 10), Math.floor(seededRandom(`m-${dayOffset}`) * 60));

    for (const sku of MOCK_SKUS) {
      const daySeed = `${sku.code}-${dayOffset}`;
      const sells = seededRandom(daySeed) > 0.45; // ~55% de chance de vender esse SKU nesse dia
      if (!sells) continue;

      const quantity = 1 + Math.floor(seededRandom(`${daySeed}-qty`) * 3);
      const providerPick = PROVIDERS[Math.floor(seededRandom(`${daySeed}-prov`) * PROVIDERS.length)]!;
      const statusPick = STATUSES_POOL[Math.floor(seededRandom(`${daySeed}-status`) * STATUSES_POOL.length)]!;

      const unitPrice = Math.round(sku.costAmount * SALE_PRICE_MULTIPLIER * 100) / 100;
      const revenue = Math.round(unitPrice * quantity * 100) / 100;
      const feeAmount = Math.round(revenue * 0.12 * 100) / 100;
      const shippingAmount = Math.round((quantity * 8.5 + seededRandom(`${daySeed}-ship`) * 10) * 100) / 100;
      const shippingBonus = Math.round(shippingAmount * 0.15 * 100) / 100;
      const packagingCostAmount = Math.round(sku.packagingCostAmount * quantity * 100) / 100;
      const taxAmount = Math.round(revenue * 0.06 * 100) / 100;
      const costAmount = Math.round(sku.costAmount * quantity * 100) / 100;
      const netProfit =
        revenue -
        feeAmount -
        shippingAmount +
        shippingBonus -
        packagingCostAmount -
        taxAmount -
        costAmount;

      records.push({
        id: `sale_${sku.code}_${dayOffset}`,
        date,
        title: sku.name,
        skuCode: sku.code,
        provider: providerPick.provider,
        accountLabel: providerPick.accountLabel,
        status: statusPick,
        quantity,
        unitPrice,
        revenue,
        feeAmount,
        shippingAmount,
        shippingBonus,
        packagingCostAmount,
        taxAmount,
        costAmount,
        netProfit,
      });
    }
  }

  return records.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export const MOCK_SALE_RECORDS: SaleRecord[] = buildSaleRecords();

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

export const MOCK_MOVEMENTS: FinancialMovementRecord[] = [
  { id: "mov_1", description: "Aporte sócio", category: "Entrada", amount: 5000, date: daysAgo(28), recurrence: "ÚNICA" },
  { id: "mov_2", description: "Aluguel do galpão", category: "Custo Fixo", amount: -1800, date: daysAgo(15), recurrence: "MENSAL" },
  { id: "mov_3", description: "Internet + telefonia", category: "Custo Fixo", amount: -220, date: daysAgo(15), recurrence: "MENSAL" },
  { id: "mov_4", description: "Contador", category: "Custo Fixo", amount: -450, date: daysAgo(10), recurrence: "MENSAL" },
  { id: "mov_5", description: "Software de gestão", category: "Custo Operacional", amount: -189, date: daysAgo(8), recurrence: "MENSAL" },
  { id: "mov_6", description: "Material de embalagem (lote)", category: "Custo Operacional", amount: -640, date: daysAgo(5), recurrence: "ÚNICA" },
  { id: "mov_7", description: "Frete de reposição de estoque", category: "Custo Operacional", amount: -310, date: daysAgo(3), recurrence: "ÚNICA" },
  { id: "mov_8", description: "Retirada sócio", category: "Retirada", amount: -2000, date: daysAgo(2), recurrence: "MENSAL" },
  { id: "mov_9", description: "Venda direta (feira)", category: "Entrada", amount: 480, date: daysAgo(1), recurrence: "ÚNICA" },
  { id: "mov_10", description: "Ajuste de caixa", category: "Ajuste", amount: -35, date: daysAgo(1), recurrence: "ÚNICA" },
];

/** Custo de Ads por mês — mockado fixo (o módulo Publicidade ainda não existe). */
export function mockAdSpendForMonth(): number {
  return 890;
}
