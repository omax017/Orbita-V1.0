"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import { MOCK_ORDER_PACKAGES, MOCK_PLANS } from "./mock-data";
import type { BillingCycle, OrderPackage } from "./types";
import { SectionCard } from "./components/section-card";
import { PlanCard } from "./components/plan-card";
import { BuyPackageDialog } from "./components/buy-package-dialog";

const CURRENT_PLAN_ID = "pro";

export function PlanosContent() {
  const [cycle, setCycle] = useState<BillingCycle>("MONTHLY");
  const [selectedPackage, setSelectedPackage] = useState<OrderPackage | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title="Seu plano"
        description="Mude de plano a qualquer momento — a cobrança é ajustada proporcionalmente."
        action={
          <div className="inline-flex rounded-lg bg-muted p-1 text-sm">
            {(["MONTHLY", "ANNUAL"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-colors",
                  cycle === c ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c === "MONTHLY" ? "Mensal" : "Anual (–17%)"}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MOCK_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} isCurrent={plan.id === CURRENT_PLAN_ID} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Pacotes extras de pedidos" description="Precisa de mais pedidos neste mês sem trocar de plano? Compre avulso.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MOCK_ORDER_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="flex flex-col items-start gap-1 rounded-xl border border-border p-4">
              <p className="text-lg font-semibold text-foreground">+{formatNumber(pkg.extraOrders)} pedidos</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(pkg.price)} · cobrado na próxima fatura</p>
              <button
                type="button"
                onClick={() => setSelectedPackage(pkg)}
                className="mt-3 w-full rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Comprar
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <BuyPackageDialog pkg={selectedPackage} onClose={() => setSelectedPackage(null)} />
    </div>
  );
}
