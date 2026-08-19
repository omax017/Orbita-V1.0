import type { PeriodSelection } from "@/components/filters/types";
import { ALL_ACCOUNTS_ID } from "@/components/filters/types";
import {
  computeOrderFinancials,
  type MockOrder,
  type OrderStatus,
  type SalesChannel,
  type ShippingType,
} from "./types";

export type SortOption = "recent" | "value_desc" | "margin_desc" | "margin_asc";

export const SORT_LABEL: Record<SortOption, string> = {
  recent: "Mais recentes",
  value_desc: "Maior valor",
  margin_desc: "Maior margem",
  margin_asc: "Menor margem",
};

export interface OrdersFilterState {
  period: PeriodSelection;
  accountId: string;
  search: string;
  statuses: Set<OrderStatus>;
  skuQuery: string;
  shippingType: ShippingType | "all";
  channel: SalesChannel | "all";
  onlyMissingSku: boolean;
  onlyNegativeMargin: boolean;
  sortBy: SortOption;
}

function accountMatches(order: MockOrder, accountId: string): boolean {
  if (accountId === ALL_ACCOUNTS_ID) return true;
  if (accountId === "acc_ml") return order.provider === "MERCADO_LIVRE";
  if (accountId === "acc_shopee") return order.provider === "SHOPEE";
  return true;
}

function searchMatches(order: MockOrder, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  if (order.externalId.toLowerCase().includes(q)) return true;
  if (order.buyerName.toLowerCase().includes(q)) return true;
  return order.items.some((item) => item.title.toLowerCase().includes(q));
}

export function filterAndSortOrders(orders: MockOrder[], filters: OrdersFilterState): MockOrder[] {
  const filtered = orders.filter((order) => {
    if (order.orderedAt < filters.period.from || order.orderedAt > filters.period.to) return false;
    if (!accountMatches(order, filters.accountId)) return false;
    if (!searchMatches(order, filters.search)) return false;
    if (filters.statuses.size > 0 && !filters.statuses.has(order.status)) return false;
    if (filters.shippingType !== "all" && order.shippingType !== filters.shippingType) return false;
    if (filters.channel !== "all" && order.channel !== filters.channel) return false;

    if (filters.skuQuery.trim()) {
      const q = filters.skuQuery.trim().toLowerCase();
      const hasMatch = order.items.some((item) => item.skuCode?.toLowerCase().includes(q));
      if (!hasMatch) return false;
    }

    const financials = computeOrderFinancials(order);
    if (filters.onlyMissingSku && !financials.hasMissingCost) return false;
    if (filters.onlyNegativeMargin && !financials.hasNegativeMargin) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case "value_desc":
        return b.totalAmount - a.totalAmount;
      case "margin_desc":
      case "margin_asc": {
        const marginA = computeOrderFinancials(a).marginPercent ?? -Infinity;
        const marginB = computeOrderFinancials(b).marginPercent ?? -Infinity;
        return filters.sortBy === "margin_desc" ? marginB - marginA : marginA - marginB;
      }
      case "recent":
      default:
        return b.orderedAt.getTime() - a.orderedAt.getTime();
    }
  });

  return sorted;
}

export interface OrdersSummary {
  count: number;
  revenue: number;
  netProfit: number;
  marginPercent: number;
}

export function summarizeOrders(orders: MockOrder[]): OrdersSummary {
  let revenue = 0;
  let netProfit = 0;

  for (const order of orders) {
    revenue += order.totalAmount;
    const financials = computeOrderFinancials(order);
    netProfit += financials.netProfit ?? 0;
  }

  return {
    count: orders.length,
    revenue,
    netProfit,
    marginPercent: revenue > 0 ? (netProfit / revenue) * 100 : 0,
  };
}

export function countActiveAdvancedFilters(filters: OrdersFilterState): number {
  let count = 0;
  if (filters.skuQuery.trim()) count += 1;
  if (filters.shippingType !== "all") count += 1;
  if (filters.channel !== "all") count += 1;
  if (filters.onlyMissingSku) count += 1;
  if (filters.onlyNegativeMargin) count += 1;
  if (filters.sortBy !== "recent") count += 1;
  return count;
}
