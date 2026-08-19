import type { ColumnDef } from "@tanstack/react-table";
import { MarketplaceTag } from "@/components/marketplace-tag";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { SaleRecord } from "../types";

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

export const salesTableColumns: ColumnDef<SaleRecord>[] = [
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => DATE_FORMAT.format(row.original.date),
  },
  {
    accessorKey: "title",
    header: "Produto",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="max-w-[220px] truncate font-medium text-foreground">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{row.original.skuCode ?? "sem SKU"}</p>
      </div>
    ),
  },
  {
    id: "account",
    header: "Conta",
    accessorFn: (r) => r.accountLabel,
    cell: ({ row }) => <MarketplaceTag provider={row.original.provider} accountLabel={row.original.accountLabel} />,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (r) => r.status,
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    meta: { exportable: false },
  },
  {
    accessorKey: "quantity",
    header: "Qtd.",
    cell: ({ row }) => formatNumber(row.original.quantity),
  },
  {
    accessorKey: "revenue",
    header: "Receita",
    cell: ({ row }) => formatCurrency(row.original.revenue),
  },
  {
    id: "totalCosts",
    header: "Custos",
    accessorFn: (r) => r.feeAmount + r.shippingAmount + r.packagingCostAmount + r.taxAmount + r.costAmount,
    cell: ({ row }) => {
      const r = row.original;
      return formatCurrency(r.feeAmount + r.shippingAmount + r.packagingCostAmount + r.taxAmount + r.costAmount);
    },
  },
  {
    accessorKey: "netProfit",
    header: "Lucro líquido",
    cell: ({ row }) => (
      <span className={row.original.netProfit >= 0 ? "text-success" : "text-destructive"}>
        {formatCurrency(row.original.netProfit)}
      </span>
    ),
  },
];
