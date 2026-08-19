"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { FinancialMovementRecord, MovementCategory, MovementRecurrence } from "../types";

const CATEGORIES: MovementCategory[] = ["Entrada", "Custo Fixo", "Custo Operacional", "Retirada", "Ajuste"];
const RECURRENCES: MovementRecurrence[] = ["ÚNICA", "MENSAL"];

// Entrada é o único tipo com valor positivo por natureza — pras demais
// categorias o valor é sempre lançado (e guardado) como saída (negativo),
// seguindo a convenção do FinancialMovement real.
const SIGNED_POSITIVE: MovementCategory[] = ["Entrada"];

function selectClasses(className?: string) {
  return cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className,
  );
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface MovementDialogProps {
  movement?: FinancialMovementRecord;
  onSave: (movement: FinancialMovementRecord) => void;
  trigger?: ReactNode;
}

/** Cria OU edita — mesmo diálogo, decide pelo `movement` recebido (padrão do EditPriceDialog). */
export function MovementDialog({ movement, onSave, trigger }: MovementDialogProps) {
  const isEdit = !!movement;
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(movement?.description ?? "");
  const [category, setCategory] = useState<MovementCategory>(movement?.category ?? "Custo Operacional");
  const [amount, setAmount] = useState(movement ? String(Math.abs(movement.amount)).replace(".", ",") : "");
  const [date, setDate] = useState(toDateInputValue(movement?.date ?? new Date()));
  const [recurrence, setRecurrence] = useState<MovementRecurrence>(movement?.recurrence ?? "ÚNICA");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDescription(movement?.description ?? "");
    setCategory(movement?.category ?? "Custo Operacional");
    setAmount(movement ? String(Math.abs(movement.amount)).replace(".", ",") : "");
    setDate(toDateInputValue(movement?.date ?? new Date()));
    setRecurrence(movement?.recurrence ?? "ÚNICA");
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Number(amount.replace(",", "."));
    if (!description.trim()) {
      setError("Descrição é obrigatória.");
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Informe um valor válido.");
      return;
    }

    const signedAmount = SIGNED_POSITIVE.includes(category) ? parsed : -parsed;
    onSave({
      id: movement?.id ?? `mov_${Date.now()}`,
      description: description.trim(),
      category,
      amount: signedAmount,
      date: new Date(`${date}T12:00:00`),
      recurrence,
    });
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          isEdit ? (
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar lançamento">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Novo lançamento
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
          <DialogDescription>Lançamento manual de movimentação financeira.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mov-description">Descrição</Label>
            <Input id="mov-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Aluguel do galpão" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mov-category">Categoria</Label>
              <select id="mov-category" className={selectClasses()} value={category} onChange={(e) => setCategory(e.target.value as MovementCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mov-amount">Valor (R$)</Label>
              <Input id="mov-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mov-date">Data</Label>
              <Input id="mov-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mov-recurrence">Recorrência</Label>
              <select id="mov-recurrence" className={selectClasses()} value={recurrence} onChange={(e) => setRecurrence(e.target.value as MovementRecurrence)}>
                {RECURRENCES.map((r) => (
                  <option key={r} value={r}>{r === "ÚNICA" ? "Única" : "Mensal"}</option>
                ))}
              </select>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{isEdit ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
