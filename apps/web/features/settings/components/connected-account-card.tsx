import { Pencil, RefreshCw, Unplug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketplaceTag } from "@/components/marketplace-tag";
import { formatNumber } from "@/lib/format";
import type { ConnectedAccount } from "../types";

const STATUS_META: Record<ConnectedAccount["status"], { label: string; variant: "success" | "warning" | "destructive" }> = {
  CONNECTED: { label: "Conectada", variant: "success" },
  SYNCING: { label: "Sincronizando", variant: "warning" },
  ERROR: { label: "Erro na sincronização", variant: "destructive" },
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function ConnectedAccountCard({
  account,
  onSync,
  onDisconnect,
}: {
  account: ConnectedAccount;
  onSync: (id: string) => void;
  onDisconnect: (id: string) => void;
}) {
  const status = STATUS_META[account.status];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">{account.accountName}</p>
            <MarketplaceTag provider={account.provider} accountLabel={account.provider === "MERCADO_LIVRE" ? "Mercado Livre" : "Shopee"} />
          </div>
          <p className="text-xs text-muted-foreground">
            ID {account.externalId} · conectada em {DATE_FORMAT.format(account.connectedAt)}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="font-semibold text-foreground">{formatNumber(account.sales30d)}</p>
          <p className="text-xs text-muted-foreground">vendas (30d)</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">{formatNumber(account.listingsCount)}</p>
          <p className="text-xs text-muted-foreground">anúncios ativos</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onSync(account.id)}>
          <RefreshCw className="h-3.5 w-3.5" />
          Sincronizar
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto gap-1.5 text-destructive hover:text-destructive" onClick={() => onDisconnect(account.id)}>
          <Unplug className="h-3.5 w-3.5" />
          Desconectar
        </Button>
      </div>
    </div>
  );
}
