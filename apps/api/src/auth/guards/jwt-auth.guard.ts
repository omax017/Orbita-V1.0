import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard base de autenticação. Uso: `@UseGuards(JwtAuthGuard)` em qualquer
 * controller/rota que exija usuário logado. Popula `request.user` com
 * `{ userId }` (ver `JwtStrategy.validate`).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
