"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface FilterPanelProps {
  children: React.ReactNode;
  /** Quantidade de filtros ativos — aparece como badge no gatilho. */
  activeCount?: number;
  defaultOpen?: boolean;
  onClear?: () => void;
  className?: string;
}

/**
 * Painel "Filtros avançados" colapsável — usado no topo de tabelas densas
 * (Pedidos, Anúncios, Movimentações...) para não ocupar espaço permanente
 * na tela com filtros que a maioria das visitas não usa.
 */
export function FilterPanel({
  children,
  activeCount = 0,
  defaultOpen = false,
  onClear,
  className,
}: FilterPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros avançados
            {activeCount > 0 ? (
              <Badge variant="default" className="h-5 px-1.5">
                {activeCount}
              </Badge>
            ) : null}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            />
          </Button>
        </CollapsibleTrigger>
        {activeCount > 0 && onClear ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Limpar filtros
          </Button>
        ) : null}
      </div>
      <CollapsibleContent className="mt-3 overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div className="rounded-lg border border-border bg-card p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
