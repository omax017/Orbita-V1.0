import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Role } from "@prisma/client";

export interface CurrentWorkspacePayload {
  workspaceId: string;
  role: Role;
}

/** Uso: `@CurrentWorkspace() workspace: CurrentWorkspacePayload` num handler protegido por `WorkspaceGuard`. */
export const CurrentWorkspace = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentWorkspacePayload => {
    return ctx.switchToHttp().getRequest().workspaceMembership;
  },
);
