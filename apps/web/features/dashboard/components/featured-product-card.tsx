import { Trophy } from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { FeaturedProduct } from "../mock-data";

export interface FeaturedProductCardProps {
  product: FeaturedProduct;
}

/** Produto destaque (top seller) do período selecionado. */
export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const stats = [
    { label: "Vendas", value: `${formatNumber(product.unitsSold)} un.` },
    { label: "Faturamento", value: formatCurrency(product.revenue) },
    { label: "Margem", value: formatPercent(product.marginPercent) },
    { label: "Lucro", value: formatCurrency(product.profit) },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Trophy className="h-4 w-4 text-warning" />
        Produto destaque
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-semibold text-muted-foreground">
          {product.title.charAt(0)}
        </span>
        <p className="text-sm font-medium leading-snug text-foreground">{product.title}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-foreground">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
