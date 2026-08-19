import type {
  CompetitorProduct,
  DiscoveryHistoryEntry,
  ListingAnalysisResult,
  LogisticsType,
  NicheSearchResult,
  SellerCatalogResult,
  SellerProfile,
  SellerReputation,
} from "./types";

/**
 * Tudo aqui é gerado (seed determinístico por hash, não `Math.random`) — não
 * há scraping nem chamada de API real ainda. Conecta com o serviço de coleta
 * de verdade numa etapa futura; por ora só define a INTERFACE esperada dos
 * dados (ver `types.ts`) e devolve algo plausível pra qualquer termo/link.
 */

export const DISCOVERY_CATEGORIES = [
  "Casa e Cozinha",
  "Organização",
  "Eletrônicos",
  "Moda e Acessórios",
  "Beleza e Cuidado Pessoal",
  "Ferramentas",
] as const;

const THUMBNAIL_COLORS = ["bg-chart-1/20", "bg-chart-2/20", "bg-chart-3/20", "bg-chart-4/20", "bg-chart-5/20"];
const LOGISTICS: LogisticsType[] = ["Full", "Correios", "Coleta", "Agência"];
const REPUTATIONS: SellerReputation[] = ["Excelente", "Boa", "Regular", "Nova"];
const SELLER_NAMES = [
  "CasaMax Distribuidora",
  "Lar & Cia",
  "Organiza Fácil Store",
  "Point da Cozinha",
  "Décor Prático",
  "Utilidades Bella",
  "MegaCasa Oficial",
  "Espaço Ideal Produtos",
];

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function pick<T>(arr: readonly T[], seed: string): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)]!;
}

function buildSellerProfile(seed: string): SellerProfile {
  return {
    name: pick(SELLER_NAMES, `${seed}-name`),
    reputation: pick(REPUTATIONS, `${seed}-rep`),
    memberSinceYears: 1 + Math.floor(seededRandom(`${seed}-age`) * 9),
    totalListings: 20 + Math.floor(seededRandom(`${seed}-listings`) * 480),
    totalSales: 500 + Math.floor(seededRandom(`${seed}-sales`) * 49_500),
  };
}

function buildCompetitorProduct(seed: string, titleHint: string): CompetitorProduct {
  const visits30d = 200 + Math.floor(seededRandom(`${seed}-visits`) * 9800);
  const conversion = 0.02 + seededRandom(`${seed}-conv`) * 0.08;
  return {
    id: `comp_${seed}`,
    title: titleHint,
    thumbnailColor: pick(THUMBNAIL_COLORS, seed),
    price: Math.round((25 + seededRandom(`${seed}-price`) * 220) * 100) / 100,
    visits30d,
    sales30d: Math.round(visits30d * conversion),
    logisticsType: pick(LOGISTICS, `${seed}-log`),
    createdAgoDays: 15 + Math.floor(seededRandom(`${seed}-age`) * 900),
    sellerName: pick(SELLER_NAMES, `${seed}-seller`),
  };
}

const PRODUCT_TITLE_TEMPLATES = [
  (term: string) => `${term} Premium`,
  (term: string) => `${term} Reforçado 3 Peças`,
  (term: string) => `Kit ${term}`,
  (term: string) => `${term} Multiuso`,
  (term: string) => `${term} Compacto`,
  (term: string) => `${term} Grande Capacidade`,
  (term: string) => `${term} Profissional`,
  (term: string) => `${term} Antiderrapante`,
];

const KEYWORD_SUFFIXES = ["premium", "organizador", "multiuso", "inox", "compacto", "resistente", "kit", "reforçado", "grande", "antiderrapante"];

/** Busca do Garimpador — mesmo termo+categoria sempre devolve o mesmo resultado (seed determinístico). */
export function generateNicheSearch(term: string, category: string): NicheSearchResult {
  const seed = `${term.toLowerCase().trim()}|${category}`;
  const totalSales = 800 + Math.floor(seededRandom(`${seed}-total`) * 24_200);
  const avgPrice = 30 + seededRandom(`${seed}-avgprice`) * 180;
  const addressableMarket = Math.round(totalSales * avgPrice);
  const visits30d = Math.round(totalSales * (8 + seededRandom(`${seed}-visitratio`) * 12));

  const featuredProduct = buildCompetitorProduct(`${seed}-featured`, PRODUCT_TITLE_TEMPLATES[0]!(term));

  const visitsTrend = Array.from({ length: 30 }, (_, i) => {
    const daySeed = `${seed}-trend-${i}`;
    const base = visits30d / 30;
    const noise = 0.6 + seededRandom(daySeed) * 0.8;
    return { date: `D-${29 - i}`, visits: Math.round(base * noise) };
  });

  const keywords = KEYWORD_SUFFIXES.map((suffix, i) => ({
    term: `${term.toLowerCase()} ${suffix}`,
    weight: Math.max(1, Math.round(seededRandom(`${seed}-kw-${i}`) * 10)),
  })).sort((a, b) => b.weight - a.weight);

  const competitors = PRODUCT_TITLE_TEMPLATES.map((tpl, i) => buildCompetitorProduct(`${seed}-comp-${i}`, tpl(term)));

  return {
    id: `niche_${seed}`,
    term,
    category,
    totalSales,
    addressableMarket,
    visits30d,
    featuredProduct,
    visitsTrend,
    keywords,
    competitors,
  };
}

