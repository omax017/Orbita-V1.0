import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { BillingCycle, PlanTier } from "../types";

export function PlanCard({
  plan,
  cycle,
  isCurrent,
}: {
  plan: PlanTier;
  cycle: BillingCycle;
  isCurrent: boolean;
}) {
  const price = cycle === "MONTHLY" ? plan.monthlyPrice : plan.annualPrice / 12;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-5",
        plan.highlighted ? "border-primary shadow-md" : "border-border",
      )}
    >
      {plan.highlighted ? (
        <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
          <Star className="h-3 w-3" />
          Mais popular
        </span>
      ) : null}

      <p className="text-sm font-semibold text-foreground">{plan.name}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        {formatCurrency(price)}
        <span className="text-sm font-normal text-muted-foreground">/mês</span>
      </p>
      {cycle === "ANNUAL" ? (
        <p className="text-xs text-muted-foreground">{formatCurrency(plan.annualPrice)} cobrados anualmente</p>
      ) : null}

      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
        <p>Até {formatNumber(plan.orderLimit)} pedidos/mês</p>
        <p>Até {plan.integrationLimit} {plan.integrationLimit === 1 ? "integração" : "integrações"}</p>
      </div>

      <ul className="mt-4 flex-1 space-y-2 text-sm text-foreground">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            {feature}
          </li>
        ))}
      </ul>

      <Button className="mt-5" variant={isCurrent ? "outline" : plan.highlighted ? "default" : "secondary"} disabled={isCurrent}>
        {isCurrent ? "Plano atual" : "Assinar"}
      </Button>
    </div>
  );
}
