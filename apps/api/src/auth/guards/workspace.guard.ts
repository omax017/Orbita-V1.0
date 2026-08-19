import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { WorkspacesService } from "../../workspaces/workspaces.service";

/**
 * Resolve o workspace "atual" da requisição a partir do header
 * `X-Workspace-Id` e confirma que o usuário logado (`request.user`, setado
 * pelo JwtAuthGuard) tem uma Membership ATIVA nele. Popula
 * `request.workspaceMembership` para uso via `@CurrentWorkspace()`.
 *
 * Usar sempre depois de `JwtAuthGuard`:
 * `@UseGuards(JwtAuthGuard, WorkspaceGuard)`.
 *
 * Um usuário pode pertencer a mais de um Workspace (ex.: agência); é o
 * frontend que decide qual `workspaceId` mandar nesse header — hoje ele usa
 * sempre o primeiro da lista retornada por `GET /auth/me`.
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly workspaces: WorkspacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const workspaceId = request.headers["x-workspace-id"];
    const userId = request.user?.userId;

    if (!workspaceId || typeof workspaceId !== "string") {
      throw new ForbiddenException("Header X-Workspace-Id é obrigatório");
    }

    const membership = await this.workspaces.findActiveMembership(workspaceId, userId);
    if (!membership) {
      throw new ForbiddenException("Você não tem acesso a este workspace");
    }

    request.workspaceMembership = { workspaceId, role: membership.role };
    return true;
  }
}
