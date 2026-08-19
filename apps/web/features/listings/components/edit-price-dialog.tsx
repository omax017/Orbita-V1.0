"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Pencil } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

export interface EditPriceDialogProps {
  listingTitle: string;
  currentPrice: number;
  onSave: (price: number) => void;
  trigger?: ReactNode;
}

/** "Editar preço" — atualiza o preço do anúncio só no estado local (demo client-side). */
export function EditPriceDialog({ listingTitle, currentPrice, onSave, trigger }: EditPriceDialogProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(currentPrice).replace(".", ","));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(value.replace(",", "."));
    if (!Number.isNaN(parsed) && parsed > 0) {
      onSave(parsed);
      setOpen(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setValue(String(currentPrice).replace(".", ","));
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar preço">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar preço</DialogTitle>
          <DialogDescription className="truncate">{listingTitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-price">Novo preço (R$)</Label>
            <Input
              id="new-price"
              inputMode="decimal"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Preço atual: {formatCurrency(currentPrice)}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
