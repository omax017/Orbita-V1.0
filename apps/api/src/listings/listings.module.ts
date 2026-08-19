import { Module } from "@nestjs/common";

/**
 * Módulo "Anúncios". Sincroniza Listing via `MarketplaceConnectorRegistry`,
 * mantém status/preço/estoque disponível em dia e expõe os anúncios que o
 * módulo de Estoque (catalog) vincula a um Sku através de ListingSku.
 */
@Module({})
export class ListingsModule {}
