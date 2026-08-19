/**
 * Representa uma conta/loja dentro da Órbita (o "tenant" da plataforma).
 * Cada seller que assina a plataforma é um Workspace, que pode ter múltiplos
 * usuários (membros) e múltiplas contas de marketplace conectadas.
 */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  document: string | null;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Marketplace suportado. Novos marketplaces entram aqui — o backend usa o
 * mesmo enum para escolher o `MarketplaceConnector` correspondente
 * (ver apps/api/src/integrations/connectors).
 */
export enum MarketplaceProvider {
  MERCADO_LIVRE = "MERCADO_LIVRE",
  SHOPEE = "SHOPEE",
}

export enum MarketplaceAccountStatus {
  CONNECTED = "CONNECTED",
  EXPIRED = "EXPIRED",
  ERROR = "ERROR",
  DISCONNECTED = "DISCONNECTED",
}

/**
 * Conexão de um Workspace com uma conta de marketplace (via OAuth).
 * Os tokens em si nunca trafegam nesses tipos compartilhados —
 * ficam apenas no backend (e sempre criptografados em repouso).
 */
export interface MarketplaceAccount {
  id: string;
  workspaceId: string;
  provider: MarketplaceProvider;
  externalAccountId: string;
  externalAccountName: string;
  status: MarketplaceAccountStatus;
  lastSyncedAt: string | null;
  createdAt: string;
}

export enum PlanCode {
  FREE = "FREE",
  STARTER = "STARTER",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
}

export interface Subscription {
  id: string;
  workspaceId: string;
  planCode: PlanCode;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
