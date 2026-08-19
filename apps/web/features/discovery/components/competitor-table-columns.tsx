import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { CompetitorProduct } from "../types";

function formatAge(days: number): string {
  if (days < 30) return `${days} dias`;
  if (days < 365) return `${Math.round(days / 30)} meses`;
  return `${(days / 365).toFixed(1).replace(".", ",")} anos`;
}

const LOGISTICS_BADGE: Record<string, string> = {
  Full: "bg-primary/10 text-primary",
  Correios: "bg-muted text-muted-foreground",
  Coleta: "bg-muted text-muted-foreground",
  Agência: "bg-muted text-muted-foreground",
};

export const competitorTableColumns: ColumnDef<CompetitorProduct>[] = [
  {
    accessorKey: "title",
    header: "Produto",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 max-w-[240px]">
        <span className={cn("h-8 w-8 shrink-0 rounded-md", row.original.thumbnailColor)} />
        <span className="truncate font-medium text-foreground">{row.original.title}</span>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: "visits30d",
    header: "Visitas (30d)",
    cell: ({ row }) => formatNumber(row.original.visits30d),
  },
  {
    accessorKey: "sales30d",
    header: "Vendas (30d)",
    cell: ({ row }) => formatNumber(row.original.sales30d),
  },
  {
    accessorKey: "logisticsType",
    header: "Logística",
    cell: ({ row }) => (
      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", LOGISTICS_BADGE[row.original.logisticsType])}>
        {row.original.logisticsType}
      </span>
    ),
  },
  {
    accessorKey: "createdAgoDays",
    header: "Tempo de criação",
    cell: ({ row }) => formatAge(row.original.createdAgoDays),
  },
  {
    accessorKey: "sellerName",
    header: "Vendedor",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.sellerName}</span>,
  },
];
