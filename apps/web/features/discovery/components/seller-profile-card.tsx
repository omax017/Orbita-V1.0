import { Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { SellerProfile } from "../types";

const REPUTATION_CLASSES: Record<string, string> = {
  Excelente: "bg-success/10 text-success",
  Boa: "bg-primary/10 text-primary",
  Regular: "bg-warning/10 text-warning",
  Nova: "bg-muted text-muted-foreground",
};

export function SellerProfileCard({ seller }: { seller: SellerProfile }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{seller.name}</p>
          <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium", REPUTATION_CLASSES[seller.reputation])}>
            {seller.reputation}
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-semibold text-foreground">{seller.memberSinceYears}</p>
          <p className="text-xs text-muted-foreground">anos na plataforma</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{formatNumber(seller.totalListings)}</p>
          <p className="text-xs text-muted-foreground">anúncios ativos</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{formatNumber(seller.totalSales)}</p>
          <p className="text-xs text-muted-foreground">vendas totais</p>
        </div>
      </div>
    </div>
  );
}
