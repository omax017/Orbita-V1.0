import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import {
  MarketplaceConnectorRegistry,
  createConnectorsProvider,
} from "./connectors/connector-registry";
import { MercadoLivreConnector } from "./connectors/mercado-livre/mercado-livre.connector";
import { ShopeeConnector } from "./connectors/shopee/shopee.connector";
import { TokenEncryptionService } from "./crypto/token-encryption.service";
import { OAuthStateService } from "./oauth-state.service";
import { MarketplaceAccountsService } from "./marketplace-accounts.service";
import { OrderSyncService } from "./order-sync.service";
import { IntegrationsController } from "./integrations.controller";
import { MarketplaceAccountsController } from "./marketplace-accounts.controller";
import { MarketplaceSyncQueueModule } from "./queues/marketplace-sync-queue.module";
import { MarketplaceSyncProcessor } from "./queues/marketplace-sync.processor";
import { MarketplaceSyncScheduler } from "./queues/marketplace-sync.scheduler";
import { AlertsModule } from "../alerts/alerts.module";
import { AuthModule } from "../auth/auth.module";
import { WorkspacesModule } from "../workspaces/workspaces.module";

/**
 * Módulo de integrações com marketplaces. Reúne:
 * - os `MarketplaceConnector` de cada provider (Mercado Livre real desde a
 *   Etapa 9; Shopee ainda stub — ver `connectors/shopee`)
 * - o `MarketplaceConnectorRegistry`, único ponto de acesso usado pelos
 *   módulos de domínio (orders, listings, ads) para falar com um marketplace
 *   sem conhecer sua API específica
 * - OAuth (conectar/callback), criptografia de token, sincronização de
 *   pedidos e a fila BullMQ (worker + scheduler de polling/renovação) que
 *   fazem o trabalho de verdade em background
 *
 * Para plugar um novo marketplace: criar a classe do connector em
 * `connectors/<provider>/`, implementá-la contra `MarketplaceConnector` e
 * adicioná-la nos arrays abaixo — o resto (fila, controller genérico por
 * provider, criptografia) já está pronto pra reaproveitar.
 */
@Module({
  imports: [
    MarketplaceSyncQueueModule,
    AlertsModule,
    AuthModule, // exporta JwtAuthGuard/WorkspaceGuard, usados no endpoint /connect
    // WorkspaceGuard injeta WorkspacesService — precisa estar disponível
    // aqui também (exportar de AuthModule não basta: @UseGuards() por
    // referência de classe resolve as dependências do guard no contexto do
    // módulo que o USA, não no módulo que o exportou).
    WorkspacesModule,
    JwtModule.register({}), // OAuthStateService passa secret/expiresIn por chamada
  ],
  controllers: [IntegrationsController, MarketplaceAccountsController],
  providers: [
    MercadoLivreConnector,
    ShopeeConnector,
    createConnectorsProvider([MercadoLivreConnector, ShopeeConnector]),
    MarketplaceConnectorRegistry,
    TokenEncryptionService,
    OAuthStateService,
    MarketplaceAccountsService,
    OrderSyncService,
    MarketplaceSyncProcessor,
    MarketplaceSyncScheduler,
  ],
  exports: [MarketplaceConnectorRegistry, TokenEncryptionService, MarketplaceAccountsService],
})
export class IntegrationsModule {}
