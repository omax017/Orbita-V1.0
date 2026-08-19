import { Injectable, Logger } from "@nestjs/common";
import { AlertSeverity, AlertType, MembershipStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface RaiseAlertParams {
  workspaceId: string;
  type: AlertType;
  severity?: AlertSeverity;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
}

/**
 * Cria/atualiza `Alert` e distribui `Notification` (in-app, uma por membro
 * ATIVO do workspace) — ponto único usado por qualquer módulo que detecte
 * uma condição de alerta (hoje: sincronização de pedidos sem SKU; no futuro:
 * estoque baixo, ACOS alto, etc., como já previsto no `AlertType`).
 */
@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Idempotente por `(workspaceId, type, referenceType, referenceId)`: se já
   * existe um Alert OPEN pra essa referência exata, só atualiza
   * `triggeredAt` (evita 1 Alert + N Notification duplicadas a cada
   * re-sincronização do mesmo pedido).
   */
  async raise(params: RaiseAlertParams): Promise<void> {
    const existing = params.referenceId
      ? await this.prisma.alert.findFirst({
          where: {
            workspaceId: params.workspaceId,
            type: params.type,
            referenceType: params.referenceType,
            referenceId: params.referenceId,
            status: "OPEN",
          },
        })
      : null;

    if (existing) {
      await this.prisma.alert.update({
        where: { id: existing.id },
        data: { triggeredAt: new Date() },
      });
      return;
    }

    const alert = await this.prisma.alert.create({
      data: {
        workspaceId: params.workspaceId,
        type: params.type,
        severity: params.severity ?? "WARNING",
        title: params.title,
        message: params.message,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
      },
    });

    const members = await this.prisma.membership.findMany({
      where: { workspaceId: params.workspaceId, status: MembershipStatus.ACTIVE },
      select: { userId: true },
    });

    if (members.length === 0) {
      this.logger.warn(`Alert ${alert.id} criado sem membros ativos pra notificar (workspace ${params.workspaceId})`);
      return;
    }

    await this.prisma.notification.createMany({
      data: members.map((m) => ({
        workspaceId: params.workspaceId,
        alertId: alert.id,
        userId: m.userId,
        channel: "IN_APP",
        title: params.title,
        body: params.message,
      })),
    });
  }

  /** Atalho específico do job de sincronização (Etapa 9, item 6) — mantém a
   * regra de negócio ("o que vira mensagem") num lugar só. */
  async raiseMissingCost(params: { workspaceId: string; orderId: string; externalOrderId: string; itemTitles: string[] }): Promise<void> {
    const itemList = params.itemTitles.slice(0, 3).join(", ") + (params.itemTitles.length > 3 ? ` e mais ${params.itemTitles.length - 3}` : "");
    await this.raise({
      workspaceId: params.workspaceId,
      type: "MISSING_COST",
      severity: "WARNING",
      title: "Produto vendido sem custo cadastrado",
      message: `O pedido ${params.externalOrderId} tem item(ns) sem SKU vinculado (${itemList}) — o lucro desse pedido está subestimado até você cadastrar o custo.`,
      referenceType: "Order",
      referenceId: params.orderId,
    });
  }
}
