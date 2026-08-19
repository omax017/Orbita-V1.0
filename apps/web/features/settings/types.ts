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

export type IntegrationStatus = "CONNECTED" | "ERROR" | "SYNCING";

export interface ConnectedAccount {
  id: string;
  provider: "MERCADO_LIVRE" | "SHOPEE";
  accountName: string;
  externalId: string;
  connectedAt: Date;
  status: IntegrationStatus;
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
