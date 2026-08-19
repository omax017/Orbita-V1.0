"use client";

import { Search } from "lucide-react";
import { AccountSelector } from "@/components/filters/account-selector";
import { MOCK_ACCOUNTS } from "@/components/filters/mock-accounts";
import { PeriodSelector } from "@/components/filters/period-selector";
import type { PeriodSelection } from "@/components/filters/types";
import { Input } from "@/components/ui/input";
import type { AdsFilterState } from "../filters";

export interface AdsFiltersProps {
  filters: AdsFilterState;
  onChange: (updater: (prev: AdsFilterState) => AdsFilterState) => void;
}

export function AdsFilters({ filters, onChange }: AdsFiltersProps) {
  function set<K extends keyof AdsFilterState>(key: K, value: AdsFilterState[K]) {
    onChange((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PeriodSelector value={filters.period} onChange={(period: PeriodSelection) => set("period", period)} />
      <AccountSelector accounts={MOCK_ACCOUNTS} value={filters.accountId} onChange={(id) => set("accountId", id)} />

      <div className="relative min-w-[200px] max-w-[260px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.skuQuery}
          onChange={(e) => set("skuQuery", e.target.value)}
          placeholder="Buscar por SKU ou produto…"
          className="h-9 pl-8"
        />
      </div>
    </div>
  );
}
