import { Package, ShoppingBag, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export type MarketplaceTagProvider = "MERCADO_LIVRE" | "SHOPEE" | "EXTERNAL";

const PROVIDER_META: Record<MarketplaceTagProvider, { icon: typeof Store; classes: string }> = {
  MERCADO_LIVRE: { icon: Store, classes: "bg-chart-1/15 text-chart-1" },
  SHOPEE: { icon: ShoppingBag, classes: "bg-chart-3/15 text-chart-3" },
  EXTERNAL: { icon: Package, classes: "bg-muted text-muted-foreground" },
};

export interface MarketplaceTagProps {
  provider: MarketplaceTagProvider;
  accountLabel: string;
}

/**
 * Ícone do marketplace + tag com o nome da conta — cabeçalho do `OrderCard`
 * e do `ListingCard`. Compartilhado entre os dois módulos (Etapa 5).
 */
export function MarketplaceTag({ provider, accountLabel }: MarketplaceTagProps) {
  const meta = PROVIDER_META[provider];
  const Icon = meta.icon;

  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", meta.classes)}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-medium text-muted-foreground">{accountLabel}</span>
    </span>
  );
}
