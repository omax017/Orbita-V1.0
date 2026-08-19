"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_MARGIN_SETTINGS } from "./mock-data";
import type { MarginSettings } from "./types";
import { SectionCard } from "./components/section-card";

const MAX_SCALE = 60;

export function MargensContent() {
  const [settings, setSettings] = useState<MarginSettings>(DEFAULT_MARGIN_SETTINGS);
  const [saved, setSaved] = useState(false);

  function setBadUpper(value: number) {
    setSettings((prev) => ({ ...prev, badUpperBound: Math.min(value, prev.goodUpperBound - 1) }));
  }

  function setGoodUpper(value: number) {
    setSettings((prev) => ({ ...prev, goodUpperBound: Math.max(value, prev.badUpperBound + 1) }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const badPercent = (settings.badUpperBound / MAX_SCALE) * 100;
  const goodPercent = (settings.goodUpperBound / MAX_SCALE) * 100;

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title="Faixas de margem"
        description="Define quando uma venda aparece como Ruim, Boa ou Excelente no Dashboard e nas tabelas."
      >
        <div className="flex flex-col gap-6">
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            <div className="h-full bg-destructive" style={{ width: `${badPercent}%` }} />
            <div className="h-full bg-warning" style={{ width: `${goodPercent - badPercent}%` }} />
            <div className="h-full bg-success" style={{ width: `${100 - goodPercent}%` }} />
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="text-foreground">Ruim: até {settings.badUpperBound}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" />
              <span className="text-foreground">Boa: {settings.badUpperBound}%–{settings.goodUpperBound}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <span className="text-foreground">Excelente: acima de {settings.goodUpperBound}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Limite Ruim → Boa ({settings.badUpperBound}%)</label>
            <Slider
              value={[settings.badUpperBound]}
              onValueChange={([v]) => setBadUpper(v!)}
              min={0}
              max={MAX_SCALE}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Limite Boa → Excelente ({settings.goodUpperBound}%)</label>
            <Slider
              value={[settings.goodUpperBound]}
              onValueChange={([v]) => setGoodUpper(v!)}
              min={0}
              max={MAX_SCALE}
              step={1}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>Salvar alterações</Button>
            {saved ? <span className="text-sm text-success">Salvo com sucesso.</span> : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Custo de antecipação/empréstimo"
        description="Se ativado, o desconto de antecipação de recebíveis (ou juros de empréstimo vinculado a vendas) entra no cálculo de lucro líquido."
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-foreground">Considerar no cálculo de lucro</p>
          <Switch
            checked={settings.considerFinancingCost}
            onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, considerFinancingCost: checked }))}
          />
        </div>
      </SectionCard>
    </div>
  );
}
