import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MarketplaceAccountsService } from "../marketplace-accounts.service";
import { OrderSyncService } from "../order-sync.service";
import { MARKETPLACE_SYNC_QUEUE, MarketplaceSyncJobData, PROVIDER_RATE_LIMIT } from "./marketplace-sync.types";

/**
 * Único Worker pra todos os tipos de job da fila `marketplace-sync`
 * (distinguidos por `job.data.type`) — mais simples que uma fila por tipo, e
 * o rate limit (por Worker) já cobre o app inteiro contra um marketplace.
 *
 * Retry/backoff exponencial vêm de `defaultJobOptions` na definição da fila
 * (`marketplace-sync-queue.module.ts`) — não precisa repetir aqui; um throw
 * dentro de `process()` já conta como falha pro BullMQ.
 */
@Processor(MARKETPLACE_SYNC_QUEUE, {
  // Rate limit "geral" — hoje só ML está implementado; quando Shopee entrar,
  // isso precisa virar 2 filas (uma por provider) pra não misturar os
  // limites dos dois marketplaces num Worker só.
  limiter: PROVIDER_RATE_LIMIT.MERCADO_LIVRE,
})
export class MarketplaceSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(MarketplaceSyncProcessor.name);

  constructor(
    private readonly accounts: MarketplaceAccountsService,
    private readonly orderSync: OrderSyncService,
  ) {
    super();
  }

  async process(job: Job<MarketplaceSyncJobData>): Promise<void> {
    this.logger.log(`Processando job ${job.id} (${job.data.type})`);

    switch (job.data.type) {
      case "SYNC_ACCOUNT_ORDERS":
        await this.orderSync.syncAccountOrders(job.data.marketplaceAccountId);
        return;

      case "SYNC_SINGLE_ORDER":
        await this.orderSync.syncSingleOrder(job.data.marketplaceAccountId, job.data.externalOrderId);
        return;

      case "SYNC_ACCOUNT_LISTINGS":
        await this.orderSync.syncAccountListings(job.data.marketplaceAccountId);
        return;

      case "REFRESH_TOKEN":
        await this.accounts.refreshToken(job.data.marketplaceAccountId);
        return;
    }
  }
}
