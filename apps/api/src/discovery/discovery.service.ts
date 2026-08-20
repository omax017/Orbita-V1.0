import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { computeOpportunityScore } from "./opportunity-score";

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
  constructor(private readonly prisma: PrismaService) {}

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
    const visits30d = 300 + Math.floor(this.seededRandom(`${seed}-visits`) * 14_700);
    const conversionPercent = Math.round((2 + this.seededRandom(`${seed}-conv`) * 9) * 10) / 10;
    const sales30d = Math.round(visits30d * (conversionPercent / 100));
    const price = Math.round((25 + this.seededRandom(`${seed}-price`) * 220) * 100) / 100;

    const result = {
      sourceUrl: url,
      price,
      sales30d,
      visits30d,
      conversionPercent,
      revenue30d: Math.round(sales30d * price * 100) / 100,
    };

    await this.saveHistory(workspaceId, userId, "ANUNCIO", url, result);
    return result;
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
