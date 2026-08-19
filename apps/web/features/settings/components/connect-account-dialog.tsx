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
  { id: "MERCADO_LIVRE" as const, label: "Mercado Livre", icon: Store, implemented: true },
  { id: "SHOPEE" as const, label: "Shopee", icon: ShoppingBag, implemented: false },
];

/** "Continuar" leva pra uma navegação de página inteira (não um fetch) —
 * é assim que o fluxo OAuth funciona: o browser precisa ir de verdade pro
 * Mercado Livre pedir autorização, não dá pra fazer isso via XHR. Por isso
 * `workspaceId` vai como query param (`?workspaceId=`), não como header
 * `X-Workspace-Id` (que uma navegação normal não consegue anexar) — ver
 * `WorkspaceGuard` no backend, que aceita os dois caminhos. */
export function ConnectAccountDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<(typeof PROVIDERS)[number]["id"] | null>(null);

  function handleContinue() {
    if (selected !== "MERCADO_LIVRE") return;
    window.location.href = `/api/v1/integrations/mercado-livre/connect?workspaceId=${encodeURIComponent(workspaceId)}`;
  }

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
                disabled={!p.implemented}
                onClick={() => setSelected(p.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  selected === p.id ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:enabled:bg-accent",
                )}
              >
                <Icon className="h-6 w-6" />
                {p.label}
                {!p.implemented ? <span className="text-xs text-muted-foreground">Em breve</span> : null}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="button" disabled={!selected} onClick={handleContinue}>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
