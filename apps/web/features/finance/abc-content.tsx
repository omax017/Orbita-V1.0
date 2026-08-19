"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { MOCK_SALE_RECORDS } from "./mock-data";
import { buildAbcRanking, summarizeAbcClasses } from "./abc";
import type { AbcMetric } from "./types";
import { AbcMetricToggle } from "./components/abc-metric-toggle";
import { AbcClassCards } from "./components/abc-class-cards";
import { ParetoChart } from "./components/pareto-chart";
import { abcTableColumns } from "./components/abc-table-columns";

export function AbcContent() {
  const [metric, setMetric] = useState<AbcMetric>("revenue");

  const ranking = useMemo(() => buildAbcRanking(MOCK_SALE_RECORDS, metric), [metric]);
  const classSummaries = useMemo(() => summarizeAbcClasses(ranking), [ranking]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Análise ABC</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Classificação de produtos por concentração de valor
          </p>
        </div>
        <AbcMetricToggle value={metric} onChange={setMetric} />
      </div>

      <AbcClassCards summaries={classSummaries} />

      <ParetoChart ranking={ranking} />

      <DataTable
        columns={abcTableColumns}
        data={ranking}
        exportFilename="analise-abc"
        emptyState={{ icon: Trophy, title: "Nenhum produto vendido no período" }}
      />
    </div>
  );
}
