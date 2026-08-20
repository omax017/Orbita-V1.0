"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { computeProfitCalculator, suggestPriceForTargetMargin } from "../tools";

const inputClasses = "text-sm";

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        {prefix ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span> : null}
        <Input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className={cn(inputClasses, prefix ? "pl-9" : "", suffix ? "pr-9" : "")}
        />
        {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

const DEFAULTS = {
  sellPrice: 89.9,
  productCost: 25,
  packagingCost: 3,
  shippingCost: 0,
  feePercent: 12,
  taxPercent: 6,
  adsPercent: 5,
};

/** "Calculadora de lucro inteligente" — simula a margem de um produto antes
 * de comprar/importar, e sugere o preço mínimo pra bater uma margem-alvo.
 * Percentuais padrão (comissão 12%, imposto 6%) seguem a mesma referência
 * usada no resto do produto (Financeiro, Pontuação de Oportunidade). */
export function ProfitCalculatorCard() {
  const [values, setValues] = useState(DEFAULTS);
  const [targetMargin, setTargetMargin] = useState(30);

  function set<K extends keyof typeof DEFAULTS>(key: K, v: number) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  const result = useMemo(() => computeProfitCalculator(values), [values]);
  const suggestedPrice = useMemo(
    () => suggestPriceForTargetMargin(values, targetMargin),
    [values, targetMargin],
  );

  const marginTone =
    result.netMarginPercent >= 30 ? "text-success" : result.netMarginPercent >= 10 ? "text-warning" : "text-destructive";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Calculadora de lucro inteligente</h2>
          <p className="text-xs text-muted-foreground">Simule a margem antes de comprar/importar o produto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Preço de venda" prefix="R$" value={values.sellPrice} onChange={(v) => set("sellPrice", v)} />
        <NumberField label="Custo do produto" prefix="R$" value={values.productCost} onChange={(v) => set("productCost", v)} />
        <NumberField label="Embalagem" prefix="R$" value={values.packagingCost} onChange={(v) => set("packagingCost", v)} />
        <NumberField label="Frete pago pelo vendedor" prefix="R$" value={values.shippingCost} onChange={(v) => set("shippingCost", v)} />
        <NumberField label="Comissão do marketplace" suffix="%" value={values.feePercent} onChange={(v) => set("feePercent", v)} />
        <NumberField label="Imposto" suffix="%" value={values.taxPercent} onChange={(v) => set("taxPercent", v)} />
        <NumberField label="Anúncios (Ads)" suffix="%" value={values.adsPercent} onChange={(v) => set("adsPercent", v)} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Custos totais</p>
          <p className="mt-0.5 font-display text-lg font-semibold text-foreground">{formatCurrency(result.totalCosts)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Lucro líquido / unidade</p>
          <p className={cn("mt-0.5 font-display text-lg font-semibold", marginTone)}>{formatCurrency(result.netProfit)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Margem líquida</p>
          <p className={cn("mt-0.5 font-display text-lg font-semibold", marginTone)}>{formatPercent(result.netMarginPercent)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <label className="text-xs font-medium text-muted-foreground">Preço mínimo pra bater</label>
        <Input
          type="number"
          min={0}
          max={95}
          step="1"
          value={targetMargin}
          onChange={(e) => setTargetMargin(Math.max(0, Number(e.target.value)))}
          className="h-8 w-20 text-sm"
        />
        <span className="text-xs text-muted-foreground">% de margem:</span>
        <span className="font-display text-base font-semibold text-foreground">
          {suggestedPrice !== null ? formatCurrency(suggestedPrice) : "Impossível com esses custos"}
        </span>
      </div>
    </div>
  );
}