/** "Análise de Concorrentes" — link do produto devolve o catálogo do vendedor que o anuncia. */
export function generateSellerCatalog(sourceUrl: string): SellerCatalogResult {
  const seed = sourceUrl.trim().toLowerCase();
  const seller = buildSellerProfile(seed);
  const totalSales = seller.totalSales;
  const visits30d = Math.round(totalSales * (6 + seededRandom(`${seed}-visitratio`) * 10));
  const addressableMarket = Math.round(totalSales * (40 + seededRandom(`${seed}-price`) * 160));

  const listingCount = 4 + Math.floor(seededRandom(`${seed}-count`) * 5);
  const listings = Array.from({ length: listingCount }, (_, i) =>
    buildCompetitorProduct(`${seed}-listing-${i}`, PRODUCT_TITLE_TEMPLATES[i % PRODUCT_TITLE_TEMPLATES.length]!("Produto")),
  );

  return {
    id: `seller_${seed}`,
    sourceUrl,
    seller,
    totalSales,
    visits30d,
    addressableMarket,
    listings,
  };
}

/** "Análise de Anúncio" — link/ID devolve métricas individuais do anúncio. */
export function generateListingAnalysis(sourceUrl: string): ListingAnalysisResult {
  const seed = sourceUrl.trim().toLowerCase();
  const visits30d = 300 + Math.floor(seededRandom(`${seed}-visits`) * 14_700);
  const conversionPercent = Math.round((2 + seededRandom(`${seed}-conv`) * 9) * 10) / 10;
  const sales30d = Math.round(visits30d * (conversionPercent / 100));
  const price = Math.round((25 + seededRandom(`${seed}-price`) * 220) * 100) / 100;

  return {
    id: `listing_${seed}`,
    sourceUrl,
    title: PRODUCT_TITLE_TEMPLATES[Math.floor(seededRandom(`${seed}-tpl`) * PRODUCT_TITLE_TEMPLATES.length)]!("Produto Analisado"),
    thumbnailColor: pick(THUMBNAIL_COLORS, seed),
    price,
    sales30d,
    visits30d,
    conversionPercent,
    revenue30d: Math.round(sales30d * price * 100) / 100,
    seller: buildSellerProfile(seed),
  };
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

/** Histórico pré-existente — pra Histórico/"buscas recentes" não começarem vazios na primeira visita. */
export const SEED_DISCOVERY_HISTORY: DiscoveryHistoryEntry[] = [
  {
    id: "hist_1",
    type: "GARIMPADOR",
    label: "escorredor de louça — Casa e Cozinha",
    createdAt: daysAgo(6),
    result: generateNicheSearch("escorredor de louça", "Casa e Cozinha"),
  },
  {
    id: "hist_2",
    type: "GARIMPADOR",
    label: "organizador de geladeira — Organização",
    createdAt: daysAgo(4),
    result: generateNicheSearch("organizador de geladeira", "Organização"),
  },
  {
    id: "hist_3",
    type: "CONCORRENTE",
    label: "mercadolivre.com.br/p/MLB123456789",
    createdAt: daysAgo(3),
    result: generateSellerCatalog("https://www.mercadolivre.com.br/p/MLB123456789"),
  },
  {
    id: "hist_4",
    type: "ANUNCIO",
    label: "shopee.com.br/product/9988776",
    createdAt: daysAgo(2),
    result: generateListingAnalysis("https://shopee.com.br/product/9988776"),
  },
  {
    id: "hist_5",
    type: "GARIMPADOR",
    label: "suporte para panelas — Casa e Cozinha",
    createdAt: daysAgo(1),
    result: generateNicheSearch("suporte para panelas", "Casa e Cozinha"),
  },
];
