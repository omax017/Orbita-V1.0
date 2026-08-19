/** Métrica diária de Ads por produto — espelha AdMetricDaily (Prisma), mas
 * agregada por SKU/produto em vez de por campanha, porque o relatório desta
 * etapa é "quanto cada produto rende de Ads", não "quanto cada campanha gasta". */
export interface AdDailyMetric {
  date: Date;
  skuCode: string | null;
  productTitle: string;
  provider: "MERCADO_LIVRE" | "SHOPEE";
  accountLabel: string;
  investment: number;
  adsRevenue: number;
  adsOrders: number;
}

export type AdClassification = "Estrela" | "Moderado" | "Risco" | "Prejuízo";
export type AdHealthBucket = "Lucrativo" | "Em risco" | "Prejuízo";

export const AD_HEALTH_BUCKET_OF: Record<AdClassification, AdHealthBucket> = {
  Estrela: "Lucrativo",
  Moderado: "Lucrativo",
  Risco: "Em risco",
  Prejuízo: "Prejuízo",
};

/** Resumo agregado de Ads por produto no período filtrado. */
export interface AdProductSummary {
  skuCode: string | null;
  productTitle: string;
  hasCostLinked: boolean;
  investment: number;
  adsOrders: number;
  adsRevenue: number;
  roas: number;
  acos: number;
  /** ACoS a partir do qual o produto passa a dar prejuízo com Ads (= margem de contribuição antes de Ads, em %). Só existe quando há custo vinculado. */
  breakEvenAcos: number | null;
  profitAfterAds: number | null;
  roiAfterAds: number | null;
  marginAfterAds: number | null;
  classification: AdClassification | null;
}

export interface AdsKpis {
  profitFromAds: number;
  roiAfterAdsPercent: number;
  adsRevenue: number;
  investment: number;
  roas: number;
  acos: number;
  breakEvenAcos: number;
  tacosPercent: number;
}
