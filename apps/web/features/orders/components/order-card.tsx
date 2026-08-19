"use client";

import { useState } from "react";
import { Check, Copy, Printer, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { StatusTimeline } from "@/components/ui/status-timeline";
import { formatCurrency, formatPercent } from "@/lib/format";
import { computeOrderFinancials, type MockOrder } from "../types";
import { LinkSkuPopover } from "@/features/catalog/components/link-sku-popover";
import type { MockSku } from "@/features/catalog/types";
import { MarketplaceTag } from "@/components/marketplace-tag";
import { OrderStatusBadge } from "./order-status-badge";
import { CostBreakdownPopover } from "./cost-breakdown-popover";

const SHIPPING_STEPS = [
  { key: "READY", label: "Pronto" },
  { key: "IN_TRANSIT", label: "Em trânsito" },
  { key: "DELIVERED", label: "Entregue" },
];

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export interface OrderCardProps {
  order: MockOrder;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Atualiza o custo do pedido no estado do pai quando um SKU é vinculado (demo client-side). */
  onLinkSku: (orderId: string, sku: MockSku) => void;
}

/**
 * Card expansível de pedido — construído sobre `ExpandableCard` (genérico,
 * sem conhecimento de domínio) especificamente para não travar o reuso: o
 * módulo de Anúncios (etapa futura) vai montar um `ListingCard` em cima do
 * mesmo `ExpandableCard`, só trocando o conteúdo dos slots.
 */
export function OrderCard({ order, selected, onSelectedChange, onLinkSku }: OrderCardProps) {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const financials = computeOrderFinancials(order);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(order.externalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard indisponível (ex.: contexto não seguro) — falha silenciosa, não é crítico
    }
  }

  function handleResync() {
    setSyncing(true);
    // Sincronização real acontece via jobs do módulo Orders (etapa de integrações) —
    // aqui é só feedback visual de que o botão funciona.
    setTimeout(() => setSyncing(false), 900);
  }

  const firstItem = order.items[0];
  const extraItemsCount = order.items.length - 1;

  return (
    <ExpandableCard
      selected={selected}
      onSelectedChange={onSelectedChange}
      header={
        <>
          <div className="flex items-center gap-2">
            <MarketplaceTag provider={order.provider} accountLabel={order.accountLabel} />
            <span className="text-sm font-semibold text-foreground">#{order.externalId}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} aria-label="Copiar ID do pedido">
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleResync}
              aria-label="Re-sincronizar pedido"
              disabled={syncing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </>
      }
      summary={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {firstItem ? (
              <span className={`h-9 w-9 shrink-0 rounded-md ${firstItem.thumbnailColor}`} />
            ) : null}
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">
                {firstItem?.title}
                {extraItemsCount > 0 ? (
                  <span className="text-muted-foreground"> + {extraItemsCount} item(ns)</span>
                ) : null}
              </p>
              {firstItem?.skuCode ? (
                <p className="text-xs text-muted-foreground">SKU {firstItem.skuCode}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Lucro</p>
              <p
                className={`text-sm font-semibold ${
                  financials.hasMissingCost
                    ? "text-muted-foreground"
                    : financials.hasNegativeMargin
                      ? "text-destructive"
                      : "text-success"
                }`}
              >
                {financials.hasMissingCost ? "—" : formatCurrency(financials.netProfit ?? 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Margem</p>
              <p
                className={`text-sm font-semibold ${
                  financials.hasMissingCost
                    ? "text-muted-foreground"
                    : financials.hasNegativeMargin
                      ? "text-destructive"
                      : "text-foreground"
                }`}
              >
                {financials.hasMissingCost ? "—" : formatPercent(financials.marginPercent ?? 0)}
              </p>
            </div>
            {financials.hasMissingCost ? (
              <div className="flex items-center gap-1.5">
                <Badge variant="warning" className="gap-1">
                  <TriangleAlert className="h-3 w-3" />
                  Sem custo
                </Badge>
                <LinkSkuPopover
                  itemTitle={firstItem?.title ?? "item"}
                  onLink={(sku) => onLinkSku(order.id, sku)}
                />
              </div>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Itens do pedido
          </p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <span className={`h-10 w-10 shrink-0 rounded-md ${item.thumbnailColor}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{item.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {item.skuCode ? (
                      <span className="text-xs text-muted-foreground">SKU {item.skuCode}</span>
                    ) : (
                      <span className="text-xs text-warning">Sem SKU vinculado</span>
                    )}
                    {item.fromCatalog ? (
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                        Catálogo
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm text-foreground">
                  {item.quantity > 1 ? `${item.quantity}× ` : ""}
                  {formatCurrency(item.unitPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
          <CostBreakdownPopover order={order} />
        </div>

        {order.shippingStage ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Envio
            </p>
            <StatusTimeline
              steps={SHIPPING_STEPS}
              // Quando o último estágio (Entregue) é alcançado, empurra
              // currentIndex pra além do array: em StatusTimeline isso faz
              // TODOS os passos, inclusive o último, ficarem "concluídos"
              // (checkmark) em vez do último aparecer como "atual" (número)
              // — mais correto pra um fluxo que já terminou.
              currentIndex={
                order.shippingStage === "DELIVERED"
                  ? SHIPPING_STEPS.length
                  : SHIPPING_STEPS.findIndex((s) => s.key === order.shippingStage)
              }
            />
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Data e hora</dt>
            <dd className="mt-0.5 text-sm text-foreground">{DATE_TIME_FORMAT.format(order.orderedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Forma de pagamento</dt>
            <dd className="mt-0.5 text-sm text-foreground">{order.paymentMethod}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Previsão de repasse</dt>
            <dd className="mt-0.5 text-sm text-foreground">{DATE_FORMAT.format(order.payoutForecast)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Comprador</dt>
            <dd className="mt-0.5 text-sm text-foreground">{order.buyerName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Endereço</dt>
            <dd className="mt-0.5 text-sm text-foreground">{order.address}</dd>
          </div>
        </dl>
      </div>
    </ExpandableCard>
  );
}
