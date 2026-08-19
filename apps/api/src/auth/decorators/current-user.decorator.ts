import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export interface CurrentUserPayload {
  userId: string;
}

/** Uso: `@CurrentUser() user: CurrentUserPayload` num handler protegido por `JwtAuthGuard`. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    return ctx.switchToHttp().getRequest().user;
  },
);
