"use client";

import { useState } from "react";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { buildPeriod } from "./period-utils";
import type { PeriodPreset, PeriodSelection } from "./types";

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
];

function toInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface PeriodSelectorProps {
  value: PeriodSelection;
  onChange: (period: PeriodSelection) => void;
}

/**
 * Filtro de período — presets como linhas (marcadas com check quando
 * selecionadas) + intervalo customizado atrás de uma linha no rodapé, dois
 * `<input type="date">` nativos (sem calendário próprio ainda; suficiente
 * pra essa etapa). Escopa tudo abaixo dele na página — ver `AccountSelector`.
 */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(toInputValue(value.from));
  const [customTo, setCustomTo] = useState(toInputValue(value.to));

  function selectPreset(preset: PeriodPreset) {
    onChange(buildPeriod(preset));
    setOpen(false);
  }

  function applyCustom() {
    onChange(buildPeriod("custom", new Date(customFrom), new Date(customTo)));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {value.label}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-0.5">
          {PRESETS.map((preset) => {
            const active = value.preset === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => selectPreset(preset.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  active && "font-medium text-foreground",
                )}
              >
                {preset.label}
                {active ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
            );
          })}
        </div>

        <div className="mt-2 space-y-2 border-t border-border pt-3">
          <p className="px-0.5 text-xs font-medium text-muted-foreground">Personalizado</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="period-from" className="text-xs font-normal text-muted-foreground">
                De
              </Label>
              <Input
                id="period-from"
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="period-to" className="text-xs font-normal text-muted-foreground">
                Até
              </Label>
              <Input
                id="period-to"
                type="date"
                value={customTo}
                min={customFrom}
                max={toInputValue(new Date())}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <Button size="sm" className="w-full" onClick={applyCustom}>
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
