"use client";

import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/lib/format";
import { computeOrderFinancials, type MockOrder } from "../types";

export interface CostBreakdownPopoverProps {
  order: MockOrder;
}

/** Botão "Custos da venda" — abre o breakdown de taxas/frete/imposto/custo/lucro. */
export function CostBreakdownPopover({ order }: CostBreakdownPopoverProps) {
  const financials = computeOrderFinancials(order);

  const rows: Array<{ label: string; value: number; tone?: "destructive" }> = [
    { label: "Valor do pedido", value: order.totalAmount },
    { label: "Taxa do marketplace", value: -order.feeAmount, tone: "destructive" },
    { label: "Frete", value: -order.shippingCost, tone: "destructive" },
    { label: "Imposto", value: -order.taxAmount, tone: "destructive" },
    {
      label: "Custo do produto",
      value: order.costAmount === null ? 0 : -order.costAmount,
      tone: "destructive",
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Receipt className="h-3.5 w-3.5" />
          Custos da venda
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Composição do valor
        </p>
        <div className="mt-2 space-y-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={row.tone === "destructive" ? "text-destructive" : "text-foreground"}>
                {row.value >= 0 ? formatCurrency(row.value) : `- ${formatCurrency(Math.abs(row.value))}`}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
          <span className="text-foreground">Lucro líquido</span>
          <span className={financials.hasMissingCost || (financials.netProfit ?? 0) < 0 ? "text-destructive" : "text-success"}>
            {financials.hasMissingCost ? "— sem custo" : formatCurrency(financials.netProfit ?? 0)}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
