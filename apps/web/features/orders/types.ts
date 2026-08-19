/** Espelha o enum OrderStatus do Prisma (apps/api/prisma/schema.prisma). */
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "IN_PREPARATION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "RETURNED";

/**
 * Estágio de envio — granularidade menor que OrderStatus, usada só na
 * timeline visual do card (Pronto → Em trânsito → Entregue). `null` quando
 * o pedido ainda não tem envio (PENDING) ou não faz sentido mostrar
 * (CANCELED/RETURNED).
 */
export type ShippingStage = "READY" | "IN_TRANSIT" | "DELIVERED";

export type ShippingType = "Correios" | "Transportadora" | "Full" | "Combinado com o comprador";

/** "Canal" é distinto de "conta" — de onde a venda veio, não qual conta a recebeu. */
export type SalesChannel = "Orgânico" | "Ads" | "Externo";

/** EXTERNAL = venda registrada manualmente (fora de Mercado Livre/Shopee). */
export type OrderProvider = "MERCADO_LIVRE" | "SHOPEE" | "EXTERNAL";

export interface MockOrderItem {
  id: string;
  title: string;
  skuCode: string | null;
  fromCatalog: boolean;
  quantity: number;
  unitPrice: number;
  thumbnailColor: string;
}

export interface MockOrder {
  id: string;
  externalId: string;
  provider: OrderProvider;
  accountLabel: string;
  channel: SalesChannel;
  status: OrderStatus;
  shippingStage: ShippingStage | null;
  shippingType: ShippingType;
  totalAmount: number;
  feeAmount: number;
  shippingCost: number;
  taxAmount: number;
  /** null = pedido sem custo/SKU vinculado. */
  costAmount: number | null;
  items: MockOrderItem[];
  orderedAt: Date;
  paymentMethod: string;
  payoutForecast: Date;
  buyerName: string;
  address: string;
}

export interface OrderFinancials {
  netProfit: number | null;
  marginPercent: number | null;
  hasNegativeMargin: boolean;
  hasMissingCost: boolean;
}

export function computeOrderFinancials(order: MockOrder): OrderFinancials {
  if (order.costAmount === null) {
    return { netProfit: null, marginPercent: null, hasNegativeMargin: false, hasMissingCost: true };
  }
  const netProfit =
    order.totalAmount - order.feeAmount - order.shippingCost - order.taxAmount - order.costAmount;
  const marginPercent = order.totalAmount > 0 ? (netProfit / order.totalAmount) * 100 : 0;
  return {
    netProfit,
    marginPercent,
    hasNegativeMargin: netProfit < 0,
    hasMissingCost: false,
  };
}
