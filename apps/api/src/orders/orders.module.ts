import { Module } from "@nestjs/common";

/**
 * Módulo "Pedidos". Sincroniza Order/OrderItem via
 * `MarketplaceConnectorRegistry` (módulo Integrations), normaliza status por
 * marketplace e calcula `netProfitAmount` (preço - taxas - frete - imposto -
 * custo do produto - Ads alocado) usado no Dashboard e no Financeiro.
 */
@Module({})
export class OrdersModule {}
