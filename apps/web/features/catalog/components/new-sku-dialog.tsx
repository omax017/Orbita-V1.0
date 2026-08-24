"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MockListing } from "@/features/listings/types";
import type { MockSku } from "../types";

export interface NewSkuDialogProps {
  listings: MockListing[];
  existingCodes: string[];
  /** Assíncrono desde a Etapa 21 (cria de verdade via `POST /catalog/skus`)
   * — pode rejeitar (código duplicado, rede etc.); o diálogo só fecha se
   * resolver, e mostra `error.message` se rejeitar. */
  onCreate: (sku: Pick<MockSku, "code" | "name" | "costAmount" | "packagingCostAmount" | "stockLocal" | "stockFull">, linkedListingIds: string[]) => Promise<void>;
}

/** "Novo SKU" — cadastro completo, incluindo o vínculo N:N com anúncios (ListingSku). */
export function NewSkuDialog({ listings, existingCodes, onCreate }: NewSkuDialogProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [packagingCostAmount, setPackagingCostAmount] = useState("");
  const [stockLocal, setStockLocal] = useState("");
  const [stockFull, setStockFull] = useState("");
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setCode("");
    setName("");
    setCostAmount("");
    setPackagingCostAmount("");
    setStockLocal("");
    setStockFull("");
    setLinkedIds(new Set());
    setError(null);
  }

  function toggleListing(id: string, checked: boolean) {
    setLinkedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode || !name.trim()) {
      setError("Código e nome são obrigatórios.");
      return;
    }
    if (existingCodes.includes(trimmedCode)) {
      setError(`Já existe um SKU com o código "${trimmedCode}".`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onCreate(
        {
          code: trimmedCode,
          name: name.trim(),
          costAmount: Number(costAmount.replace(",", ".")) || 0,
          packagingCostAmount: Number(packagingCostAmount.replace(",", ".")) || 0,
          stockLocal: Number(stockLocal) || 0,
          stockFull: Number(stockFull) || 0,
        },
        Array.from(linkedIds),
      );
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível cadastrar o SKU.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo SKU
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo SKU</DialogTitle>
          <DialogDescription>
            Cadastre o produto e, se quiser, já vincule aos anúncios correspondentes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku-code">Código (SKU)</Label>
              <Input id="sku-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="EX-001" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku-name">Nome do produto</Label>
              <Input id="sku-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do produto" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku-cost">Custo unitário (R$)</Label>
              <Input id="sku-cost" inputMode="decimal" value={costAmount} onChange={(e) => setCostAmount(e.target.value)} placeholder="0,00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku-packaging">Custo de embalagem (R$)</Label>
              <Input id="sku-packaging" inputMode="decimal" value={packagingCostAmount} onChange={(e) => setPackagingCostAmount(e.target.value)} placeholder="0,00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku-stock-local">Estoque local</Label>
              <Input id="sku-stock-local" inputMode="numeric" value={stockLocal} onChange={(e) => setStockLocal(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku-stock-full">Estoque Full</Label>
              <Input id="sku-stock-full" inputMode="numeric" value={stockFull} onChange={(e) => setStockFull(e.target.value)} placeholder="0" />
            </div>
          </div>

          {listings.length > 0 ? (
            <div className="space-y-1.5">
              <Label>Vincular a anúncios (opcional)</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {listings.map((listing) => (
                  <label key={listing.id} className="flex items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-accent">
                    <Checkbox
                      checked={linkedIds.has(listing.id)}
                      onCheckedChange={(v) => toggleListing(listing.id, !!v)}
                    />
                    <span className="truncate text-foreground">{listing.title}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Cadastrando…" : "Cadastrar SKU"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
