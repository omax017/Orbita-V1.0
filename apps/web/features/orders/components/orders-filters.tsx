"use client";

import { ChevronDown, Search } from "lucide-react";
import { AccountSelector } from "@/components/filters/account-selector";
import { PeriodSelector } from "@/components/filters/period-selector";
import type { PeriodSelection } from "@/components/filters/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterPanel } from "@/components/ui/filter-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_ACCOUNTS } from "@/components/filters/mock-accounts";
import { ORDER_STATUS_LABEL } from "../mock-data";
import type { OrderStatus, SalesChannel, ShippingType } from "../types";
import {
  SORT_LABEL,
  countActiveAdvancedFilters,
  type OrdersFilterState,
  type SortOption,
} from "../filters";

const ALL_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];
const SHIPPING_TYPES: ShippingType[] = ["Correios", "Transportadora", "Full", "Combinado com o comprador"];
const CHANNELS: SalesChannel[] = ["Orgânico", "Ads", "Externo"];

export interface OrdersFiltersProps {
  filters: OrdersFilterState;
  onChange: (updater: (prev: OrdersFilterState) => OrdersFilterState) => void;
}

export function OrdersFilters({ filters, onChange }: OrdersFiltersProps) {
  function set<K extends keyof OrdersFilterState>(key: K, value: OrdersFilterState[K]) {
    onChange((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStatus(status: OrderStatus, checked: boolean) {
    onChange((prev) => {
      const next = new Set(prev.statuses);
      if (checked) next.add(status);
      else next.delete(status);
      return { ...prev, statuses: next };
    });
  }

  function clearAdvanced() {
    onChange((prev) => ({
      ...prev,
      skuQuery: "",
      shippingType: "all",
      channel: "all",
      onlyMissingSku: false,
      onlyNegativeMargin: false,
      sortBy: "recent",
    }));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <PeriodSelector
          value={filters.period}
          onChange={(period: PeriodSelection) => set("period", period)}
        />
        <AccountSelector
          accounts={MOCK_ACCOUNTS}
          value={filters.accountId}
          onChange={(accountId) => set("accountId", accountId)}
        />

        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Buscar por pedido ou produto…"
            className="h-9 pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Status
              {filters.statuses.size > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                  {filters.statuses.size}
                </span>
              ) : null}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_STATUSES.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.statuses.has(status)}
                onCheckedChange={(checked) => toggleStatus(status, !!checked)}
                onSelect={(e) => e.preventDefault()}
              >
                {ORDER_STATUS_LABEL[status]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <FilterPanel activeCount={countActiveAdvancedFilters(filters)} onClear={clearAdvanced}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="filter-sku" className="text-xs">
              SKU
            </Label>
            <Input
              id="filter-sku"
              value={filters.skuQuery}
              onChange={(e) => set("skuQuery", e.target.value)}
              placeholder="Código do SKU"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de envio</Label>
            <select
              value={filters.shippingType}
              onChange={(e) => set("shippingType", e.target.value as OrdersFilterState["shippingType"])}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todos</option>
              {SHIPPING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Canal</Label>
            <select
              value={filters.channel}
              onChange={(e) => set("channel", e.target.value as OrdersFilterState["channel"])}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todos</option>
              {CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Ordenar por</Label>
            <select
              value={filters.sortBy}
              onChange={(e) => set("sortBy", e.target.value as SortOption)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(SORT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 self-end pb-1.5 text-sm text-foreground">
            <Checkbox
              checked={filters.onlyMissingSku}
              onCheckedChange={(v) => set("onlyMissingSku", !!v)}
            />
            Sem SKU vinculado
          </label>

          <label className="flex items-center gap-2 self-end pb-1.5 text-sm text-foreground">
            <Checkbox
              checked={filters.onlyNegativeMargin}
              onCheckedChange={(v) => set("onlyNegativeMargin", !!v)}
            />
            Margem negativa
          </label>
        </div>
      </FilterPanel>
    </div>
  );
}
