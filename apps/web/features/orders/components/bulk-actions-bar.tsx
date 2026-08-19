import { Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

export interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
}

/** Aparece quando há pedidos selecionados via checkbox — ações em lote. */
export function BulkActionsBar({ selectedCount, onClear }: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
      <p className="text-sm text-foreground">
        <strong className="font-semibold">{formatNumber(selectedCount)}</strong>{" "}
        {selectedCount === 1 ? "pedido selecionado" : "pedidos selecionados"}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          Vincular SKU em massa
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onClear}>
          <X className="h-3.5 w-3.5" />
          Limpar seleção
        </Button>
      </div>
    </div>
  );
}
