import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { AbcRankedProduct } from "../types";

const CLASS_BADGE: Record<string, string> = {
  A: "bg-success/10 text-success",
  B: "bg-warning/10 text-warning",
  C: "bg-muted text-muted-foreground",
};

export const abcTableColumns: ColumnDef<AbcRankedProduct>[] = [
  {
    accessorKey: "position",
    header: "Posição",
    cell: ({ row }) => <span className="text-muted-foreground">#{row.original.position}</span>,
  },
  {
    accessorKey: "title",
    header: "Produto",
    cell: ({ row }) => (
      <div className="max-w-[220px]">
        <p className="truncate font-medium text-foreground">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{row.original.skuCode ?? "—"}</p>
      </div>
    ),
  },
  {
    accessorKey: "skuCode",
    header: "SKU",
    cell: ({ row }) => row.original.skuCode ?? "—",
    meta: { exportable: true },
  },
  {
    accessorKey: "quantity",
    header: "Quantidade",
    cell: ({ row }) => formatNumber(row.original.quantity),
  },
  {
    accessorKey: "revenue",
    header: "Receita",
    cell: ({ row }) => formatCurrency(row.original.revenue),
  },
  {
    accessorKey: "avgTicket",
    header: "Ticket médio",
    cell: ({ row }) => formatCurrency(row.original.avgTicket),
  },
  {
    accessorKey: "individualPercent",
    header: "% individual",
    cell: ({ row }) => formatPercent(row.original.individualPercent),
  },
  {
    accessorKey: "cumulativePercent",
    header: "% acumulado",
    cell: ({ row }) => formatPercent(row.original.cumulativePercent),
  },
  {
    accessorKey: "turnover",
    header: "Giro",
    cell: ({ row }) => row.original.turnover.toFixed(1).replace(".", ","),
  },
  {
    accessorKey: "abcClass",
    header: "Classe",
    cell: ({ row }) => (
      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", CLASS_BADGE[row.original.abcClass])}>
        {row.original.abcClass}
      </span>
    ),
  },
];
