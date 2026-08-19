import type { PeriodSelection } from "@/components/filters/types";
import { ALL_ACCOUNTS_ID } from "@/components/filters/types";
import { MOCK_ACCOUNTS } from "@/components/filters/mock-accounts";

/**
 * Tudo neste arquivo é dado FAKE — a Etapa 3 constrói só a tela. A conexão
 * com dados reais (Order/OrderItem/Sku agregados por workspace/marketplace
 * account) entra na etapa de integrações, quando os connectors ML/Shopee
 * saírem do estágio de stub (ver apps/api/src/integrations).
 *
 * Para simular o estado "workspace novo, sem nada cadastrado ainda" (mostra
 * o card de onboarding), troque MOCK_HAS_SKUS para `false`.
 */
export const MOCK_HAS_SKUS = false;

export { MOCK_ACCOUNTS };

function accountFactor(accountId: string): number {
  if (accountId === ALL_ACCOUNTS_ID) return 1;
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId);
  if (!account) return 1;
  return account.provider === "MERCADO_LIVRE" ? 0.66 : 0.34;
}

function periodDays(period: PeriodSelection): number {
  return Math.max(1, Math.round((period.to.getTime() - period.from.getTime()) / 86_400_000) + 1);
}

// Variação % vs. o período anterior equivalente — hardcoded por preset (dado
// fake), não recalculado a partir de um "período anterior" real ainda.
const CHANGE_BY_PRESET: Record<PeriodSelection["preset"], { revenue: number; sales: number; profit: number }> = {
  today: { revenue: 5.2, sales: 3.1, profit: 8.4 },
  "7d": { revenue: 12.4, sales: 9.8, profit: 15.1 },
  "30d": { revenue: 18.6, sales: 14.2, profit: 22.3 },
  custom: { revenue: 10.0, sales: 7.5, profit: 12.0 },
};

export interface SmartAlert {
  id: string;
  severity: "warning" | "critical";
  title: string;
  description: string;
}

export interface FeaturedProduct {
  title: string;
  unitsSold: number;
  revenue: number;
  marginPercent: number;
  profit: number;
}

export interface MonthlyPoint {
  month: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface DashboardMockData {
  ordersMissingCost: { count: number; revenueAffected: number };
  kpis: {
    revenue: { value: number; changePercent: number };
    totalSales: { value: number; changePercent: number };
    netProfit: { value: number; changePercent: number };
  };
  quickMetrics: {
    avgTicket: number;
    contributionMarginPercent: number;
    activeAccounts: number;
  };
  peakHour: { rangeLabel: string; ordersCount: number; percentAboveAverage: number };
  smartAlerts: SmartAlert[];
  featuredProduct: FeaturedProduct;
}

export function buildDashboardData(period: PeriodSelection, accountId: string): DashboardMockData {
  const days = periodDays(period);
  const factor = accountFactor(accountId);
  const change = CHANGE_BY_PRESET[period.preset];

  const revenue = Math.round(days * 1850 * factor);
  const totalSales = Math.max(1, Math.round(days * 14 * factor));
  const contributionMarginPercent = 31.5;
  const netProfit = Math.round(revenue * 0.24);
  const avgTicket = revenue / totalSales;

  const missingCount = Math.min(24, Math.max(2, Math.round(days * 0.6 * factor)));
  const revenueAffected = Math.round(missingCount * avgTicket * 0.9);

  const peakOrders = Math.max(1, Math.round(totalSales * 0.18));

  return {
    ordersMissingCost: { count: missingCount, revenueAffected },
    kpis: {
      revenue: { value: revenue, changePercent: change.revenue },
      totalSales: { value: totalSales, changePercent: change.sales },
      netProfit: { value: netProfit, changePercent: change.profit },
    },
    quickMetrics: {
      avgTicket,
      contributionMarginPercent,
      activeAccounts: accountId === ALL_ACCOUNTS_ID ? MOCK_ACCOUNTS.length : 1,
    },
    peakHour: { rangeLabel: "14h – 16h", ordersCount: peakOrders, percentAboveAverage: 32 },
    smartAlerts: [
      {
        id: "sales-drop",
        severity: "warning",
        title: "Queda de vendas às terças-feiras",
        description: "Terças-feiras têm vendido 22% menos que a média das últimas 4 semanas.",
      },
      {
        id: "missing-cost",
        severity: missingCount > 10 ? "critical" : "warning",
        title: "Produtos sem custo cadastrado",
        description: `${missingCount} pedidos recentes não têm SKU/custo vinculado — o lucro líquido desses pedidos pode estar incorreto.`,
      },
      {
        id: "negative-margin",
        severity: "critical",
        title: "Margem negativa em um anúncio",
        description: "“Suporte de TV Preto” está vendendo com prejuízo (margem de -8%) depois do último ajuste de frete.",
      },
    ],
    featuredProduct: {
      title: "Kit Organizador de Cozinha 5 Peças",
      unitsSold: Math.max(3, Math.round(totalSales * 0.12)),
      revenue: Math.round(revenue * 0.15),
      marginPercent: 34.2,
      profit: Math.round(revenue * 0.15 * 0.342),
    },
  };
}

// Performance mensal — sempre os últimos 6 meses corridos (independe do
// seletor de período, que serve pros KPIs/cards de topo). Base "todas as
// contas"; escalada pelo mesmo fator de conta usado acima.
const MONTHLY_BASE: Array<{ revenue: number; profit: number; orders: number }> = [
  { revenue: 42000, profit: 9800, orders: 340 },
  { revenue: 45500, profit: 10900, orders: 365 },
  { revenue: 48200, profit: 11600, orders: 382 },
  { revenue: 51000, profit: 12750, orders: 401 },
  { revenue: 47800, profit: 10500, orders: 375 },
  { revenue: 56300, profit: 14200, orders: 428 },
];

const MONTH_FORMAT = new Intl.DateTimeFormat("pt-BR", { month: "short" });

export function buildMonthlyPerformance(accountId: string): MonthlyPoint[] {
  const factor = accountFactor(accountId);
  const now = new Date();

  return MONTHLY_BASE.map((point, index) => {
    const monthsAgo = MONTHLY_BASE.length - 1 - index;
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const label = MONTH_FORMAT.format(date).replace(".", "");
    return {
      month: label.charAt(0).toUpperCase() + label.slice(1),
      revenue: Math.round(point.revenue * factor),
      profit: Math.round(point.profit * factor),
      orders: Math.round(point.orders * factor),
    };
  });
}
