"use client";

import { ProfitCalculatorCard } from "./components/profit-calculator-card";
import { EanGeneratorCard } from "./components/ean-generator-card";

export function FerramentasContent() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ferramentas</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Utilitários rápidos pra decidir e cadastrar produtos</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProfitCalculatorCard />
        <EanGeneratorCard />
      </div>
    </div>
  );
}
