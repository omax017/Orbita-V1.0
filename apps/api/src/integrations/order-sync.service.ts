import { Injectable, Logger } from "@nestjs/common";
import { MarketplaceAccount } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AlertsService } from "../alerts/alerts.service";
import { MarketplaceAccountsService } from "./marketplace-accounts.service";
import { MarketplaceConnectorRegistry } from "./connectors/connector-registry";
import type { NormalizedOrder } from "./connectors/marketplace-connector.types";

// Trava de segurança contra loop infinito de paginação (ex.: um provider que
// devolva `nextPage` de forma inconsistente) — nenhuma conta realista tem
// mais de 200 páginas (10 mil pedidos) num único ciclo de sync incremental.
const MAX_PAGES_PER_SYNC = 200;

@Injectable()
export class OrderSyncService {
  private readonly logger = new Logger(OrderSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: MarketplaceAccountsService,
    private readonly connectors: MarketplaceConnectorRegistry,
    private readonly alerts: AlertsService,
  ) {}

  /** Sincroniza os pedidos de uma conta inteira — incremental quando já
   * houve sync antes (usa `lastSyncedAt` como `updatedSince`), completo na
   * primeira vez. Usado no primeiro sync pós-conexão e no polling periódico. */
  async syncAccountOrders(marketplaceAccountId: string): Promise<{ synced: number }> {
    const { account, credentials } = await this.accounts.getCredentials(marketplaceAccountId);
    const connector = this.connectors.get(account.provider);

    let synced = 0;
    let pageParam: string | null = null;
    let page = 0;

    try {
      do {
        const result = await connector.listOrders(credentials, {
          updatedSince: account.lastSyncedAt ?? undefined,
          pageParam,
        });

        for (const order of result.items) {
          await this.upsertOrder(account, order);
          synced += 1;
        }

        pageParam = result.nextPage;
        page += 1;
      } while (pageParam && page < MAX_PAGES_PER_SYNC);

      await this.prisma.marketplaceAccount.update({
        where: { id: marketplaceAccountId },
        data: { lastSyncedAt: new Date(), lastSyncError: null, status: "CONNECTED" },
      });
    } catch (error) {
      await this.prisma.marketplaceAccount.update({
        where: { id: marketplaceAccountId },
        data: { lastSyncError: (error as Error).message },
      });
      this.logger.error(`Falha sincronizando pedidos da conta ${marketplaceAccountId}: ${(error as Error).message}`);
      throw error;
    }

    this.logger.log(`Conta ${marketplaceAccountId}: ${synced} pedido(s) sincronizado(s)`);
    return { synced };
  }

  /** Sincroniza 1 pedido específico — o que um webhook dispara. */
  async syncSingleOrder(marketplaceAccountId: string, externalOrderId: string): Promise<void> {
    const { account, credentials } = await this.accounts.getCredentials(marketplaceAccountId);
    const connector = this.connectors.get(account.provider);
    const order = await connector.fetchOrder(credentials, externalOrderId);
    await this.upsertOrder(account, order);
  }

