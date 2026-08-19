import { Injectable } from "@nestjs/common";
import { MembershipStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { slugify } from "./slugify.util";

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Gera um slug único a partir do nome, tentando sufixos numéricos em caso de colisão. */
  async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || "workspace";
    let candidate = base;
    let attempt = 0;

    // Poucas colisões esperadas na prática; limite alto só por segurança.
    while (attempt < 50) {
      const existing = await this.prisma.workspace.findUnique({ where: { slug: candidate } });
      if (!existing) return candidate;
      attempt += 1;
      candidate = `${base}-${attempt + 1}`;
    }

    // Fallback extremamente improvável: garante unicidade com sufixo aleatório.
    return `${base}-${Date.now()}`;
  }

  findById(workspaceId: string) {
    return this.prisma.workspace.findUnique({ where: { id: workspaceId } });
  }

  findActiveMembership(workspaceId: string, userId: string) {
    return this.prisma.membership.findFirst({
      where: { workspaceId, userId, status: MembershipStatus.ACTIVE },
    });
  }
}
