import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { mlFetch } from "../integrations/connectors/mercado-livre/mercado-livre.api-client";
import type { MlItem, MlSellerResponse } from "../integrations/connectors/mercado-livre/mercado-livre.types";
import { MarketplaceAccountsService } from "../integrations/marketplace-accounts.service";
import { computeOpportunityScore } from "./opportunity-score";

/** ML manda o nível de reputação como string tipo "5_green" — mapeia pro
 * mesmo vocabulário (Excelente/Boa/Regular/Nova) usado no resto do produto. */
function mapMlReputation(levelId: string | null | undefined): "Excelente" | "Boa" | "Regular" | "Nova" {
  if (!levelId) return "Nova";
  if (levelId.startsWith("5") || levelId.startsWith("4")) return "Excelente";
  if (levelId.startsWith("3")) return "Boa";
  if (levelId.startsWith("2") || levelId.startsWith("1")) return "Regular";
  return "Nova";
}

function yearsSince(isoDate: string | undefined): number {
  if (!isoDate) return 0;
  const years = (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
  return Math.max(0, Math.round(years * 10) / 10);
}

/**
 * Tudo aqui é gerado (seed determinístico por hash, mesmo algoritmo do mock
 * do frontend em `apps/web/features/discovery/mock-data.ts`) — sem scraping
 * nem API real ainda, exatamente como decidido na Etapa 7 ("não implemente a
 * coleta real ainda"). A diferença desta etapa é que agora existe um
 * endpoint de VERDADE (chamável pela extensão de navegador) que devolve esse
 * resultado E grava em `SearchHistory` — antes só existia no frontend, sem
 * persistência real.
 *
 * A lógica de geração é deliberadamente reimplementada aqui (não
 * compartilhada com o frontend) — é código descartável, será substituído
 * por integração real de coleta; não vale a pena criar um pacote
 * compartilhado só para isso.
 */
@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketplaceAccounts: MarketplaceAccountsService,
  ) {}

  private seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
    }
    return (Math.abs(hash) % 1000) / 1000;
  }

  async garimpador(workspaceId: string, userId: string, termo: string, categoria: string) {
    const seed = `${termo.toLowerCase().trim()}|${categoria}`;
    const totalSales = 800 + Math.floor(this.seededRandom(`${seed}-total`) * 24_200);
    const avgPrice = 30 + this.seededRandom(`${seed}-avgprice`) * 180;
    const addressableMarket = Math.round(totalSales * avgPrice);
    const visits30d = Math.round(totalSales * (8 + this.seededRandom(`${seed}-visitratio`) * 12));

    // Entradas novas pra Pontuação de Oportunidade (ver opportunity-score.ts)
    // — ainda geradas (sem scraping real, Etapa 7/16), mas o SCORE em cima
    // delas é um cálculo de verdade, não mockado.
    const competitorCount = 1 + Math.floor(this.seededRandom(`${seed}-competitors`) * 12);
    const visitsTrendGrowthPercent = Math.round((this.seededRandom(`${seed}-trend`) - 0.5) * 100); // -50% a +50%

    // Margem de contribuição estimada pro preço médio do nicho — mesma
    // fórmula do módulo Financeiro (preço = custo × 2.4, taxa 12%, frete
    // líquido 7,2%, imposto 6%), assumindo que o preço médio observado JÁ
    // reflete essa estrutura de custo típica da categoria.
    const estimatedCost = avgPrice / 2.4;
    const fee = avgPrice * 0.12;
    const shippingNet = avgPrice * 0.072;
    const tax = avgPrice * 0.06;
    const estimatedMarginPercent = ((avgPrice - estimatedCost - fee - shippingNet - tax) / avgPrice) * 100;

    const opportunity = computeOpportunityScore({
      totalSales,
      addressableMarket,
      competitorCount,
      visitsTrendGrowthPercent,
      estimatedMarginPercent,
    });

    const result = {
      term: termo,
      category: categoria,
      totalSales,
      addressableMarket,
      visits30d,
      competitorCount,
      visitsTrendGrowthPercent,
      estimatedMarginPercent: Math.round(estimatedMarginPercent * 10) / 10,
      opportunityScore: opportunity.score,
      opportunityFactors: opportunity.factors,
    };

    await this.saveHistory(workspaceId, userId, "GARIMPADOR", `${termo} — ${categoria}`, result);
    return result;
  }

  async concorrentes(workspaceId: string, userId: string, url: string) {
    const seed = url.trim().toLowerCase();
    const totalSales = 500 + Math.floor(this.seededRandom(`${seed}-sales`) * 49_500);
    const visits30d = Math.round(totalSales * (6 + this.seededRandom(`${seed}-visitratio`) * 10));
    const addressableMarket = Math.round(totalSales * (40 + this.seededRandom(`${seed}-price`) * 160));

    const result = {
      sourceUrl: url,
      seller: {
        name: `Vendedor ${seed.slice(-6)}`,
        reputation: ["Excelente", "Boa", "Regular", "Nova"][Math.floor(this.seededRandom(`${seed}-rep`) * 4)],
        memberSinceYears: 1 + Math.floor(this.seededRandom(`${seed}-age`) * 9),
        totalListings: 20 + Math.floor(this.seededRandom(`${seed}-listings`) * 480),
        totalSales,
      },
      totalSales,
      visits30d,
      addressableMarket,
    };

    await this.saveHistory(workspaceId, userId, "CONCORRENTE", url, result);
    return result;
  }

  async anuncio(workspaceId: string, userId: string, url: string) {
    const seed = url.trim().toLowerCase();
    // Visitas/conversão continuam GERADAS mesmo quando o item é real: a API
    // pública do ML não expõe essas métricas pra item de OUTRO vendedor (só
    // pro dono do anúncio, via escopo que a Órbita não pede) — não tem como
    // buscar isso de verdade sem ser o próprio vendedor logado.
    const visits30d = 300 + Math.floor(this.seededRandom(`${seed}-visits`) * 14_700);
    const conversionPercent = Math.round((2 + this.seededRandom(`${seed}-conv`) * 9) * 10) / 10;
    const sales30d = Math.round(visits30d * (conversionPercent / 100));
    const generatedPrice = Math.round((25 + this.seededRandom(`${seed}-price`) * 220) * 100) / 100;

    const real = await this.tryFetchRealListing(workspaceId, url);

    const result = real
      ? {
          sourceUrl: url,
          isReal: true as const,
          title: real.item.title,
          price: real.item.price,
          thumbnailUrl: real.item.thumbnail,
          permalink: real.item.permalink,
          totalSalesAllTime: real.item.sold_quantity,
          sales30d,
          visits30d,
          conversionPercent,
          revenue30d: Math.round(sales30d * real.item.price * 100) / 100,
          seller: real.seller
            ? {
                name: real.seller.nickname,
                reputation: mapMlReputation(real.seller.seller_reputation?.level_id),
                memberSinceYears: yearsSince(real.seller.registration_date),
                totalSales: real.seller.seller_reputation?.transactions?.total ?? 0,
              }
            : null,
        }
      : {
          sourceUrl: url,
          isReal: false as const,
          price: generatedPrice,
          sales30d,
          visits30d,
          conversionPercent,
          revenue30d: Math.round(sales30d * generatedPrice * 100) / 100,
        };

    await this.saveHistory(workspaceId, userId, "ANUNCIO", url, result);
    return result;
  }

  /**
   * Tenta buscar o anúncio DE VERDADE via API do Mercado Livre, usando o
   * token de alguma conta conectada do workspace (não precisa ser o dono do
   * anúncio — `GET /items/{id}` é público, só que o ML passou a exigir um
   * Bearer token válido pra responder, mesmo pra item de terceiro; ver
   * ARCHITECTURE.md § 20). Devolve `null` em qualquer cenário que impeça o
   * dado real (sem conta conectada, URL não é do ML, item não encontrado,
   * token expirado) — quem chama cai de volta pros dados gerados.
   */
  private async tryFetchRealListing(
    workspaceId: string,
    url: string,
  ): Promise<{ item: MlItem; seller: MlSellerResponse | null } | null> {
    const match = url.match(/MLB-?(\d{5,})/i);
    if (!match) return null;
    const itemId = `MLB${match[1]}`;

    const account = await this.prisma.marketplaceAccount.findFirst({
      where: { workspaceId, provider: "MERCADO_LIVRE", status: "CONNECTED" },
    });
    if (!account) return null;

    try {
      if (account.tokenExpiresAt && account.tokenExpiresAt.getTime() < Date.now() + 60_000) {
        await this.marketplaceAccounts.refreshToken(account.id);
      }
      const { credentials } = await this.marketplaceAccounts.getCredentials(account.id);

      const item = await mlFetch<MlItem>(`/items/${itemId}`, { accessToken: credentials.accessToken });
      const seller = item.seller_id
        ? await mlFetch<MlSellerResponse>(`/users/${item.seller_id}`, { accessToken: credentials.accessToken }).catch(() => null)
        : null;

      return { item, seller };
    } catch (error) {
      this.logger.warn(`Falha ao buscar anúncio real ${itemId}: ${(error as Error).message}`);
      return null;
    }
  }

  async history(workspaceId: string) {
    return this.prisma.searchHistory.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  private async saveHistory(
    workspaceId: string,
    userId: string,
    type: "GARIMPADOR" | "CONCORRENTE" | "ANUNCIO",
    queryText: string,
    result: object,
  ) {
    await this.prisma.searchHistory.create({
      data: {
        workspaceId,
        userId,
        queryText,
        filters: { type },
        resultsSummary: result as object,
      },
    });
  }
}
