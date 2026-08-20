export type DiscoveryAnalysisType = "GARIMPADOR" | "CONCORRENTE" | "ANUNCIO";

export type LogisticsType = "Full" | "Correios" | "Coleta" | "Agência";

export interface KeywordTag {
  term: string;
  /** 1 (pouco relevante) a 10 (muito relevante) — controla o tamanho na nuvem. */
  weight: number;
}

export interface CompetitorProduct {
  id: string;
  title: string;
  thumbnailColor: string;
  price: number;
  visits30d: number;
  sales30d: number;
  logisticsType: LogisticsType;
  createdAgoDays: number;
  sellerName: string;
}

export interface VisitsTrendPoint {
  date: string;
  visits: number;
}

export interface OpportunityScoreFactor {
  label: string;
  weight: number;
  score: number;
}

export interface NicheSearchResult {
  id: string;
  term: string;
  category: string;
  totalSales: number;
  addressableMarket: number;
  visits30d: number;
  featuredProduct: CompetitorProduct;
  visitsTrend: VisitsTrendPoint[];
  keywords: KeywordTag[];
  competitors: CompetitorProduct[];
  /** Campos calculados pelo backend real (`POST /discovery/garimpador`) —
   * opcionais porque entradas antigas do histórico local (localStorage) e o
   * seed de demonstração (`SEED_DISCOVERY_HISTORY`) foram gravados antes
   * dessa etapa e não têm esses campos. */
  competitorCount?: number;
  visitsTrendGrowthPercent?: number;
  estimatedMarginPercent?: number;
  opportunityScore?: number;
  opportunityFactors?: OpportunityScoreFactor[];
}

export type SellerReputation = "Excelente" | "Boa" | "Regular" | "Nova";

export interface SellerProfile {
  name: string;
  reputation: SellerReputation;
  memberSinceYears: number;
  totalListings: number;
  totalSales: number;
}

export interface SellerCatalogResult {
  id: string;
  sourceUrl: string;
  seller: SellerProfile;
  totalSales: number;
  visits30d: number;
  addressableMarket: number;
  listings: CompetitorProduct[];
}

export interface ListingAnalysisResult {
  id: string;
  sourceUrl: string;
  title: string;
  thumbnailColor: string;
  price: number;
  sales30d: number;
  visits30d: number;
  conversionPercent: number;
  revenue30d: number;
  seller: SellerProfile;
}

interface DiscoveryHistoryBase {
  id: string;
  label: string;
  createdAt: Date;
}

export type DiscoveryHistoryEntry =
  | (DiscoveryHistoryBase & { type: "GARIMPADOR"; result: NicheSearchResult })
  | (DiscoveryHistoryBase & { type: "CONCORRENTE"; result: SellerCatalogResult })
  | (DiscoveryHistoryBase & { type: "ANUNCIO"; result: ListingAnalysisResult });
