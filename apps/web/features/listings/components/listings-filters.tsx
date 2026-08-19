"use client";

import { ChevronDown, Search } from "lucide-react";
import { AccountSelector } from "@/components/filters/account-selector";
import { MOCK_ACCOUNTS } from "@/components/filters/mock-accounts";
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
import {
  LISTING_SORT_LABEL,
  countActiveListingsFilters,
  type ListingSortOption,
  type ListingsFilterState,
} from "../filters";
import type { ListingChannel, ListingStatus } from "../types";

const ALL_STATUSES: { value: ListingStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "CLOSED", label: "Encerrado" },
  { value: "UNDER_REVIEW", label: "Em revisão" },
];

const CHANNELS: ListingChannel[] = ["Orgânico", "Ads"];

export interface ListingsFiltersProps {
  filters: ListingsFilterState;
  onChange: (updater: (prev: ListingsFilterState) => ListingsFilterState) => void;
  availableTags: string[];
}

export function ListingsFilters({ filters, onChange, availableTags }: ListingsFiltersProps) {
  function set<K extends keyof ListingsFilterState>(key: K, value: ListingsFilterState[K]) {
    onChange((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStatus(status: ListingStatus, checked: boolean) {
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
      tag: "all",
      onlyCatalog: false,
      onlyMissingSku: false,
      sortBy: "recent",
    }));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Buscar por título ou anúncio…"
            className="h-9 pl-8"
          />
        </div>

        <AccountSelector
          accounts={MOCK_ACCOUNTS}
          value={filters.accountId}
          onChange={(accountId) => set("accountId", accountId)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Canal
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItemLike label="Todos" active={filters.channel === "all"} onClick={() => set("channel", "all")} />
            {CHANNELS.map((channel) => (
              <DropdownMenuItemLike
                key={channel}
                label={channel}
                active={filters.channel === channel}
                onClick={() => set("channel", channel)}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
                key={status.value}
                checked={filters.statuses.has(status.value)}
                onCheckedChange={(checked) => toggleStatus(status.value, !!checked)}
                onSelect={(e) => e.preventDefault()}
              >
                {status.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <FilterPanel activeCount={countActiveListingsFilters(filters)} onClear={clearAdvanced}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="listing-filter-sku" className="text-xs">
              SKU
            </Label>
            <Input
              id="listing-filter-sku"
              value={filters.skuQuery}
              onChange={(e) => set("skuQuery", e.target.value)}
              placeholder="Código do SKU"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tag</Label>
            <select
              value={filters.tag}
              onChange={(e) => set("tag", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todas</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Ordenar por</Label>
            <select
              value={filters.sortBy}
              onChange={(e) => set("sortBy", e.target.value as ListingSortOption)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(LISTING_SORT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 self-end pb-1.5 text-sm text-foreground">
            <Checkbox checked={filters.onlyCatalog} onCheckedChange={(v) => set("onlyCatalog", !!v)} />
            Só Catálogo
          </label>

          <label className="flex items-center gap-2 self-end pb-1.5 text-sm text-foreground">
            <Checkbox
              checked={filters.onlyMissingSku}
              onCheckedChange={(v) => set("onlyMissingSku", !!v)}
            />
            Sem SKU vinculado
          </label>
        </div>
      </FilterPanel>
    </div>
  );
}

function DropdownMenuItemLike({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
    >
      <span className={active ? "font-medium text-foreground" : ""}>{label}</span>
    </button>
  );
}
