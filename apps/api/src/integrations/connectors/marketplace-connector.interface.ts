import { MarketplaceProvider } from "@prisma/client";
import {
  ConnectorAccountInfo,
  ConnectorCredentials,
  ConnectorTokenResult,
  DateRange,
  ExchangeCodeParams,
  GetAuthorizationUrlParams,
  ListAdCampaignsParams,
  ListListingsParams,
  ListOrdersParams,
  NormalizedAdCampaign,
  NormalizedAdMetricDay,
  NormalizedListing,
  NormalizedOrder,
  NormalizedWebhookEvent,
  PagedResult,
} from "./marketplace-connector.types";

/**
 * Contrato único que todo marketplace precisa implementar para se plugar na
 * Órbita. Nenhum service de domínio (Orders, Listings, Ads) deve depender de
 * `MercadoLivreConnector` ou `ShopeeConnector` diretamente — sempre injete
 * `MARKETPLACE_CONNECTOR_REGISTRY` (ver `connector-registry.ts`) e peça o
 * connector pelo `MarketplaceProvider`. Isso é o que permite adicionar um
 * novo marketplace (ex.: Amazon, Magalu) implementando só esta interface,
 * sem tocar no core.
 *
 * Cada método aqui reflete um "verbo de negócio" (listar pedidos, listar
 * anúncios, etc.) e retorna sempre os tipos normalizados de
 * `marketplace-connector.types.ts` — a tradução do formato específico da API
 * de cada marketplace acontece inteiramente dentro da implementação.
 */
export interface MarketplaceConnector {
  readonly provider: MarketplaceProvider;

  /** Monta a URL de autorização OAuth para o seller conectar a conta. */
  getAuthorizationUrl(params: GetAuthorizationUrlParams): string;

  /** Troca o `code` do callback OAuth pelos tokens de acesso. */
  exchangeCodeForToken(params: ExchangeCodeParams): Promise<ConnectorTokenResult>;

  /** Renova o access token usando o refresh token armazenado. */
  refreshAccessToken(refreshToken: string): Promise<ConnectorTokenResult>;

  /** Dados básicos da conta conectada (usados para popular MarketplaceAccount). */
  fetchAccountInfo(credentials: ConnectorCredentials): Promise<ConnectorAccountInfo>;

  /** Lista pedidos paginados, opcionalmente filtrando por data de atualização. */
  listOrders(
    credentials: ConnectorCredentials,
    params: ListOrdersParams,
  ): Promise<PagedResult<NormalizedOrder>>;

  /** Busca um pedido específico (usado por webhooks/reprocessamento pontual). */
  fetchOrder(
    credentials: ConnectorCredentials,
    externalOrderId: string,
  ): Promise<NormalizedOrder>;

  /** Lista anúncios (listings) paginados. */
  listListings(
    credentials: ConnectorCredentials,
    params: ListListingsParams,
  ): Promise<PagedResult<NormalizedListing>>;

  /** Busca um anúncio específico. */
  fetchListing(
    credentials: ConnectorCredentials,
    externalListingId: string,
  ): Promise<NormalizedListing>;

  /** Lista campanhas de publicidade (Product Ads/Shopee Ads) da conta. */
  listAdCampaigns(
    credentials: ConnectorCredentials,
    params: ListAdCampaignsParams,
  ): Promise<PagedResult<NormalizedAdCampaign>>;

  /** Métricas diárias de uma campanha dentro de um intervalo de datas. */
  fetchAdMetrics(
    credentials: ConnectorCredentials,
    externalCampaignId: string,
    range: DateRange,
  ): Promise<NormalizedAdMetricDay[]>;

  /**
   * Traduz o payload bruto de um webhook do marketplace para um evento
   * normalizado. Retorna `null` quando o evento não é relevante (o
   * dispatcher simplesmente ignora). Opcional: nem todo marketplace tem
   * webhooks — nesse caso o provider depende só do polling agendado.
   */
  parseWebhookEvent?(
    payload: unknown,
    headers: Record<string, string>,
  ): NormalizedWebhookEvent | null;
}
