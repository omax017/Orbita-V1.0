import { Module } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";

/**
 * Workspaces (contas/lojas) e Membership (equipe/convites).
 * Cobre o núcleo de multi-tenancy: CRUD de Workspace, convite/gestão de
 * membros e papéis (Role). `WorkspacesService` é usado pelo AuthModule na
 * criação do workspace do dono durante o cadastro.
 *
 * Endpoints de gestão de membros (convidar, alterar papel, remover) ainda
 * não existem — isso é lógica de página ("Configurações → Membros"), fora
 * do escopo desta etapa.
 */
@Module({
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
