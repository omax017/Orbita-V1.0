/**
 * Pontuação de Oportunidade (0-100) — algoritmo autoral da Órbita, não uma
 * cópia de nenhuma ferramenta concorrente. Combina 5 fatores que já
 * calculamos no Garimpador (nada de variável nova/mágica): demanda, tamanho
 * de mercado, concorrência, tendência de visitas e margem estimada.
 *
 * Cada fator é normalizado pra 0-100 e depois combinado por peso. Os pesos e
 * as fórmulas de normalização estão documentados abaixo — nada de "caixa
 * preta": qualquer pessoa consegue reproduzir a conta a partir do
 * `OpportunityScoreBreakdown` devolvido.
 *
 * Enquanto os dados de entrada (vendas do nicho, concorrentes, tendência)
 * ainda são gerados (Etapa 7/16 — sem scraping real ainda), o SCORE em si já
 * é um cálculo de verdade sobre esses números — não é mockado.
 */

export interface OpportunityScoreInput {
  totalSales: number;
  addressableMarket: number;
  competitorCount: number;
  visitsTrendGrowthPercent: number; // variação % de visitas do início pro fim do período
  estimatedMarginPercent: number; // margem de contribuição estimada pro preço médio do nicho
}

export interface OpportunityScoreFactor {
  label: string;
  weight: number; // 0-1
  score: number; // 0-100, já normalizado
}

export interface OpportunityScoreBreakdown {
  score: number; // 0-100, soma ponderada dos fatores
  factors: OpportunityScoreFactor[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Escala logarítmica — vendas/mercado variam em ordens de grandeza (de
 * dezenas a dezenas de milhares), então diferença linear não faz sentido
 * pra pontuação (passar de 100 pra 1.100 vendas deveria pesar mais que
 * passar de 20.000 pra 21.000). `ceiling` é o valor que já vale 100 pontos. */
function logScore(value: number, ceiling: number): number {
  if (value <= 0) return 0;
  return clamp((Math.log10(value + 1) / Math.log10(ceiling + 1)) * 100, 0, 100);
}

export function computeOpportunityScore(input: OpportunityScoreInput): OpportunityScoreBreakdown {
  const factors: OpportunityScoreFactor[] = [
    {
      label: "Demanda (vendas do nicho)",
      weight: 0.25,
      score: logScore(input.totalSales, 25_000),
    },
    {
      label: "Tamanho do mercado endereçável",
      weight: 0.15,
      score: logScore(input.addressableMarket, 5_000_000),
    },
    {
      // Menos concorrentes fortes = mais oportunidade. 10+ concorrentes já
      // zera essa parte da pontuação (mercado saturado).
      label: "Concorrência",
      weight: 0.2,
      score: clamp(100 - input.competitorCount * 10, 0, 100),
    },
    {
      // Centrado em 50 (tendência estável) — cresce até 100 com +50% de
      // crescimento de visitas no período, cai até 0 com -50%.
      label: "Tendência de visitas",
      weight: 0.15,
      score: clamp(50 + input.visitsTrendGrowthPercent, 0, 100),
    },
    {
      // 35% de margem de contribuição já vale pontuação máxima (bate com o
      // limite "Excelente" usado em Configurações → Margens, Etapa 8).
      label: "Margem estimada",
      weight: 0.25,
      score: clamp((input.estimatedMarginPercent / 35) * 100, 0, 100),
    },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0));
  return { score, factors };
}
