import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MarketplaceProvider } from "@prisma/client";
import type { AppConfig } from "../../../config/configuration";
import { MarketplaceConnector } from "../marketplace-connector.interface";
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
} from "../marketplace-connector.types";
import { ML_API_BASE, ML_AUTH_BASE, mlFetch, mlFetchToken } from "./mercado-livre.api-client";
import { mapListing, mapOrder } from "./mercado-livre.mappers";
import type {
  MlItem,
  MlItemsSearchResponse,
  MlOrder,
  MlOrdersSearchResponse,
  MlShipment,
  MlTokenResponse,
  MlUserResponse,
} from "./mercado-livre.types";

const ORDERS_PAGE_SIZE = 50; // limite prático da API (máximo documentado é 51)
const ITEMS_PAGE_SIZE = 50;

/**
 * Implementação real do Mercado Livre para `MarketplaceConnector`.
 *
 * Cobre OAuth 2.0 (autorização + troca/renovação de token), Orders API,
 * Items API e o equivalente prático de "Billing/Fees" (a comissão do ML já
 * vem embutida em cada `order_item.sale_fee` — não existe endpoint de fees
 * separado por pedido). Shipments API entra via `fetchOrder`/`listOrders`
 * (busca o shipment vinculado pra status de entrega e custo de frete).
 *
 * `listAdCampaigns`/`fetchAdMetrics` (Product Ads) ficam FORA do escopo desta
 * etapa — o pedido da Etapa 9 cobre Orders/Items/Shipments/Billing, não Ads.
 *
 * ⚠️ Não testado contra a API real do ML ainda — depende de
 * `MERCADO_LIVRE_CLIENT_ID`/`CLIENT_SECRET`/`REDIRECT_URI` reais no `.env`
 * (ver `ARCHITECTURE.md` Etapa 9 para o checklist do que falta verificar).
 *
 * Docs: https://developers.mercadolivre.com.br/pt_br/api-docs-pt-br
 */
@Injectable()
export class MercadoLivreConnector implements MarketplaceConnector {
  readonly provider = MarketplaceProvider.MERCADO_LIVRE;
  private readonly logger = new Logger(MercadoLivreConnector.name);
  private readonly config: AppConfig["mercadoLivre"];

  constructor(configService: ConfigService) {
    this.config = configService.get<AppConfig>("app")!.mercadoLivre;
  }

