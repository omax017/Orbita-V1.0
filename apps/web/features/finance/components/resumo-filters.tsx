"use client";

import { ChevronDown, Search } from "lucide-react";
import { AccountSelector } from "@/components/filters/account-selector";
import { MOCK_ACCOUNTS } from "@/components/filters/mock-accounts";
import { PeriodSelector } from "@/components/filters/period-selector";
import type { PeriodSelection } from "@/components/filters/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ORDER_STATUS_LABEL } from "@/features/orders/mock-data";
import type { OrderStatus } from "@/features/orders/types";
import type { ResumoFilterState } from "../filters";

const ALL_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export interface ResumoFiltersProps {
  filters: ResumoFilterState;
  onChange: (updater: (prev: ResumoFilterState) => ResumoFilterState) => void;
}

export function ResumoFilters({ filters, onChange }: ResumoFiltersProps) {
  function set<K extends keyof ResumoFilterState>(key: K, value: ResumoFilterState[K]) {
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PeriodSelector value={filters.period} onChange={(period: PeriodSelection) => set("period", period)} />
      <AccountSelector accounts={MOCK_ACCOUNTS} value={filters.accountId} onChange={(id) => set("accountId", id)} />

      <div className="relative min-w-[180px] max-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Título do produto…"
          className="h-9 pl-8"
        />
      </div>

      <Input
        value={filters.skuQuery}
        onChange={(e) => set("skuQuery", e.target.value)}
        placeholder="SKU"
        className="h-9 w-28"
      />

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
  );
}
