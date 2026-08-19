import type { OrderProvider, OrderStatus } from "@/features/orders/types";

/** Uma "linha de venda" — normalmente 1 OrderItem, achatado pra facilitar
 * relatório (Resumo/ABC/DRE). Conecta com Order/OrderItem reais na etapa de
 * integrações; aqui é gerado direto como dado plano pra não depender de
 * custo por item, que o mock de Pedidos (Etapa 4) não tem no nível de item. */
export interface SaleRecord {
  id: string;
  date: Date;
  title: string;
  skuCode: string | null;
  provider: OrderProvider;
  accountLabel: string;
  status: OrderStatus;
  quantity: number;
  unitPrice: number;
  revenue: number;
  feeAmount: number;
  shippingAmount: number;
  shippingBonus: number;
  packagingCostAmount: number;
  taxAmount: number;
  costAmount: number;
  netProfit: number;
}

/** Espelha o enum FinancialMovementType do Prisma (subconjunto usado no mock). */
export type MovementType =
  | "ORDER_REVENUE"
  | "MARKETPLACE_FEE"
  | "SHIPPING_COST"
  | "TAX"
  | "AD_SPEND"
  | "PRODUCT_COST"
  | "REFUND"
  | "WITHDRAWAL"
  | "ADJUSTMENT"
  | "OTHER";

export type MovementCategory =
  | "Entrada"
  | "Custo Fixo"
  | "Custo Operacional"
  | "Retirada"
  | "Ajuste";

export type MovementRecurrence = "ÚNICA" | "MENSAL";

export interface FinancialMovementRecord {
  id: string;
  description: string;
  category: MovementCategory;
  /** positivo = entrada, negativo = saída — mesma convenção do FinancialMovement real. */
  amount: number;
  date: Date;
  recurrence: MovementRecurrence;
}

export interface AbcProduct {
  title: string;
  skuCode: string | null;
  quantity: number;
  revenue: number;
  netProfit: number;
  avgTicket: number;
  turnover: number;
}

export type AbcMetric = "revenue" | "quantity" | "profit";
export type AbcClass = "A" | "B" | "C";

export interface AbcRankedProduct extends AbcProduct {
  position: number;
  metricValue: number;
  individualPercent: number;
  cumulativePercent: number;
  abcClass: AbcClass;
}
