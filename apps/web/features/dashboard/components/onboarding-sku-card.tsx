import Link from "next/link";
import { ArrowRight, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Só renderiza quando o workspace não tem nenhum Sku cadastrado ainda (ver
 * `MOCK_HAS_SKUS` em `mock-data.ts` — no futuro, `workspace.skuCount === 0`).
 * Sem custo de produto vinculado, o lucro líquido mostrado no resto da tela
 * não é confiável — por isso o CTA aparece com destaque de marca.
 */
export function OnboardingSkuCard() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <PackagePlus className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Cadastre seu primeiro SKU
          </h2>
          <p className="mt-0.5 max-w-md text-sm text-muted-foreground">
            Sem custo de produto vinculado, o lucro líquido mostrado aqui é uma
            estimativa incompleta. Leva menos de 2 minutos.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="w-full shrink-0 gap-1.5 sm:w-auto">
        <Link href="/estoque">
          Cadastrar SKU
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
