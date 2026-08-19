import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const ROLES_KEY = "roles";

/** Usar junto com `RolesGuard`, depois de `JwtAuthGuard, WorkspaceGuard`. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
