import type { WorkspaceRole } from "@/lib/auth/api";

export type { WorkspaceRole };

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActiveAt: Date;
  isCurrent: boolean;
}

export type InvoiceStatus = "PAID" | "OPEN" | "OVERDUE";

export interface Invoice {
  id: string;
  issuedAt: Date;
  description: string;
  amount: number;
  status: InvoiceStatus;
}

export interface PaymentMethod {
  brand: string;
  lastDigits: string;
  expiresAt: string;
  holderName: string;
}

export type BillingCycle = "MONTHLY" | "ANNUAL";

export interface PlanTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  orderLimit: number;
  integrationLimit: number;
  highlighted: boolean;
  features: string[];
}

export interface OrderPackage {
  id: string;
  extraOrders: number;
  price: number;
}

export type MarginBand = "Ruim" | "Boa" | "Excelente";

export interface MarginSettings {
  /** Limite superior da faixa "Ruim" (0 até esse %) — também o limite inferior de "Boa". */
  badUpperBound: number;
  /** Limite superior da faixa "Boa" (dali pra cima é "Excelente"). */
  goodUpperBound: number;
  considerFinancingCost: boolean;
}

export type ReferralStatus = "PENDING" | "CONVERTED";

export interface ReferralEntry {
  id: string;
  name: string;
  email: string;
  status: ReferralStatus;
  invitedAt: Date;
  rewardAmount: number;
}

/** Espelha `MarketplaceAccountStatus` do Prisma + o "SYNCING" client-side
 * (mock local enquanto uma sincronização manual está rodando — o backend
 * real não tem esse status intermediário, é só UX otimista). */
export type IntegrationStatus = "CONNECTED" | "EXPIRED" | "ERROR" | "DISCONNECTED" | "SYNCING";

/** Formato devolvido por `GET /integrations/accounts` (Etapa 9/16) — nomes
 * batendo com `MarketplaceAccount` do Prisma, não com o mock antigo. */
export interface ConnectedAccount {
  id: string;
  provider: "MERCADO_LIVRE" | "SHOPEE";
  externalAccountName: string;
  externalAccountId: string;
  status: IntegrationStatus;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  createdAt: string;
  sales30d: number;
  listingsCount: number;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: Date;
  status: "ACTIVE" | "PENDING_INVITE";
}
