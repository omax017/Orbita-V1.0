"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface CompareByDatePopoverProps {
  active: boolean;
  compareLabel: string | null;
  onApply: (date: string) => void;
  onClear: () => void;
}

/**
 * "Comparar por data" — como não existe histórico real de estoque ainda
 * (isso viria de snapshots diários, lógica de página futura), aplicar uma
 * data aqui só liga um modo visual que mostra deltas mockados ao lado dos
 * KPIs, pra já validar a interação.
 */
export function CompareByDatePopover({ active, compareLabel, onApply, onClear }: CompareByDatePopoverProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={active ? "default" : "outline"} size="sm" className="gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" />
          {active ? `Comparando com ${compareLabel}` : "Comparar por data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Label htmlFor="compare-date" className="text-xs">
          Comparar estoque atual com
        </Label>
        <Input
          id="compare-date"
          type="date"
          className="mt-1.5 h-9"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="mt-3 flex justify-end gap-2">
          {active ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              Limpar
            </Button>
          ) : null}
          <Button
            size="sm"
            disabled={!date}
            onClick={() => {
              onApply(date);
              setOpen(false);
            }}
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
