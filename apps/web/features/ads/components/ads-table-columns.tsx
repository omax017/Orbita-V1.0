import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { AdProductSummary } from "../types";

const CLASSIFICATION_BADGE: Record<string, string> = {
  Estrela: "bg-success/10 text-success",
  Moderado: "bg-primary/10 text-primary",
  Risco: "bg-warning/10 text-warning",
  Prejuízo: "bg-destructive/10 text-destructive",
};

function signed(value: number | null): string {
  if (value === null) return "—";
  return `${value < 0 ? "− " : ""}${formatCurrency(Math.abs(value))}`;
}

function signedPercent(value: number | null): string {
  if (value === null) return "—";
  return formatPercent(value);
}

export const adsTableColumns: ColumnDef<AdProductSummary>[] = [
  {
    accessorKey: "productTitle",
    header: "Produto",
    cell: ({ row }) => (
      <div className="max-w-[220px]">
        <p className="truncate font-medium text-foreground">{row.original.productTitle}</p>
        <p className="text-xs text-muted-foreground">{row.original.skuCode ?? "sem SKU vinculado"}</p>
      </div>
    ),
  },
  {
    accessorKey: "classification",
    header: "Classificação",
    cell: ({ row }) => {
      const c = row.original.classification;
      if (!c) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", CLASSIFICATION_BADGE[c])}>{c}</span>
      );
    },
  },
  {
    accessorKey: "investment",
    header: "Investimento",
    cell: ({ row }) => formatCurrency(row.original.investment),
  },
  {
    accessorKey: "adsOrders",
    header: "Vendas",
    cell: ({ row }) => formatNumber(row.original.adsOrders),
  },
  {
    accessorKey: "adsRevenue",
    header: "Receita de Ads",
    cell: ({ row }) => formatCurrency(row.original.adsRevenue),
  },
  {
    accessorKey: "roas",
    header: "ROAS",
    cell: ({ row }) => `${row.original.roas.toFixed(2).replace(".", ",")}x`,
  },
  {
    accessorKey: "acos",
    header: "ACoS",
    cell: ({ row }) => formatPercent(row.original.acos),
  },
  {
    accessorKey: "profitAfterAds",
    header: "Lucro pós-Ads",
    cell: ({ row }) => (
      <span className={cn(row.original.profitAfterAds !== null && (row.original.profitAfterAds >= 0 ? "text-success" : "text-destructive"))}>
        {signed(row.original.profitAfterAds)}
      </span>
    ),
  },
  {
    accessorKey: "roiAfterAds",
    header: "ROI pós-Ads",
    cell: ({ row }) => signedPercent(row.original.roiAfterAds),
  },
  {
    accessorKey: "marginAfterAds",
    header: "Margem pós-Ads",
    cell: ({ row }) => signedPercent(row.original.marginAfterAds),
  },
];
