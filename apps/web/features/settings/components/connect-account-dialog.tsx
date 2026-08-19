"use client";

import { useState } from "react";
import { Plug, Store, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { id: "MERCADO_LIVRE" as const, label: "Mercado Livre", icon: Store },
  { id: "SHOPEE" as const, label: "Shopee", icon: ShoppingBag },
];

/** Sem OAuth real ainda — mostra a etapa de escolha do marketplace, que é
 * onde o fluxo real de conexão (redirect OAuth) vai entrar depois. */
export function ConnectAccountDialog() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<(typeof PROVIDERS)[number]["id"] | null>(null);

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSelected(null); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plug className="h-4 w-4" />
          Conectar nova conta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Conectar conta de marketplace</DialogTitle>
          <DialogDescription>Escolha o marketplace — você vai ser redirecionado pra autorizar o acesso.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {PROVIDERS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors",
                  selected === p.id ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-accent",
                )}
              >
                <Icon className="h-6 w-6" />
                {p.label}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="button" disabled={!selected}>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
