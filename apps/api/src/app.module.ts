import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import configuration from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { BillingModule } from "./billing/billing.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { CatalogModule } from "./catalog/catalog.module";
import { ListingsModule } from "./listings/listings.module";
import { OrdersModule } from "./orders/orders.module";
import { FinanceModule } from "./finance/finance.module";
import { AdsModule } from "./ads/ads.module";
import { DiscoveryModule } from "./discovery/discovery.module";
import { AlertsModule } from "./alerts/alerts.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    // Habilita os jobs periódicos (@Cron) usados pelo scheduler de
    // sincronização — polling de fallback e renovação proativa de token
    // (ver integrations/queues/marketplace-sync.scheduler.ts).
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,

    // Núcleo (tenancy, auth, billing)
    AuthModule,
    WorkspacesModule,
    BillingModule,

    // Integrações com marketplaces (base para os módulos de domínio abaixo)
    IntegrationsModule,

    // Módulos de domínio — mapeiam 1:1 com as seções do sidebar
    CatalogModule, // Estoque
    ListingsModule, // Anúncios
    OrdersModule, // Pedidos
    FinanceModule, // Financeiro
    AdsModule, // Publicidade
    DiscoveryModule, // Descobrir
    AlertsModule, // alertas/notificações (transversal, sem seção própria no sidebar)
  ],
})
export class AppModule {}