  private async upsertOrder(account: MarketplaceAccount, normalized: NormalizedOrder): Promise<void> {
    const existing = await this.prisma.order.findUnique({
      where: {
        marketplaceAccountId_externalOrderId: {
          marketplaceAccountId: account.id,
          externalOrderId: normalized.externalOrderId,
        },
      },
      select: { id: true },
    });
    const isNewOrder = !existing;

    // Resolve listing/SKU de cada item ANTES de gravar, pra já calcular
    // custo/lucro no mesmo upsert (evita um segundo passe/job só pra isso).
    const resolvedItems = await Promise.all(
      normalized.items.map((item) => this.resolveItemCost(account, item)),
    );

    const costAmount = resolvedItems.reduce((sum, r) => sum + r.unitCostAmount * r.item.quantity, 0);
    const netProfitAmount =
      normalized.totalAmount - normalized.marketplaceFeeAmount - normalized.shippingAmount - normalized.taxAmount - costAmount;

    const order = await this.prisma.order.upsert({
      where: {
        marketplaceAccountId_externalOrderId: {
          marketplaceAccountId: account.id,
          externalOrderId: normalized.externalOrderId,
        },
      },
      create: {
        workspaceId: account.workspaceId,
        marketplaceAccountId: account.id,
        provider: account.provider,
        externalOrderId: normalized.externalOrderId,
        status: normalized.status,
        marketplaceStatus: normalized.rawStatus,
        buyerNickname: normalized.buyerNickname,
        currency: normalized.currency,
        subtotalAmount: normalized.subtotalAmount,
        shippingAmount: normalized.shippingAmount,
        discountAmount: normalized.discountAmount,
        marketplaceFeeAmount: normalized.marketplaceFeeAmount,
        taxAmount: normalized.taxAmount,
        totalAmount: normalized.totalAmount,
        costAmount,
        netProfitAmount,
        rawPayload: normalized.raw as object,
        orderedAt: normalized.orderedAt,
        paidAt: normalized.paidAt,
        shippedAt: normalized.shippedAt,
        deliveredAt: normalized.deliveredAt,
        canceledAt: normalized.canceledAt,
      },
      update: {
        status: normalized.status,
        marketplaceStatus: normalized.rawStatus,
        subtotalAmount: normalized.subtotalAmount,
        shippingAmount: normalized.shippingAmount,
        discountAmount: normalized.discountAmount,
        marketplaceFeeAmount: normalized.marketplaceFeeAmount,
        taxAmount: normalized.taxAmount,
        totalAmount: normalized.totalAmount,
        costAmount,
        netProfitAmount,
        rawPayload: normalized.raw as object,
        paidAt: normalized.paidAt,
        shippedAt: normalized.shippedAt,
        deliveredAt: normalized.deliveredAt,
        canceledAt: normalized.canceledAt,
      },
    });

    // Itens: sem chave natural única cadastrada no schema pra upsert
    // individual — recriar é simples e correto (o pedido inteiro já veio
    // fresco da API a cada sync, então não existe "item perdido" a proteger).
    await this.prisma.$transaction([
      this.prisma.orderItem.deleteMany({ where: { orderId: order.id } }),
      this.prisma.orderItem.createMany({
        data: resolvedItems.map((r) => ({
          workspaceId: account.workspaceId,
          orderId: order.id,
          listingId: r.listingId,
          skuId: r.skuId,
          externalItemId: r.item.externalItemId,
          title: r.item.title,
          quantity: r.item.quantity,
          unitPriceAmount: r.item.unitPriceAmount,
          unitCostAmount: r.unitCostAmount,
          allocatedFeeAmount: normalized.items.length > 0 ? normalized.marketplaceFeeAmount / normalized.items.length : 0,
          totalAmount: r.item.unitPriceAmount * r.item.quantity,
          netProfitAmount: (r.item.unitPriceAmount - r.unitCostAmount) * r.item.quantity,
        })),
      }),
    ]);

    if (isNewOrder) {
      const itemsWithoutSku = resolvedItems.filter((r) => !r.skuId);
      if (itemsWithoutSku.length > 0) {
        await this.alerts.raiseMissingCost({
          workspaceId: account.workspaceId,
          orderId: order.id,
          externalOrderId: normalized.externalOrderId,
          itemTitles: itemsWithoutSku.map((r) => r.item.title),
        });
      }
    }
  }

  /** Casa `OrderItem.externalItemId` com `Listing.externalListingId` (mesma
   * conta) e depois com `ListingSku` (considerando variação) pra achar o SKU
   * e o custo unitário — snapshot do custo NO MOMENTO da venda (não usa
   * `Sku.costAmount` atual direto num pedido antigo, ver comentário no
   * schema em `OrderItem.unitCostAmount`). */
  private async resolveItemCost(
    account: MarketplaceAccount,
    item: NormalizedOrder["items"][number],
  ): Promise<{ item: NormalizedOrder["items"][number]; listingId: string | null; skuId: string | null; unitCostAmount: number }> {
    if (!item.externalListingId) {
      return { item, listingId: null, skuId: null, unitCostAmount: 0 };
    }

    const listing = await this.prisma.listing.findUnique({
      where: {
        marketplaceAccountId_externalListingId: {
          marketplaceAccountId: account.id,
          externalListingId: item.externalListingId,
        },
      },
      select: { id: true },
    });
    if (!listing) {
      return { item, listingId: null, skuId: null, unitCostAmount: 0 };
    }

    const listingSku = await this.prisma.listingSku.findFirst({
      where: { listingId: listing.id, variationExternalId: item.variationExternalId ?? "" },
      select: { skuId: true, sku: { select: { costAmount: true, packagingCostAmount: true } } },
    });
    if (!listingSku) {
      return { item, listingId: listing.id, skuId: null, unitCostAmount: 0 };
    }

    const unitCostAmount = Number(listingSku.sku.costAmount) + Number(listingSku.sku.packagingCostAmount);
    return { item, listingId: listing.id, skuId: listingSku.skuId, unitCostAmount };
  }
}
