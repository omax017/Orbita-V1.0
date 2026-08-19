import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";

export interface MissingCostBannerProps {
  count: number;
  revenueAffected: number;
}

/**
 * Aparece quando existem pedidos sincronizados sem SKU/custo vinculado —
 * diferente do `OnboardingSkuCard` (nenhum SKU cadastrado ainda), este caso
 * é "alguns pedidos ficaram sem vínculo" mesmo com produtos já cadastrados
 * (ex.: item novo, variação não mapeada). Usa o token `--warning` (âmbar).
 */
export function MissingCostBanner({ count, revenueAffected }: MissingCostBannerProps) {
  if (count === 0) return null;

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p className="text-sm text-foreground">
          <strong className="font-semibold">{formatNumber(count)} pedidos</strong>{" "}
          ({formatCurrency(revenueAffected)} em receita) estão sem custo de produto
          vinculado — o lucro líquido pode estar subestimado.
        </p>
      </div>
      <Button asChild variant="outline" size="sm" className="w-full shrink-0 gap-1.5 border-warning/40 sm:w-auto">
        <Link href="/pedidos">
          Resolver agora
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
