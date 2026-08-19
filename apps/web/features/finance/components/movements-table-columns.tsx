import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { FinancialMovementRecord } from "../types";
import { MovementDialog } from "./movement-dialog";

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function buildMovementsTableColumns(
  onEdit: (movement: FinancialMovementRecord) => void,
  onDelete: (id: string) => void,
): ColumnDef<FinancialMovementRecord>[] {
  return [
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => DATE_FORMAT.format(row.original.date),
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.description}</span>,
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
    },
    {
      accessorKey: "recurrence",
      header: "Recorrência",
      cell: ({ row }) => (row.original.recurrence === "MENSAL" ? "Mensal" : "Única"),
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => (
        <span className={cn("font-medium tabular-nums", row.original.amount >= 0 ? "text-success" : "text-destructive")}>
          {row.original.amount >= 0 ? "+ " : "− "}
          {formatCurrency(Math.abs(row.original.amount))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      meta: { exportable: false },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <MovementDialog movement={row.original} onSave={onEdit} />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label="Excluir lançamento"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
