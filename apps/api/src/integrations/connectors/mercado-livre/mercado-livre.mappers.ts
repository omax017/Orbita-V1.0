import type {
  NormalizedListing,
  NormalizedListingStatus,
  NormalizedOrder,
  NormalizedOrderStatus,
} from "../marketplace-connector.types";
import type { MlItem, MlOrder, MlShipment } from "./mercado-livre.types";

/**
 * O ML não tem um único enum de status de pedido igual ao nosso — `status`
 * é sobre PAGAMENTO (confirmed/paid/cancelled/...) e o status de ENTREGA
 * mora num recurso separado (`shipping`/`MlShipment.status`). Combinamos os
 * dois pra chegar em `NormalizedOrderStatus`. `shipment` é opcional porque
 * `listOrders` não busca o shipment de cada pedido por padrão (custaria 1
 * request por pedido) — só entra quando já foi buscado (ex.: `fetchOrder`).
 */
export function mapOrderStatus(order: MlOrder, shipment?: MlShipment | null): NormalizedOrderStatus {
  if (order.status === "cancelled" || order.status === "invalid") return "CANCELED";
  if (order.status === "payment_required" || order.status === "payment_in_process" || order.status === "partially_paid") {
    return "PENDING";
  }

  // order.status === "confirmed" | "paid" a partir daqui — status de entrega manda.
  switch (shipment?.status) {
    case "shipped":
      return "SHIPPED";
    case "delivered":
      return "DELIVERED";
    case "not_delivered":
      return "RETURNED";
    case "pending":
    case "handling":
    case "ready_to_ship":
      return "IN_PREPARATION";
    default:
      return order.status === "paid" ? "PAID" : "PENDING";
  }
}

const LISTING_STATUS_MAP: Record<string, NormalizedListingStatus> = {
  active: "ACTIVE",
  paused: "PAUSED",
  closed: "CLOSED",
  under_review: "UNDER_REVIEW",
};

export function mapListingStatus(rawStatus: string): NormalizedListingStatus {
  return LISTING_STATUS_MAP[rawStatus] ?? "PAUSED";
}

/** Soma `sale_fee` (comissão do ML) de todos os itens — é o equivalente
 * prático de "Billing/Fees API" por pedido: o ML não separa isso numa
 * chamada própria, a taxa já vem no payload de cada item do pedido. */
function totalFeeAmount(order: MlOrder): number {
  return order.order_items.reduce((sum, item) => sum + (item.sale_fee ?? 0) * item.quantity, 0);
}

function totalTaxAmount(order: MlOrder): number {
  return (order.taxes ?? []).reduce((sum, tax) => sum + tax.amount, 0);
}

export function mapOrder(order: MlOrder, shipment?: MlShipment | null): NormalizedOrder {
  const subtotalAmount = order.order_items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shippingAmount = shipment?.cost ?? 0;
  const discountAmount = order.coupon?.amount ?? 0;
  const paidAt = order.payments?.find((p) => p.status === "approved")?.date_approved ?? null;

  return {
    externalOrderId: String(order.id),
    status: mapOrderStatus(order, shipment),
    rawStatus: order.status,
    buyerNickname: order.buyer?.nickname ?? null,
    currency: order.currency_id,
    subtotalAmount,
    shippingAmount,
    discountAmount,
    marketplaceFeeAmount: totalFeeAmount(order),
    taxAmount: totalTaxAmount(order),
    totalAmount: order.total_amount,
    orderedAt: new Date(order.date_created),
    paidAt: paidAt ? new Date(paidAt) : null,
    shippedAt: shipment?.date_shipped ? new Date(shipment.date_shipped) : null,
    deliveredAt: shipment?.date_delivered ? new Date(shipment.date_delivered) : null,
    canceledAt: order.cancel_detail?.date ? new Date(order.cancel_detail.date) : null,
    items: order.order_items.map((item) => ({
      externalItemId: item.item.id,
      externalListingId: item.item.id,
      title: item.item.title,
      quantity: item.quantity,
      unitPriceAmount: item.unit_price,
      variationExternalId: item.item.variation_id ? String(item.item.variation_id) : undefined,
    })),
    raw: order,
  };
}

export function mapListing(item: MlItem): NormalizedListing {
  return {
    externalListingId: item.id,
    title: item.title,
    status: mapListingStatus(item.status),
    permalink: item.permalink,
    thumbnailUrl: item.thumbnail,
    currency: item.currency_id,
    price: item.price,
    availableQuantity: item.available_quantity,
    soldQuantity: item.sold_quantity,
    categoryExternalId: item.category_id,
    categoryName: null, // exigiria uma chamada extra em /categories/{id} — feito sob demanda por quem consome, não aqui
    qualityScore: item.health ?? null,
    variations: (item.variations ?? []).map((v) => ({
      variationExternalId: String(v.id),
      attributes: Object.fromEntries((v.attribute_combinations ?? []).map((a) => [a.name, a.value_name])),
    })),
    raw: item,
  };
}
