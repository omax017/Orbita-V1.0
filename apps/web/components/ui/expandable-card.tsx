"use client";

import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface ExpandableCardProps {
  /** Checkbox de seleção em massa à esquerda do header. Omitir esconde a coluna do checkbox. */
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Linha sempre visível — id, ícone, tags, botões de ação (copiar, re-sincronizar...). */
  header: React.ReactNode;
  /** Bloco sempre visível abaixo do header — valores/preview que resumem o item mesmo fechado. */
  summary: React.ReactNode;
  /** Conteúdo que só aparece expandido. */
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Casca genérica de "card expansível com seleção" — nasceu em Pedidos
 * (`OrderCard`) mas é deliberadamente sem conhecimento de domínio, pra
 * Anúncios (`ListingCard`, etapa futura) reaproveitar a mesma estrutura:
 * checkbox + header + resumo sempre visíveis, corpo detalhado atrás de um
 * toggle. Cada módulo só precisa compor o conteúdo dos slots.
 */
export function ExpandableCard({
  selected,
  onSelectedChange,
  header,
  summary,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
}: ExpandableCardProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      className={cn("rounded-xl border border-border bg-card", className)}
    >
      <div className="flex items-start gap-3 p-4">
        {onSelectedChange ? (
          <Checkbox
            className="mt-1"
            checked={selected}
            onCheckedChange={(v) => onSelectedChange(!!v)}
            aria-label="Selecionar"
          />
        ) : null}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">{header}</div>
          {summary}
        </div>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Expandir"
          >
            <ChevronDown className="h-4 w-4 transition-transform [[data-state=open]_&]:rotate-180" />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="border-t border-border p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
