import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { Invoice } from "../types";

const STATUS_LABEL: Record<Invoice["status"], { label: string; variant: "success" | "warning" | "destructive" }> = {
  PAID: { label: "Paga", variant: "success" },
  OPEN: { label: "Em aberto", variant: "warning" },
  OVERDUE: { label: "Atrasada", variant: "destructive" },
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export const invoiceTableColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "issuedAt",
    header: "Data",
    cell: ({ row }) => DATE_FORMAT.format(row.original.issuedAt),
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.description}</span>,
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={STATUS_LABEL[row.original.status].variant}>{STATUS_LABEL[row.original.status].label}</Badge>,
  },
  {
    id: "actions",
    header: "",
    meta: { exportable: false },
    cell: () => (
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
        <Download className="h-3.5 w-3.5" />
        PDF
      </Button>
    ),
  },
];
