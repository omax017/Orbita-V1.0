import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { MembershipStatus, Role, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { WorkspacesService } from "../workspaces/workspaces.service";
import { AppConfig } from "../config/configuration";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { comparePassword, hashPassword } from "./password.util";
import { generateRefreshToken, hashRefreshToken } from "./refresh-token.util";

export interface IssuedTokens {
  accessToken: string;
  accessTokenMaxAgeMs: number;
  refreshToken: string;
  refreshTokenMaxAgeMs: number;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaces: WorkspacesService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get appConfig(): AppConfig {
    return this.config.get<AppConfig>("app")!;
  }

  /**
   * Cria o usuário, o Workspace (com o próprio usuário como OWNER/"dono") e
   * já retorna uma sessão autenticada — não existe fluxo de "criar conta sem
   * workspace"; toda conta nasce dona de um workspace e pode depois convidar
   * outros membros para ele (papel MEMBER/"membro").
   */
  async register(dto: RegisterDto): Promise<{ user: SafeUser; tokens: IssuedTokens }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("Já existe uma conta com este e-mail");
    }

    const passwordHash = await hashPassword(dto.password);
    const slug = await this.workspaces.generateUniqueSlug(dto.workspaceName);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: { name: dto.name, email: dto.email, passwordHash },
      });

      const workspace = await tx.workspace.create({
        data: { name: dto.workspaceName, slug },
      });

      await tx.membership.create({
        data: {
          workspaceId: workspace.id,
          userId: createdUser.id,
          role: Role.OWNER,
          status: MembershipStatus.ACTIVE,
        },
      });

      return createdUser;
    });

    const tokens = await this.issueTokens(user.id);
    return { user: toSafeUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser; tokens: IssuedTokens }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("E-mail ou senha incorretos");
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("E-mail ou senha incorretos");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(user.id);
    return { user: toSafeUser(user), tokens };
  }

  /** Rotaciona o refresh token: revoga o atual e emite um par novo. */
  async refresh(refreshTokenPlain: string): Promise<IssuedTokens> {
    const hash = hashRefreshToken(refreshTokenPlain);
    const session = await this.prisma.session.findUnique({ where: { refreshTokenHash: hash } });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Sessão inválida ou expirada");
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(session.userId);
  }

  /** Idempotente: se o token já não existir/for inválido, apenas não faz nada. */
  async logout(refreshTokenPlain: string | undefined): Promise<void> {
    if (!refreshTokenPlain) return;
    const hash = hashRefreshToken(refreshTokenPlain);
    await this.prisma.session.updateMany({
      where: { refreshTokenHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          include: { workspace: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      user: toSafeUser(user),
      memberships: user.memberships.map((m) => ({
        role: m.role,
        workspace: m.workspace,
      })),
    };
  }

  private async issueTokens(userId: string): Promise<IssuedTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId },
      { secret: this.appConfig.jwtSecret, expiresIn: this.appConfig.jwtAccessExpiresIn },
    );

    const refreshToken = generateRefreshToken();
    const refreshTokenMaxAgeMs = this.appConfig.jwtRefreshExpiresInDays * 24 * 60 * 60 * 1000;

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTokenMaxAgeMs),
      },
    });

    return {
      accessToken,
      accessTokenMaxAgeMs: parseDurationToMs(this.appConfig.jwtAccessExpiresIn),
      refreshToken,
      refreshTokenMaxAgeMs,
    };
  }
}

/** Converte "15m" / "7d" / "3600s" no formato aceito pelo jsonwebtoken para milissegundos (uso só no maxAge do cookie). */
function parseDurationToMs(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration.trim());
  if (!match) return 15 * 60 * 1000; // fallback: 15 minutos
  const value = Number(match[1]);
  // Non-null: o grupo 2 é obrigatório no regex acima, sempre presente se `match` existe.
  const unit = match[2]!;
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  // noUncheckedIndexedAccess faz o TS tratar o lookup como number | undefined
  // mesmo sabendo (por construção) que `unit` é uma das chaves acima.
  return value * (multipliers[unit] ?? 60 * 1000);
}
