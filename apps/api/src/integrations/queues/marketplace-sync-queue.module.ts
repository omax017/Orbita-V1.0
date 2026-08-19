import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { AppConfig } from "../../config/configuration";
import { MARKETPLACE_SYNC_QUEUE } from "./marketplace-sync.types";

/**
 * Conexão com o Redis para o BullMQ + registro da fila `marketplace-sync`.
 * Módulo separado (em vez de registrar direto em `IntegrationsModule`) só
 * pra deixar claro o que é "infra de fila" vs "lógica de integração" —
 * outros módulos (Shopee, e futuros marketplaces) importam este módulo em
 * vez de registrar a conexão Redis de novo.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { redisUrl } = configService.get<AppConfig>("app")!;
        const url = new URL(redisUrl);
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
            password: url.password || undefined,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: MARKETPLACE_SYNC_QUEUE,
      defaultJobOptions: {
        attempts: 5,
        // Backoff exponencial: 5s, 10s, 20s, 40s, 80s — dá tempo de um rate
        // limit (429) ou instabilidade momentânea do marketplace passar.
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 1000 },
      },
    }),
  ],
  exports: [BullModule],
})
export class MarketplaceSyncQueueModule {}
