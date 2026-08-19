import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { WorkspacesService } from "../../workspaces/workspaces.service";

/**
 * Resolve o workspace "atual" da requisicao a partir do header
 * X-Workspace-Id (chamadas via fetch, o caminho normal) ou do query param
 * ?workspaceId= (fallback pra navegacao de pagina inteira, que nao
 * consegue anexar header -- e o caso de GET /integrations/*\/connect, que
 * precisa ser um link/redirect normal do browser pro OAuth do marketplace,
 * nao uma chamada fetch). Confirma que o usuario logado (request.user,
 * setado pelo JwtAuthGuard) tem uma Membership ATIVA nele. Popula
 * request.workspaceMembership para uso via @CurrentWorkspace().
 *
 * Usar sempre depois de JwtAuthGuard:
 * @UseGuards(JwtAuthGuard, WorkspaceGuard).
 *
 * Um usuario pode pertencer a mais de um Workspace (ex.: agencia); e o
 * frontend que decide qual workspaceId mandar -- hoje ele usa sempre o
 * primeiro da lista retornada por GET /auth/me.
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly workspaces: WorkspacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const workspaceId = request.headers["x-workspace-id"] ?? request.query?.workspaceId;
    const userId = request.user?.userId;

    if (!workspaceId || typeof workspaceId !== "string") {
      throw new ForbiddenException("Header X-Workspace-Id e obrigatorio");
    }

    const membership = await this.workspaces.findActiveMembership(workspaceId, userId);
    if (!membership) {
      throw new ForbiddenException("Voce nao tem acesso a este workspace");
    }

    request.workspaceMembership = { workspaceId, role: membership.role };
    return true;
  }
}
