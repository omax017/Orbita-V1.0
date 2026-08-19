"use client";

import { ChevronDown, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ALL_ACCOUNTS_ID, type AccountOption } from "./types";

const PROVIDER_DOT: Record<NonNullable<AccountOption["provider"]>, string> = {
  MERCADO_LIVRE: "bg-chart-1",
  SHOPEE: "bg-chart-3",
};

export interface AccountSelectorProps {
  accounts: AccountOption[];
  value: string;
  onChange: (accountId: string) => void;
}

/** Filtro de conta de marketplace — "Todas as contas" ou uma conta específica. */
export function AccountSelector({ accounts, value, onChange }: AccountSelectorProps) {
  const selected =
    value === ALL_ACCOUNTS_ID ? null : accounts.find((a) => a.id === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Store className="h-4 w-4" />
          {selected ? selected.label : "Todas as contas"}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Conta de marketplace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onChange(ALL_ACCOUNTS_ID)}>
          <span
            className={cn(
              "font-medium",
              value === ALL_ACCOUNTS_ID ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Todas as contas
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {accounts.map((account) => (
          <DropdownMenuItem key={account.id} onSelect={() => onChange(account.id)}>
            <span
              className={cn(
                "size-1.5 rounded-full",
                account.provider ? PROVIDER_DOT[account.provider] : "bg-muted-foreground",
              )}
            />
            <span className={value === account.id ? "font-medium text-foreground" : ""}>
              {account.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
