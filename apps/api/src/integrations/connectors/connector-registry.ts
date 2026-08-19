import { Inject, Injectable, Provider } from "@nestjs/common";
import { MarketplaceProvider } from "@prisma/client";
import { MarketplaceConnector } from "./marketplace-connector.interface";

/** Token de injeção usado para agregar todos os connectors registrados. */
export const MARKETPLACE_CONNECTORS = "MARKETPLACE_CONNECTORS";

/**
 * Ponto único de acesso a connectors de marketplace. Services de domínio
 * (Orders, Listings, Ads) injetam `MarketplaceConnectorRegistry` e chamam
 * `registry.get(provider)` — nunca importam `MercadoLivreConnector` ou
 * `ShopeeConnector` diretamente. Isso é o que isola o core de qualquer
 * marketplace específico.
 *
 * Para adicionar um novo marketplace: implemente `MarketplaceConnector` e
 * registre a classe no array do provider `MARKETPLACE_CONNECTORS` em
 * `integrations.module.ts` — nenhum outro módulo precisa mudar.
 */
@Injectable()
export class MarketplaceConnectorRegistry {
  private readonly connectors = new Map<MarketplaceProvider, MarketplaceConnector>();

  constructor(
    @Inject(MARKETPLACE_CONNECTORS) connectors: MarketplaceConnector[],
  ) {
    for (const connector of connectors) {
      this.connectors.set(connector.provider, connector);
    }
  }

  get(provider: MarketplaceProvider): MarketplaceConnector {
    const connector = this.connectors.get(provider);
    if (!connector) {
      throw new Error(`Nenhum MarketplaceConnector registrado para ${provider}`);
    }
    return connector;
  }

  list(): MarketplaceConnector[] {
    return Array.from(this.connectors.values());
  }
}

/**
 * Helper para declarar o provider `MARKETPLACE_CONNECTORS` a partir da lista
 * de classes de connector, mantendo `integrations.module.ts` legível.
 */
export function createConnectorsProvider(
  connectorClasses: Array<new (...args: never[]) => MarketplaceConnector>,
): Provider {
  return {
    provide: MARKETPLACE_CONNECTORS,
    useFactory: (...instances: MarketplaceConnector[]) => instances,
    inject: connectorClasses,
  };
}
