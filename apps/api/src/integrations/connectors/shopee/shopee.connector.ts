import { Injectable } from "@nestjs/common";
import { MarketplaceProvider } from "@prisma/client";
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
  PagedResult,
} from "../marketplace-connector.types";

/**
 * Implementação da Shopee para `MarketplaceConnector`.
 *
 * Esqueleto por enquanto — mesma observação do MercadoLivreConnector: a
 * implementação real (assinatura HMAC das requisições, paginação por
 * cursor, mapeamento de status da Shopee Open Platform v2) entra numa etapa
 * futura de "Integrações — Shopee".
 *
 * Docs de referência para quando for implementar:
 * https://open.shopee.com/documents
 */
@Injectable()
export class ShopeeConnector implements MarketplaceConnector {
  readonly provider = MarketplaceProvider.SHOPEE;

  getAuthorizationUrl(_params: GetAuthorizationUrlParams): string {
    throw new Error("ShopeeConnector.getAuthorizationUrl: not implemented yet");
  }

  async exchangeCodeForToken(_params: ExchangeCodeParams): Promise<ConnectorTokenResult> {
    throw new Error("ShopeeConnector.exchangeCodeForToken: not implemented yet");
  }

  async refreshAccessToken(_refreshToken: string): Promise<ConnectorTokenResult> {
    throw new Error("ShopeeConnector.refreshAccessToken: not implemented yet");
  }

  async fetchAccountInfo(_credentials: ConnectorCredentials): Promise<ConnectorAccountInfo> {
    throw new Error("ShopeeConnector.fetchAccountInfo: not implemented yet");
  }

  async listOrders(
    _credentials: ConnectorCredentials,
    _params: ListOrdersParams,
  ): Promise<PagedResult<NormalizedOrder>> {
    throw new Error("ShopeeConnector.listOrders: not implemented yet");
  }

  async fetchOrder(
    _credentials: ConnectorCredentials,
    _externalOrderId: string,
  ): Promise<NormalizedOrder> {
    throw new Error("ShopeeConnector.fetchOrder: not implemented yet");
  }

  async listListings(
    _credentials: ConnectorCredentials,
    _params: ListListingsParams,
  ): Promise<PagedResult<NormalizedListing>> {
    throw new Error("ShopeeConnector.listListings: not implemented yet");
  }

  async fetchListing(
    _credentials: ConnectorCredentials,
    _externalListingId: string,
  ): Promise<NormalizedListing> {
    throw new Error("ShopeeConnector.fetchListing: not implemented yet");
  }

  async listAdCampaigns(
    _credentials: ConnectorCredentials,
    _params: ListAdCampaignsParams,
  ): Promise<PagedResult<NormalizedAdCampaign>> {
    throw new Error("ShopeeConnector.listAdCampaigns: not implemented yet");
  }

  async fetchAdMetrics(
    _credentials: ConnectorCredentials,
    _externalCampaignId: string,
    _range: DateRange,
  ): Promise<NormalizedAdMetricDay[]> {
    throw new Error("ShopeeConnector.fetchAdMetrics: not implemented yet");
  }
}
