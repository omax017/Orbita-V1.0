import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { WorkspacesModule } from "../workspaces/workspaces.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { WorkspaceGuard } from "./guards/workspace.guard";
import { RolesGuard } from "./guards/roles.guard";

/**
 * Autenticação e sessão: cadastro (cria usuário + Workspace + Membership
 * OWNER), login, refresh/rotação de sessão e logout — tudo via cookies
 * httpOnly (ver `auth-cookies.util.ts`). Também expõe os guards
 * reutilizáveis (`JwtAuthGuard`, `WorkspaceGuard`, `RolesGuard`) e
 * decorators (`@CurrentUser()`, `@CurrentWorkspace()`, `@Roles()`) que os
 * módulos de domínio vão usar quando a lógica de negócio deles for
 * implementada.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({}), // secret/expiresIn são passados por chamada em AuthService (dependem de ConfigService)
    WorkspacesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, WorkspaceGuard, RolesGuard],
  exports: [JwtAuthGuard, WorkspaceGuard, RolesGuard],
})
export class AuthModule {}
