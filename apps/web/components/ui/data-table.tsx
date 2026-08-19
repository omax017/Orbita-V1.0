"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState, type EmptyStateProps } from "@/components/ui/empty-state";
import { exportRowsToCsv } from "@/lib/export-csv";
import { cn } from "@/lib/utils";

// Amplia o `meta` do TanStack Table para aceitar `exportable: false` numa
// coluna (ex.: uma coluna de ações/checkbox que não faz sentido no CSV).
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    exportable?: boolean;
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Nome do arquivo exportado (sem extensão). Omitir esconde o botão de exportação. */
  exportFilename?: string;
  emptyState?: Pick<EmptyStateProps, "icon" | "title" | "description" | "actionLabel" | "onAction">;
  pageSize?: number;
  /** Slot livre à esquerda da toolbar (ex.: busca, FilterPanel). */
  toolbar?: React.ReactNode;
  className?: string;
}

/**
 * Tabela densa com colunas configuráveis (mostrar/ocultar via dropdown),
 * ordenação por coluna e exportação para CSV. Todo módulo com listagem
 * tabular (Pedidos, Anúncios, Movimentações...) usa esta mesma base —
 * define só as `columns` e passa os `data` já carregados.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  exportFilename,
  emptyState,
  pageSize = 20,
  toolbar,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, columnFilters },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;

  function handleExport() {
    if (!exportFilename) return;
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => col.columnDef.meta?.exportable !== false);

    const headers = visibleColumns.map((col) => headerLabel(col.columnDef));
    const exportRows = table.getFilteredRowModel().rows.map((row) =>
      visibleColumns.map((col) => {
        const value = row.getValue(col.id);
        return value === null || value === undefined ? "" : String(value);
      }),
    );

    exportRowsToCsv(exportFilename, headers, exportRows);
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex-1">{toolbar}</div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns3 className="h-4 w-4" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {headerLabel(col.columnDef)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {exportFilename ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-3 py-2 text-left font-medium"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : sortDirection === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState ? (
                    <EmptyState className="rounded-none border-none" {...emptyState} />
                  ) : (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                      Nenhum resultado encontrado.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-3 py-2 text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 ? (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {Math.max(table.getPageCount(), 1)} · {table.getFilteredRowModel().rows.length}{" "}
            registros
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function headerLabel<TData, TValue>(columnDef: ColumnDef<TData, TValue>): string {
  if (typeof columnDef.header === "string") return columnDef.header;
  return columnDef.id ?? "";
}
