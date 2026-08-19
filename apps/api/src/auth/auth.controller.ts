import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { AppConfig } from "../config/configuration";
import { AuthService, IssuedTokens } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from "./auth-cookies.util";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser, CurrentUserPayload } from "./decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get cookieSecure(): boolean {
    return this.config.get<AppConfig>("app")!.cookieSecure;
  }

  private applyTokens(res: Response, tokens: IssuedTokens) {
    setAuthCookies(res, { ...tokens, cookieSecure: this.cookieSecure });
  }

  /** `tokens` no corpo da resposta é pra quem não usa cookie (a extensão de
   * navegador, Etapa 10) — o site ignora esse campo (usa os cookies httpOnly
   * que a mesma resposta já seta). Nunca é a única forma de autenticar o
   * site: os cookies continuam sendo setados sempre, igual antes. */
  private toBody(user: unknown, tokens: IssuedTokens) {
    return { user, tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } };
  }

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.auth.register(dto);
    this.applyTokens(res, tokens);
    return this.toBody(user, tokens);
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.auth.login(dto);
    this.applyTokens(res, tokens);
    return this.toBody(user, tokens);
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Body() dto: RefreshDto, @Res({ passthrough: true }) res: Response) {
    // Cookie primeiro (site) — cai pro corpo da requisição (extensão, que
    // guarda o refresh token em `chrome.storage` por não ter acesso ao cookie).
    const refreshTokenPlain = req.cookies?.[REFRESH_TOKEN_COOKIE] ?? dto?.refreshToken;
    const tokens = await this.auth.refresh(refreshTokenPlain);
    this.applyTokens(res, tokens);
    return { ok: true, tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } };
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Req() req: Request, @Body() dto: RefreshDto, @Res({ passthrough: true }) res: Response) {
    const refreshTokenPlain = req.cookies?.[REFRESH_TOKEN_COOKIE] ?? dto?.refreshToken;
    await this.auth.logout(refreshTokenPlain);
    clearAuthCookies(res, this.cookieSecure);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: CurrentUserPayload) {
    return this.auth.getMe(user.userId);
  }
}
