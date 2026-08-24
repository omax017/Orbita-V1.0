import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";
import { computeStockHealth, countLinkedListings, type MockSku } from "../types";
import { StockHealthBadge } from "./stock-health-badge";

const MASK = "••••";

export interface SkuColumnsOptions {
  hideValues: boolean;
  listings: Array<{ skuCode: string | null }>;
  stockView: "local" | "full";
  onDelete: (sku: MockSku) => void;
}

export function buildSkuColumns({ hideValues, listings, stockView, onDelete }: SkuColumnsOptions): ColumnDef<MockSku>[] {
  return [
    {
      accessorKey: "code",
      header: "SKU",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <span className={`h-8 w-8 shrink-0 rounded-md ${row.original.imageColor}`} />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.code}</p>
          </div>
        </div>
      ),
      meta: { exportable: false },
    },
    {
      accessorKey: "costAmount",
      header: "Custo",
      cell: ({ row }) => (hideValues ? MASK : formatCurrency(row.original.costAmount)),
    },
    {
      accessorKey: "packagingCostAmount",
      header: "Embalagem",
      cell: ({ row }) => (hideValues ? MASK : formatCurrency(row.original.packagingCostAmount)),
    },
    {
      id: "stock",
      header: stockView === "local" ? "Estoque local" : "Estoque Full",
      accessorFn: (sku) => (stockView === "local" ? sku.stockLocal : sku.stockFull),
      cell: ({ row }) =>
        formatNumber(stockView === "local" ? row.original.stockLocal : row.original.stockFull),
    },
    {
      id: "health",
      header: "Saúde",
      accessorFn: (sku) => computeStockHealth(sku),
      cell: ({ row }) => <StockHealthBadge health={computeStockHealth(row.original)} />,
      meta: { exportable: false },
    },
    {
      id: "linkedListings",
      header: "Anúncios vinculados",
      accessorFn: (sku) => countLinkedListings(sku.code, listings),
      cell: ({ row }) => `${countLinkedListings(row.original.code, listings)} anúncio(s)`,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label={`Remover ${row.original.name}`}
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
      meta: { exportable: false },
    },
  ];
}