  private requireCredentials(): { clientId: string; clientSecret: string } {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error(
        "MERCADO_LIVRE_CLIENT_ID/MERCADO_LIVRE_CLIENT_SECRET não configurados — cadastre o app em https://developers.mercadolivre.com.br/devcenter e preencha o .env",
      );
    }
    return { clientId: this.config.clientId, clientSecret: this.config.clientSecret };
  }

  getAuthorizationUrl({ redirectUri, state }: GetAuthorizationUrlParams): string {
    const { clientId } = this.requireCredentials();
    const url = new URL(`${ML_AUTH_BASE}/authorization`);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    return url.toString();
  }

  async exchangeCodeForToken({ code, redirectUri }: ExchangeCodeParams): Promise<ConnectorTokenResult> {
    const { clientId, clientSecret } = this.requireCredentials();
    const response = await mlFetchToken<MlTokenResponse>({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });
    return this.toTokenResult(response);
  }

  async refreshAccessToken(refreshToken: string): Promise<ConnectorTokenResult> {
    const { clientId, clientSecret } = this.requireCredentials();
    const response = await mlFetchToken<MlTokenResponse>({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });
    return this.toTokenResult(response);
  }

  private toTokenResult(response: MlTokenResponse): ConnectorTokenResult {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      // expires_in do ML é ~6h (21600s) — sempre curto, por isso offline_access
      // (que devolve refresh_token) é obrigatório pro app não pedir login de novo.
      expiresAt: new Date(Date.now() + response.expires_in * 1000),
      scopes: response.scope ? response.scope.split(" ") : [],
    };
  }

  async fetchAccountInfo(credentials: ConnectorCredentials): Promise<ConnectorAccountInfo> {
    const user = await mlFetch<MlUserResponse>("/users/me", { accessToken: credentials.accessToken });
    return {
      externalAccountId: String(user.id),
      externalAccountName: user.nickname,
      raw: user,
    };
  }

  async listOrders(credentials: ConnectorCredentials, params: ListOrdersParams): Promise<PagedResult<NormalizedOrder>> {
    const offset = params.pageParam ? Number(params.pageParam) : 0;
    const searchParams: Record<string, string | number | undefined> = {
      seller: credentials.externalAccountId,
      sort: "date_desc",
      limit: ORDERS_PAGE_SIZE,
      offset,
    };
    if (params.updatedSince) {
      searchParams["order.date_last_updated.from"] = params.updatedSince.toISOString();
    }

    const response = await mlFetch<MlOrdersSearchResponse>("/orders/search", {
      accessToken: credentials.accessToken,
      searchParams,
    });

    // Shipment por pedido custa 1 request extra cada — só vale a pena aqui
    // porque status de entrega (SHIPPED/DELIVERED) depende dele. Em paralelo
    // (Promise.all) pra não serializar N requests.
    const items = await Promise.all(
      response.results.map(async (order) => {
        const shipment = await this.fetchShipmentSafe(credentials.accessToken, order.shipping?.id ?? null);
        return mapOrder(order, shipment);
      }),
    );

    const nextOffset = offset + response.results.length;
    const nextPage = nextOffset < response.paging.total ? String(nextOffset) : null;

    return { items, nextPage, total: response.paging.total };
  }

  async fetchOrder(credentials: ConnectorCredentials, externalOrderId: string): Promise<NormalizedOrder> {
    const order = await mlFetch<MlOrder>(`/orders/${externalOrderId}`, { accessToken: credentials.accessToken });
    const shipment = await this.fetchShipmentSafe(credentials.accessToken, order.shipping?.id ?? null);
    return mapOrder(order, shipment);
  }

  private async fetchShipmentSafe(accessToken: string, shipmentId: number | null): Promise<MlShipment | null> {
    if (!shipmentId) return null;
    try {
      return await mlFetch<MlShipment>(`/shipments/${shipmentId}`, { accessToken });
    } catch (error) {
      // Não deixa a sincronização inteira falhar por causa de 1 shipment sem
      // acesso (ex.: envio muito antigo/arquivado) — loga e segue sem os
      // dados de entrega desse pedido específico.
      this.logger.warn(`Falha ao buscar shipment ${shipmentId}: ${(error as Error).message}`);
      return null;
    }
  }

  async listListings(credentials: ConnectorCredentials, params: ListListingsParams): Promise<PagedResult<NormalizedListing>> {
    const offset = params.pageParam ? Number(params.pageParam) : 0;
    const search = await mlFetch<MlItemsSearchResponse>(`/users/${credentials.externalAccountId}/items/search`, {
      accessToken: credentials.accessToken,
      searchParams: { limit: ITEMS_PAGE_SIZE, offset, status: params.status ? params.status.toLowerCase() : undefined },
    });

    // A busca só devolve IDs — precisa de "multiget" (`/items?ids=...`) pros detalhes.
    const items = search.results.length > 0 ? await this.fetchItemsMultiget(search.results, credentials.accessToken) : [];

    const nextOffset = offset + search.results.length;
    const nextPage = nextOffset < search.paging.total ? String(nextOffset) : null;

    return { items: items.map(mapListing), nextPage, total: search.paging.total };
  }

  /** Bug real achado sincronizando uma conta de verdade: essa chamada nunca
   * mandava `accessToken` — o ML aceitava sem token até pouco tempo atrás,
   * mas mudou a política (mesma mudança documentada em
   * `DiscoveryService.tryFetchRealListing`, Etapa 20) e passou a devolver
   * 401 pra `/items?ids=...` sem Bearer, quebrando a sincronização de
   * anúncios inteira (`Erro: Mercado Livre API respondeu 401 para
   * .../items`, visível em `lastSyncError` na tela de Integrações). */
  private async fetchItemsMultiget(ids: string[], accessToken: string): Promise<MlItem[]> {
    // /items?ids=... aceita até 20 IDs por chamada.
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 20) chunks.push(ids.slice(i, i + 20));

    const results = await Promise.all(
      chunks.map((chunk) =>
        mlFetch<Array<{ code: number; body: MlItem }>>(`${ML_API_BASE}/items`, {
          accessToken,
          searchParams: { ids: chunk.join(",") },
        }),
      ),
    );

    return results.flat().filter((r) => r.code === 200).map((r) => r.body);
  }

  async fetchListing(credentials: ConnectorCredentials, externalListingId: string): Promise<NormalizedListing> {
    const item = await mlFetch<MlItem>(`/items/${externalListingId}`, { accessToken: credentials.accessToken });
    return mapListing(item);
  }

  async listAdCampaigns(_credentials: ConnectorCredentials, _params: ListAdCampaignsParams): Promise<PagedResult<NormalizedAdCampaign>> {
    throw new Error("MercadoLivreConnector.listAdCampaigns: fora do escopo da Etapa 9 (Product Ads não pedido)");
  }

  async fetchAdMetrics(_credentials: ConnectorCredentials, _externalCampaignId: string, _range: DateRange): Promise<NormalizedAdMetricDay[]> {
    throw new Error("MercadoLivreConnector.fetchAdMetrics: fora do escopo da Etapa 9 (Product Ads não pedido)");
  }

  /**
   * Webhooks do ML ("Notificações") mandam só `{ topic, resource, user_id,
   * application_id, sent, _id }` — o `resource` é o path pra buscar o dado de
   * verdade (ex.: "/orders/123"). Aqui só extraímos o suficiente pra
   * enfileirar o job certo; quem processa a fila é que busca o recurso.
   */
  parseWebhookEvent(payload: unknown, _headers: Record<string, string>): NormalizedWebhookEvent | null {
    const body = payload as { topic?: string; resource?: string; user_id?: number } | null;
    if (!body?.topic || !body.resource) return null;

    const topicMap: Record<string, NormalizedWebhookEvent["topic"]> = {
      orders_v2: "ORDER",
      items: "LISTING",
      shipments: "OTHER",
    };
    const topic = topicMap[body.topic];
    if (!topic) return null;

    const resourceId = body.resource.split("/").filter(Boolean).pop();
    if (!resourceId) return null;

    return {
      provider: this.provider,
      externalAccountId: String(body.user_id ?? ""),
      topic,
      externalResourceId: resourceId,
      raw: payload,
    };
  }
}
