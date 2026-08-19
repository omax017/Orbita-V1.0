"use client";

import { useState, type FormEvent } from "react";
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
import type { PaymentMethod } from "../types";

export function ChangeCardDialog({ onSave }: { onSave: (method: PaymentMethod) => void }) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const lastDigits = number.replace(/\D/g, "").slice(-4);
    if (lastDigits.length < 4 || !holderName.trim() || !expiresAt.trim()) return;
    onSave({ brand: "Novo cartão", lastDigits, expiresAt, holderName: holderName.trim() });
    setOpen(false);
    setNumber("");
    setHolderName("");
    setExpiresAt("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Trocar cartão</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Trocar cartão</DialogTitle>
          <DialogDescription>Os dados ficam só com o processador de pagamento — mock nesta etapa.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="card-number">Número do cartão</Label>
            <Input id="card-number" inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="0000 0000 0000 0000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-holder">Nome impresso no cartão</Label>
            <Input id="card-holder" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Como está no cartão" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="card-expiry">Validade</Label>
            <Input id="card-expiry" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} placeholder="MM/AA" className="w-24" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar cartão</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
