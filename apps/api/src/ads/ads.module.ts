import { Module } from "@nestjs/common";

/**
 * Módulo "Publicidade" (Ads). Sincroniza AdCampaign/AdMetricDaily via
 * `MarketplaceConnectorRegistry`. CTR/ACOS/ROAS são derivados em tempo de
 * consulta a partir das métricas brutas (impressions/clicks/spend/revenue).
 */
@Module({})
export class AdsModule {}
