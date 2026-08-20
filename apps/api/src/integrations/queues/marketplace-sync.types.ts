import { MarketplaceProvider } from "@prisma/client";

export const MARKETPLACE_SYNC_QUEUE = "marketplace-sync";

/** Sincroniza (pull) os pedidos de uma conta inteira — usado no primeiro
 * sync após conectar, no polling periódico (fallback de webhook) e como
 * retomada quando um refresh de token falha e depois se recupera. */
export interface SyncAccountOrdersJobData {
  type: "SYNC_ACCOUNT_ORDERS";
  marketplaceAccountId: string;
}

/** Sincroniza 1 pedido específico — o que um webhook dispara (latência baixa,
 * sem esperar o próximo ciclo de polling). */
export interface SyncSingleOrderJobData {
  type: "SYNC_SINGLE_ORDER";
  marketplaceAccountId: string;
  externalOrderId: string;
}

/** Sincroniza (pull) os anúncios de uma conta inteira — sem isso, `Listing`
 * nunca é populada e "anúncios ativos" fica sempre 0 na tela de Integrações
 * (bug real encontrado em produção: só pedidos eram sincronizados). */
export interface SyncAccountListingsJobData {
  type: "SYNC_ACCOUNT_LISTINGS";
  marketplaceAccountId: string;
}

/** Renova o access token usando o refresh token guardado — enfileirado
 * proativamente pelo job `refresh-tokens` antes do token expirar. */
export interface RefreshTokenJobData {
  type: "REFRESH_TOKEN";
  marketplaceAccountId: string;
}

export type MarketplaceSyncJobData =
  | SyncAccountOrdersJobData
  | SyncSingleOrderJobData
  | SyncAccountListingsJobData
  | RefreshTokenJobData;

/** Nome do job = o discriminador `type` — permite ver de relance no board do
 * BullMQ (Bull Board/Redis Insight) o que é cada job sem abrir o payload. */
export function jobName(data: MarketplaceSyncJobData): string {
  return data.type;
}

/** jobId estável evita duplicar o mesmo trabalho na fila (BullMQ ignora um
 * `add()` com `jobId` de um job que já está esperando/ativo). Essencial pro
 * fallback de polling não empilhar sync do mesmo pedido que um webhook já
 * enfileirou segundos atrás.
 *
 * Separador é `-`, NUNCA `:` — BullMQ usa `:` como separador interno das
 * chaves do Redis e rejeita jobId customizado que contenha o caractere
 * ("Error: Custom Id cannot contain :"). Bug real: isso quebrava TODO
 * enfileiramento (inclusive o sync de pedidos, desde sempre) de forma
 * silenciosa — o clique em "Sincronizar" dava 500, mas a tela não mostrava
 * nada além de continuar em 0/0. Achado testando sincronização de verdade
 * em produção. */
export function jobId(data: MarketplaceSyncJobData): string {
  switch (data.type) {
    case "SYNC_ACCOUNT_ORDERS":
      return `sync-account-${data.marketplaceAccountId}`;
    case "SYNC_SINGLE_ORDER":
      return `sync-order-${data.marketplaceAccountId}-${data.externalOrderId}`;
    case "SYNC_ACCOUNT_LISTINGS":
      return `sync-listings-${data.marketplaceAccountId}`;
    case "REFRESH_TOKEN":
      return `refresh-token-${data.marketplaceAccountId}`;
  }
}

/** Rate limit por provider — aplicado ao Worker (BullMQ `limiter`), não por
 * request individual. Números conservadores de partida; ML não publica um
 * limite universal fixo por segundo, então isso deve ser ajustado com base
 * em `429`/erros reais observados em produção (ver `MercadoLivreApiError.isRateLimited`). */
export const PROVIDER_RATE_LIMIT: Record<MarketplaceProvider, { max: number; duration: number }> = {
  MERCADO_LIVRE: { max: 8, duration: 1000 }, // ~8 req/s
  SHOPEE: { max: 8, duration: 1000 }, // mesmo valor de partida; ajustar quando implementado
};
