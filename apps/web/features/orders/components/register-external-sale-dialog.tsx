"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
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
import { MOCK_SKUS } from "../mock-data";
import type { MockOrder } from "../types";

export interface RegisterExternalSaleDialogProps {
  onCreate: (order: MockOrder) => void;
}

/**
 * "Registrar venda externa" — pedido feito fora de Mercado Livre/Shopee
 * (WhatsApp, feira, indicação...). Cria o pedido só no estado local
 * (client-side); persistência real é lógica de página futura.
 */
export function RegisterExternalSaleDialog({ onCreate }: RegisterExternalSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [skuId, setSkuId] = useState<string>(MOCK_SKUS[0].id);
  const [price, setPrice] = useState("");
  const [buyerName, setBuyerName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const sku = MOCK_SKUS.find((s) => s.id === skuId) ?? MOCK_SKUS[0];
    const totalAmount = Number(price.replace(",", ".")) || sku.costAmount * 2;

    const order: MockOrder = {
      id: `ord_ext_${Date.now()}`,
      externalId: `EXT-${Math.floor(Math.random() * 900000 + 100000)}`,
      provider: "EXTERNAL",
      accountLabel: "Venda externa",
      channel: "Externo",
      status: "DELIVERED",
      shippingStage: "DELIVERED",
      shippingType: "Combinado com o comprador",
      totalAmount,
      feeAmount: 0,
      shippingCost: 0,
      taxAmount: 0,
      costAmount: sku.costAmount,
      items: [
        {
          id: `item_ext_${Date.now()}`,
          title: sku.name,
          skuCode: sku.code,
          fromCatalog: true,
          quantity: 1,
          unitPrice: totalAmount,
          thumbnailColor: "bg-chart-2/20",
        },
      ],
      orderedAt: new Date(),
      paymentMethod: "Dinheiro",
      payoutForecast: new Date(),
      buyerName: buyerName.trim() || "Cliente direto",
      address: "Registrado manualmente",
    };

    onCreate(order);
    setOpen(false);
    setPrice("");
    setBuyerName("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Registrar venda externa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar venda externa</DialogTitle>
          <DialogDescription>
            Para vendas feitas fora de Mercado Livre/Shopee (WhatsApp, feira, indicação…).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ext-sku">Produto</Label>
            <select
              id="ext-sku"
              value={skuId}
              onChange={(e) => setSkuId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {MOCK_SKUS.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ext-price">Valor da venda (R$)</Label>
            <Input
              id="ext-price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ext-buyer">Comprador (opcional)</Label>
            <Input
              id="ext-buyer"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Registrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
