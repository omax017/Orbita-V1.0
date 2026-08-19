import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WorkspacesModule } from "../workspaces/workspaces.module";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";

@Module({
  // WorkspacesModule precisa estar aqui além de AuthModule — WorkspaceGuard
  // injeta WorkspacesService, e isso é resolvido no contexto do módulo que
  // USA o guard, não do módulo que o exporta (mesmo detalhe do
  // IntegrationsModule, ver ARCHITECTURE.md § 14.8).
  imports: [AuthModule, WorkspacesModule],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
