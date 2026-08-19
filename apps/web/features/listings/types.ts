/** Espelha o enum ListingStatus do Prisma. */
export type ListingStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "UNDER_REVIEW";

export type ListingProvider = "MERCADO_LIVRE" | "SHOPEE";

/** "Canal" — de onde vem a visibilidade do anúncio (orgânico ou impulsionado por Ads). */
export type ListingChannel = "Orgânico" | "Ads";

export type ListingKind = "Clássico" | "Premium" | "Padrão" | "Impulsionado";

export type LogisticsType = "Full" | "Correios" | "Coleta" | "Agência";

export type CompetitivePosition = "WINNING" | "LOSING" | "UNKNOWN";

export const COMPETITIVE_POSITION_LABEL: Record<CompetitivePosition, string> = {
  WINNING: "Ganhando",
  LOSING: "Perdendo",
  UNKNOWN: "—",
};

export interface MockListing {
  id: string;
  externalId: string;
  provider: ListingProvider;
  accountLabel: string;
  title: string;
  thumbnailColor: string;
  price: number;
  status: ListingStatus;
  listingKind: ListingKind;
  logisticsType: LogisticsType;
  channel: ListingChannel;
  /** Etiqueta livre que o seller usa pra organizar anúncios (ex.: "Black Friday", "Linha Cozinha"). */
  tag: string | null;
  fromCatalog: boolean;
  skuCode: string | null;
  competitivePosition: CompetitivePosition;
  availableQuantity: number;
  /** Vendas/faturamento/recebido no período — mockado fixo, não filtra por período nesta etapa. */
  salesCount: number;
  revenue: number;
  netReceived: number;
  hasPackagingCost: boolean;
  createdAt: Date;
}
