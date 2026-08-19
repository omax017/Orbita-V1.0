import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";

export interface NoCostAlertProps {
  count: number;
  investmentAffected: number;
}

/** Mesmo padrão do MissingCostBanner do Dashboard (Etapa 3) — aqui o problema
 * é investimento em Ads sem custo de produto vinculado, então não dá pra
 * saber se o produto está dando lucro ou prejuízo com a campanha. */
export function NoCostAlert({ count, investmentAffected }: NoCostAlertProps) {
  if (count === 0) return null;

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <p className="text-sm text-foreground">
          <strong className="font-semibold">{formatNumber(count)} produto(s)</strong>{" "}
          rodando Ads ({formatCurrency(investmentAffected)} investidos) sem custo vinculado — não é
          possível calcular lucro, ROI nem classificação de saúde para eles.
        </p>
      </div>
      <Button asChild variant="outline" size="sm" className="w-full shrink-0 gap-1.5 border-warning/40 sm:w-auto">
        <Link href="/estoque">
          Vincular custo
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
