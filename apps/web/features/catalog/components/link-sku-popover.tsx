"use client";

import { useState } from "react";
import { Link2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency } from "@/lib/format";
import { MOCK_SKUS } from "../mock-data";
import type { MockSku } from "../types";

export interface LinkSkuPopoverProps {
  itemTitle: string;
  onLink: (sku: MockSku) => void;
  triggerLabel?: string;
  /** Catálogo pra buscar — `MOCK_SKUS` por padrão (Pedidos e Anúncios ainda
   * não estão ligados ao backend real). O Estoque (já real, Etapa 21) passa
   * o catálogo de verdade do workspace aqui. */
  skus?: MockSku[];
}

/**
 * Botão "Vincular" — busca no catálogo de SKUs e liga um item (pedido ou
 * anúncio) a um produto cadastrado. Client-side only (atualiza o registro em
 * memória); a persistência real é lógica de página futura (módulo Estoque).
 * Compartilhado entre Pedidos e Anúncios — mesma ação, mesmo catálogo.
 */
export function LinkSkuPopover({ itemTitle, onLink, triggerLabel = "Vincular", skus = MOCK_SKUS }: LinkSkuPopoverProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = skus.filter((sku) =>
    sku.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-warning/40 text-warning">
          <Link2 className="h-3.5 w-3.5" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Vincular SKU a &ldquo;{itemTitle}&rdquo;
        </p>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto…"
            className="h-8 pl-8 text-xs"
            autoFocus
          />
        </div>
        <div className="mt-2 max-h-52 space-y-0.5 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-1 py-3 text-center text-xs text-muted-foreground">
              Nenhum produto encontrado.
            </p>
          ) : (
            results.map((sku) => (
              <button
                key={sku.id}
                type="button"
                onClick={() => {
                  onLink(sku);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
              >
                <span>
                  <span className="block font-medium text-foreground">{sku.name}</span>
                  <span className="text-muted-foreground">{sku.code}</span>
                </span>
                <span className="shrink-0 text-muted-foreground">{formatCurrency(sku.costAmount)}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
