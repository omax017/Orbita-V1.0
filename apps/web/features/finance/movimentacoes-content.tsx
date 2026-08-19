"use client";

import { useMemo, useState } from "react";
import { Download, Receipt, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatCurrency } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/export-csv";
import { MOCK_MOVEMENTS } from "./mock-data";
import type { FinancialMovementRecord } from "./types";
import { MovementDialog } from "./components/movement-dialog";
import { ImportMovementsDialog } from "./components/import-movements-dialog";
import { buildMovementsTableColumns } from "./components/movements-table-columns";

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function MovimentacoesContent() {
  const [movements, setMovements] = useState<FinancialMovementRecord[]>(MOCK_MOVEMENTS);

  const summary = useMemo(() => {
    const entradas = movements.filter((m) => m.category === "Entrada").reduce((s, m) => s + m.amount, 0);
    const custoFixo = movements.filter((m) => m.category === "Custo Fixo").reduce((s, m) => s + Math.abs(m.amount), 0);
    const custoOperacional = movements.filter((m) => m.category === "Custo Operacional").reduce((s, m) => s + Math.abs(m.amount), 0);
    const recorrentes = movements.filter((m) => m.recurrence === "MENSAL").length;
    return { entradas, custoFixo, custoOperacional, recorrentes };
  }, [movements]);

  function handleSave(movement: FinancialMovementRecord) {
    setMovements((prev) => {
      const exists = prev.some((m) => m.id === movement.id);
      if (exists) return prev.map((m) => (m.id === movement.id ? movement : m));
      return [movement, ...prev];
    });
  }

  function handleDelete(id: string) {
    setMovements((prev) => prev.filter((m) => m.id !== id));
  }

  function handleExport() {
    exportRowsToCsv(
      "movimentacoes",
      ["Data", "Descrição", "Categoria", "Recorrência", "Valor"],
      movements.map((m) => [
        DATE_FORMAT.format(m.date),
        m.description,
        m.category,
        m.recurrence === "MENSAL" ? "Mensal" : "Única",
        formatCurrency(m.amount),
      ]),
    );
  }

  const columns = useMemo(() => buildMovementsTableColumns(handleSave, handleDelete), []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Movimentações</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Lançamentos manuais de entrada e saída</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ImportMovementsDialog />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
          <MovementDialog onSave={handleSave} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={TrendingUp} label="Entradas" value={formatCurrency(summary.entradas)} hint="lançamentos manuais" />
        <KpiCard icon={TrendingDown} label="Custo fixo" value={formatCurrency(summary.custoFixo)} hint="no período" />
        <KpiCard icon={Receipt} label="Custo operacional" value={formatCurrency(summary.custoOperacional)} hint="no período" />
        <KpiCard icon={RefreshCw} label="Recorrentes" value={String(summary.recorrentes)} hint="lançamentos mensais" />
      </div>

      <DataTable
        columns={columns}
        data={movements}
        exportFilename="movimentacoes"
        emptyState={{ icon: Receipt, title: "Nenhuma movimentação lançada" }}
      />
    </div>
  );
}
