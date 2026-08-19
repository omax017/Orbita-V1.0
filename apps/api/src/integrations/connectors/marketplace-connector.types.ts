import { MarketplaceProvider } from "@prisma/client";

/**
 * Formas de dados NORMALIZADAS e agnósticas de marketplace.
 *
 * Cada `MarketplaceConnector` (Mercado Livre, Shopee, e qualquer marketplace
 * futuro) é responsável por traduzir o payload específico da API dele para
 * essas formas. O core do produto (services de Orders/Listings/Ads, jobs de
 * sincronização, cálculo de DRE) NUNCA deve conhecer o formato bruto de uma
 * API de marketplace — só conversa com estes tipos.
 */

export interface ConnectorCredentials {
  accessToken: string;
  refreshToken?: string;
  /** Identificador da conta no marketplace (ex.: user_id do ML, shop_id da Shopee). */
  externalAccountId: string;
}

export interface ConnectorTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date | null;
  scopes: string[];
}

export interface ConnectorAccountInfo {
  externalAccountId: string;
  externalAccountName: string;
  raw?: unknown;
}

export interface PagedResult<T> {
  items: T[];
  /** Cursor/offset/token específico do provider — repassar de volta em `pageParam` na próxima chamada. */
  nextPage: string | null;
  total?: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type NormalizedOrderStatus =
  | "PENDING"
  | "PAID"
  | "IN_PREPARATION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "RETURNED";

export interface NormalizedOrderItem {
  externalItemId: string | null;
  externalListingId: string | null;
  title: string;
  quantity: number;
  unitPriceAmount: number;
  /** Variação (cor/tamanho) quando existir — usado para casar com ListingSku.variationExternalId. */
  variationExternalId?: string;
}

export interface NormalizedOrder {
  externalOrderId: string;
  status: NormalizedOrderStatus;
  /** Status bruto do marketplace, preservado para debug/auditoria (Order.marketplaceStatus). */
  rawStatus: string;
  buyerNickname: string | null;
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  marketplaceFeeAmount: number;
  taxAmount: number;
  totalAmount: number;
  orderedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  canceledAt: Date | null;
  items: NormalizedOrderItem[];
  raw: unknown;
}

export type NormalizedListingStatus =
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "UNDER_REVIEW";

export interface NormalizedListing {
  externalListingId: string;
  title: string;
  status: NormalizedListingStatus;
  permalink: string | null;
  thumbnailUrl: string | null;
  currency: string;
  price: number;
  availableQuantity: number;
  soldQuantity: number;
  categoryExternalId: string | null;
  categoryName: string | null;
  qualityScore: number | null;
  /** Variações do anúncio (cor/tamanho/etc.), quando o marketplace suportar. */
  variations: Array<{ variationExternalId: string; attributes: Record<string, string> }>;
  raw: unknown;
}

export type NormalizedAdCampaignStatus = "ACTIVE" | "PAUSED" | "ENDED";

export interface NormalizedAdCampaign {
  externalCampaignId: string;
  name: string;
  status: NormalizedAdCampaignStatus;
  objective: string | null;
  dailyBudgetAmount: number;
  startDate: Date | null;
  endDate: Date | null;
  raw: unknown;
}

export interface NormalizedAdMetricDay {
  date: Date; // apenas a data (sem horário) — representa um dia de métricas
  impressions: number;
  clicks: number;
  spendAmount: number;
  attributedRevenue: number;
  attributedOrders: number;
}

/**
 * Evento de webhook já normalizado (tipo + ids), para o dispatcher decidir
 * qual job de sincronização enfileirar (ex.: "chegou pedido novo, sincronizar
 * pedido X da conta Y").
 */
export interface NormalizedWebhookEvent {
  provider: MarketplaceProvider;
  externalAccountId: string;
  topic: "ORDER" | "LISTING" | "AD_CAMPAIGN" | "OTHER";
  externalResourceId: string;
  raw: unknown;
}

export interface ListOrdersParams {
  updatedSince?: Date;
  pageParam?: string | null;
}

export interface ListListingsParams {
  status?: NormalizedListingStatus;
  pageParam?: string | null;
}

export interface ListAdCampaignsParams {
  pageParam?: string | null;
}

export interface GetAuthorizationUrlParams {
  redirectUri: string;
  /** Usado para casar o callback OAuth de volta ao workspace que iniciou o fluxo. */
  state: string;
}

export interface ExchangeCodeParams {
  code: string;
  redirectUri: string;
}
