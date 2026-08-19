"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { OrderPackage } from "../types";

export function BuyPackageDialog({ pkg, onClose }: { pkg: OrderPackage | null; onClose: () => void }) {
  const [bought, setBought] = useState(false);

  return (
    <Dialog open={!!pkg} onOpenChange={(open) => { if (!open) { onClose(); setBought(false); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Comprar pacote extra</DialogTitle>
          <DialogDescription>
            {pkg ? `+${formatNumber(pkg.extraOrders)} pedidos por ${formatCurrency(pkg.price)}, cobrados na próxima fatura.` : ""}
          </DialogDescription>
        </DialogHeader>

        {bought ? (
          <p className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Pacote adicionado — o limite já está atualizado.
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { onClose(); setBought(false); }}>Fechar</Button>
          {!bought ? <Button type="button" onClick={() => setBought(true)}>Confirmar compra</Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
