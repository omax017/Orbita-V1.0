import { Module } from "@nestjs/common";

/**
 * Módulo "Financeiro" (Resumo / Curva ABC / DRE / Movimentações).
 * Lê e agrega `FinancialMovement`, além de derivar visões (DRE, ABC) a
 * partir de Order/OrderItem/AdMetricDaily. Também é o módulo que gera
 * `FinancialMovement` do tipo AD_SPEND/MARKETPLACE_FEE a partir das
 * sincronizações feitas pelos módulos Orders e Ads.
 */
@Module({})
export class FinanceModule {}
