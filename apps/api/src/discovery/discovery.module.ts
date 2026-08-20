import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { WorkspacesModule } from "../workspaces/workspaces.module";
import { DiscoveryController } from "./discovery.controller";
import { DiscoveryService } from "./discovery.service";

@Module({
  // IntegrationsModule: dá acesso a MarketplaceAccountsService (credenciais
  // já descriptografadas + renovação de token) — é o que permite a Análise
  // de Anúncio buscar o item REAL via API do ML usando o token de uma conta
  // conectada do workspace, em vez de só gerar dados (ver discovery.service.ts).
  imports: [AuthModule, WorkspacesModule, IntegrationsModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
})
export class DiscoveryModule {}
