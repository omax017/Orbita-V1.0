import type {
  ActiveSession,
  Invoice,
  MarginSettings,
  OrderPackage,
  PaymentMethod,
  PlanTier,
  ReferralEntry,
  WorkspaceMember,
} from "./types";

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

export const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
  { id: "sess_1", device: "Chrome · Windows", location: "São Paulo, BR", ipAddress: "187.54.12.201", lastActiveAt: daysAgo(0), isCurrent: true },
  { id: "sess_2", device: "App Órbita · Android", location: "São Paulo, BR", ipAddress: "191.34.88.12", lastActiveAt: daysAgo(1), isCurrent: false },
  { id: "sess_3", device: "Safari · macOS", location: "Curitiba, BR", ipAddress: "179.100.22.9", lastActiveAt: daysAgo(6), isCurrent: false },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: "inv_1", issuedAt: daysAgo(3), description: "Plano Pro — Agosto/2026", amount: 149.9, status: "PAID" },
  { id: "inv_2", issuedAt: daysAgo(33), description: "Plano Pro — Julho/2026", amount: 149.9, status: "PAID" },
  { id: "inv_3", issuedAt: daysAgo(63), description: "Plano Pro — Junho/2026", amount: 149.9, status: "PAID" },
  { id: "inv_4", issuedAt: daysAgo(93), description: "Plano Starter — Maio/2026", amount: 79.9, status: "PAID" },
  { id: "inv_5", issuedAt: daysAgo(123), description: "Pacote extra — 1.000 pedidos", amount: 89.0, status: "PAID" },
];

export const MOCK_PAYMENT_METHOD: PaymentMethod = {
  brand: "Mastercard",
  lastDigits: "4821",
  expiresAt: "09/28",
  holderName: "Maria da Silva",
};

export const MOCK_PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 79.9,
    annualPrice: 799,
    orderLimit: 300,
    integrationLimit: 1,
    highlighted: false,
    features: ["1 conta de marketplace", "Até 300 pedidos/mês", "Dashboard e Financeiro", "Suporte por e-mail"],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 149.9,
    annualPrice: 1499,
    orderLimit: 1500,
    integrationLimit: 3,
    highlighted: true,
    features: ["Até 3 contas de marketplace", "Até 1.500 pedidos/mês", "Módulo Publicidade e Descobrir", "Suporte prioritário"],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 349.9,
    annualPrice: 3499,
    orderLimit: 8000,
    integrationLimit: 10,
    highlighted: false,
    features: ["Até 10 contas de marketplace", "Até 8.000 pedidos/mês", "Integração com IA (MCP)", "Suporte dedicado"],
  },
];

export const MOCK_ORDER_PACKAGES: OrderPackage[] = [
  { id: "pkg_500", extraOrders: 500, price: 49.9 },
  { id: "pkg_1000", extraOrders: 1000, price: 89.0 },
  { id: "pkg_2500", extraOrders: 2500, price: 199.0 },
];

export const DEFAULT_MARGIN_SETTINGS: MarginSettings = {
  badUpperBound: 10,
  goodUpperBound: 25,
  considerFinancingCost: false,
};

export const MOCK_REFERRALS: ReferralEntry[] = [
  { id: "ref_1", name: "Carla Nogueira", email: "carla@exemplo.com", status: "CONVERTED", invitedAt: daysAgo(40), rewardAmount: 50 },
  { id: "ref_2", name: "João Mendes", email: "joao@exemplo.com", status: "CONVERTED", invitedAt: daysAgo(22), rewardAmount: 50 },
  { id: "ref_3", name: "Patrícia Alves", email: "patricia@exemplo.com", status: "PENDING", invitedAt: daysAgo(5), rewardAmount: 0 },
];

// MOCK_CONNECTED_ACCOUNTS removido (Etapa 9/16) — a aba Integrações agora
// busca contas reais em GET /integrations/accounts. Sem mock aqui de
// propósito: a tela mostra "nenhuma conta conectada" até você conectar de
// verdade, em vez de fingir uma conexão que não existe.

export const MOCK_MEMBERS: WorkspaceMember[] = [
  { id: "mem_1", name: "Maria da Silva", email: "maria@lojadamaria.com.br", avatarUrl: null, role: "OWNER", joinedAt: daysAgo(365), status: "ACTIVE" },
  { id: "mem_2", name: "Rafael Souza", email: "rafael@lojadamaria.com.br", avatarUrl: null, role: "ADMIN", joinedAt: daysAgo(180), status: "ACTIVE" },
  { id: "mem_3", name: "Beatriz Lima", email: "beatriz@lojadamaria.com.br", avatarUrl: null, role: "MEMBER", joinedAt: daysAgo(60), status: "ACTIVE" },
  { id: "mem_4", name: "Convite pendente", email: "estagiario@lojadamaria.com.br", avatarUrl: null, role: "VIEWER", joinedAt: daysAgo(2), status: "PENDING_INVITE" },
];
