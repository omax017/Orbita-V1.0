"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { buildPeriod } from "@/components/filters/period-utils";
import { PackageSearch } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { MOCK_ORDERS } from "./mock-data";
import { filterAndSortOrders, summarizeOrders, type OrdersFilterState } from "./filters";
import type { MockOrder } from "./types";
import { OrderCard } from "./components/order-card";
import { OrdersFilters } from "./components/orders-filters";
import { OrdersSummaryBar } from "./components/orders-summary-bar";
import { BulkActionsBar } from "./components/bulk-actions-bar";
import { RegisterExternalSaleDialog } from "./components/register-external-sale-dialog";

function initialFilters(): OrdersFilterState {
  return {
    period: buildPeriod("30d"),
    accountId: "all",
    search: "",
    statuses: new Set(),
    skuQuery: "",
    shippingType: "all",
    channel: "all",
    onlyMissingSku: false,
    onlyNegativeMargin: false,
    sortBy: "recent",
  };
}

export function OrdersContent() {
  const [orders, setOrders] = useState<MockOrder[]>(MOCK_ORDERS);
  const [filters, setFilters] = useState<OrdersFilterState>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const visibleOrders = useMemo(() => filterAndSortOrders(orders, filters), [orders, filters]);
  const summary = useMemo(() => summarizeOrders(visibleOrders), [visibleOrders]);

  const allVisibleSelected =
    visibleOrders.length > 0 && visibleOrders.every((o) => selectedIds.has(o.id));

  function toggleSelectAll(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const order of visibleOrders) {
        if (checked) next.add(order.id);
        else next.delete(order.id);
      }
      return next;
    });
  }

  function toggleSelect(orderId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(orderId);
      else next.delete(orderId);
      return next;
    });
  }

  function handleLinkSku(orderId: string, sku: { code: string; costAmount: number; name: string }) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const [firstItem, ...rest] = order.items;
        return {
          ...order,
          costAmount: sku.costAmount,
          items: firstItem
            ? [{ ...firstItem, skuCode: sku.code, fromCatalog: true }, ...rest]
            : order.items,
        };
      }),
    );
  }

  function handleCreateExternalSale(order: MockOrder) {
    setOrders((prev) => [order, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pedidos</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatNumber(visibleOrders.length)} pedido(s) no período selecionado
          </p>
        </div>
        <RegisterExternalSaleDialog onCreate={handleCreateExternalSale} />
      </div>

      <OrdersSummaryBar summary={summary} />

      <OrdersFilters filters={filters} onChange={setFilters} />

      <BulkActionsBar selectedCount={selectedIds.size} onClear={() => setSelectedIds(new Set())} />

      {visibleOrders.length > 0 ? (
        <div className="flex items-center gap-2 px-1">
          <Checkbox
            checked={allVisibleSelected}
            onCheckedChange={(v) => toggleSelectAll(!!v)}
            aria-label="Selecionar todos"
          />
          <span className="text-sm text-muted-foreground">Selecionar todos</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {visibleOrders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nenhum pedido encontrado"
            description="Ajuste os filtros ou o período selecionado para ver os pedidos."
          />
        ) : (
          visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              selected={selectedIds.has(order.id)}
              onSelectedChange={(checked) => toggleSelect(order.id, checked)}
              onLinkSku={handleLinkSku}
            />
          ))
        )}
      </div>
    </div>
  );
}
