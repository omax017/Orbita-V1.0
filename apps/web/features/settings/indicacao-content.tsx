"use client";

import { useState } from "react";
import { Check, Copy, Gift, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard } from "@/components/ui/kpi-card";
import { formatCurrency } from "@/lib/format";
import { MOCK_REFERRALS } from "./mock-data";
import { SectionCard } from "./components/section-card";

const REFERRAL_LINK = "https://hubwin.app/r/loja-da-maria";
const RELATIVE = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function IndicacaoContent() {
  const [copied, setCopied] = useState(false);

  const converted = MOCK_REFERRALS.filter((r) => r.status === "CONVERTED");
  const totalReward = converted.reduce((s, r) => s + r.rewardAmount, 0);

  function handleCopy() {
    // `?.` só protege a chamada de `writeText` — encadear `.catch()` fora
    // dela quebra (TypeError síncrono) quando `navigator.clipboard` não
    // existe (contexto não-seguro/browser de teste), derrubando o handler
    // antes de `setCopied(true)` rodar. `?.catch()` protege os dois passos.
    navigator.clipboard?.writeText(REFERRAL_LINK)?.catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Seu link de indicação" description="Cada loja que assinar um plano pago pelo seu link vira crédito na sua fatura.">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input value={REFERRAL_LINK} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard icon={Users2} label="Indicados" value={String(MOCK_REFERRALS.length)} />
            <KpiCard icon={Gift} label="Convertidos" value={String(converted.length)} />
            <KpiCard icon={Gift} label="Crédito ganho" value={formatCurrency(totalReward)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Indicados">
        <div className="flex flex-col divide-y divide-border">
          {MOCK_REFERRALS.map((referral) => (
            <div key={referral.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-foreground">{referral.name}</p>
                <p className="text-xs text-muted-foreground">
                  {referral.email} · indicado em {RELATIVE.format(referral.invitedAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {referral.status === "CONVERTED" ? (
                  <span className="text-xs text-muted-foreground">{formatCurrency(referral.rewardAmount)}</span>
                ) : null}
                <Badge variant={referral.status === "CONVERTED" ? "success" : "warning"}>
                  {referral.status === "CONVERTED" ? "Convertido" : "Pendente"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
