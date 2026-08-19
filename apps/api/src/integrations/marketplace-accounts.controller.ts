import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../auth/guards/workspace.guard";
import { CurrentWorkspace, CurrentWorkspacePayload } from "../auth/decorators/current-workspace.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { MARKETPLACE_SYNC_QUEUE, jobId, jobName, MarketplaceSyncJobData } from "./queues/marketplace-sync.types";

/**
 * `/integrations/accounts` — agnóstico de provider (ao contrário de
 * `/integrations/mercado-livre/*`, que é só o fluxo OAuth específico do ML).
 * É o que a tela de Configurações → Integrações usa pra listar as contas já
 * conectadas, disparar uma sincronização manual e desconectar — funciona
 * pra qualquer marketplace que já tenha `MarketplaceAccount` gravado, sem
 * precisar saber qual connector foi usado pra conectar.
 */
@Controller("integrations/accounts")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class MarketplaceAccountsController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(MARKETPLACE_SYNC_QUEUE) private readonly queue: Queue<MarketplaceSyncJobData>,
  ) {}

  @Get()
  async list(@CurrentWorkspace() workspace: CurrentWorkspacePayload) {
    const accounts = await this.prisma.marketplaceAccount.findMany({
      where: { workspaceId: workspace.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Nunca devolve accessToken/refreshToken (nem criptografado) pro
    // frontend — a tela não precisa disso, e é dado sensível. Junto: contagens
    // reais (vendas 30d, anúncios ativos) pra tela mostrar algo de verdade,
    // não um placeholder.
    return Promise.all(
      accounts.map(async ({ accessToken: _at, refreshToken: _rt, ...rest }) => {
        const [sales30d, listingsCount] = await Promise.all([
          this.prisma.order.count({ where: { marketplaceAccountId: rest.id, orderedAt: { gte: since30d } } }),
          this.prisma.listing.count({ where: { marketplaceAccountId: rest.id } }),
        ]);
        return { ...rest, sales30d, listingsCount };
      }),
    );
  }

  @Post(":id/sync")
  async sync(@CurrentWorkspace() workspace: CurrentWorkspacePayload, @Param("id") id: string) {
    await this.prisma.marketplaceAccount.findFirstOrThrow({ where: { id, workspaceId: workspace.workspaceId } });

    const data: MarketplaceSyncJobData = { type: "SYNC_ACCOUNT_ORDERS", marketplaceAccountId: id };
    await this.queue.add(jobName(data), data, { jobId: jobId(data) });

    return { ok: true, queued: true };
  }

  @Delete(":id")
  async disconnect(@CurrentWorkspace() workspace: CurrentWorkspacePayload, @Param("id") id: string) {
    await this.prisma.marketplaceAccount.findFirstOrThrow({ where: { id, workspaceId: workspace.workspaceId } });

    // Marca desconectado e limpa os tokens em vez de apagar a linha — os
    // pedidos/anúncios já sincronizados (Order/Listing) continuam existindo
    // pro histórico/relatórios, só a conta some da lista de "conectadas".
    await this.prisma.marketplaceAccount.update({
      where: { id },
      data: { status: "DISCONNECTED", accessToken: null, refreshToken: null, tokenExpiresAt: null },
    });

    return { ok: true };
  }
}
