import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Queue } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { MARKETPLACE_SYNC_QUEUE, jobId, jobName, MarketplaceSyncJobData } from "./marketplace-sync.types";

const TOKEN_REFRESH_LOOKAHEAD_MINUTES = 30;

/**
 * Dois ciclos periódicos, rodando FORA da fila (aqui é só "decidir o que
 * enfileirar"; quem faz o trabalho de verdade — e tem retry/backoff — é o
 * `MarketplaceSyncProcessor`):
 *
 * 1. Polling de fallback (item 5 da Etapa 9): mesmo com webhook configurado,
 *    todo provider pode perder notificação (instabilidade de rede, app
 *    reiniciando no momento exato). Reenfileirar sync de TODAS as contas
 *    conectadas a cada 15min garante que nenhum pedido fique parado por
 *    muito tempo mesmo se o webhook falhar silenciosamente.
 * 2. Renovação proativa de token: verifica a cada 10min quem está a menos de
 *    30min de expirar e renova ANTES de expirar, em vez de esperar uma
 *    chamada de API falhar com 401 pra só então tentar renovar.
 */
@Injectable()
export class MarketplaceSyncScheduler {
  private readonly logger = new Logger(MarketplaceSyncScheduler.name);

  constructor(
    @InjectQueue(MARKETPLACE_SYNC_QUEUE) private readonly queue: Queue<MarketplaceSyncJobData>,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshExpiringTokens(): Promise<void> {
    const threshold = new Date(Date.now() + TOKEN_REFRESH_LOOKAHEAD_MINUTES * 60 * 1000);
    const accounts = await this.prisma.marketplaceAccount.findMany({
      where: {
        status: { in: ["CONNECTED", "EXPIRED"] },
        tokenExpiresAt: { lte: threshold },
        refreshToken: { not: null },
      },
      select: { id: true },
    });

    if (accounts.length === 0) return;
    this.logger.log(`Renovação proativa de token: ${accounts.length} conta(s) próximas de expirar`);

    for (const account of accounts) {
      const data: MarketplaceSyncJobData = { type: "REFRESH_TOKEN", marketplaceAccountId: account.id };
      await this.queue.add(jobName(data), data, { jobId: jobId(data) });
    }
  }

  @Cron("*/15 * * * *") // a cada 15min — CronExpression não tem uma constante pronta pra esse intervalo
  async pollConnectedAccounts(): Promise<void> {
    const accounts = await this.prisma.marketplaceAccount.findMany({
      where: { status: "CONNECTED" },
      select: { id: true },
    });

    if (accounts.length === 0) return;
    this.logger.log(`Polling de fallback: reenfileirando sync de ${accounts.length} conta(s)`);

    for (const account of accounts) {
      const data: MarketplaceSyncJobData = { type: "SYNC_ACCOUNT_ORDERS", marketplaceAccountId: account.id };
      // jobId estável = se um webhook já tiver enfileirado o sync dessa
      // conta segundos atrás e ainda estiver na fila, este `add()` é
      // ignorado silenciosamente (BullMQ não duplica por jobId em uso).
      await this.queue.add(jobName(data), data, { jobId: jobId(data) });
    }
  }
}
