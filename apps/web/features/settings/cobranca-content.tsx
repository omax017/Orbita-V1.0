"use client";

import { useState } from "react";
import { CreditCard, Receipt } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { MOCK_INVOICES, MOCK_PAYMENT_METHOD } from "./mock-data";
import type { PaymentMethod } from "./types";
import { SectionCard } from "./components/section-card";
import { ChangeCardDialog } from "./components/change-card-dialog";
import { invoiceTableColumns } from "./components/invoice-table-columns";

export function CobrancaContent() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(MOCK_PAYMENT_METHOD);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Método de pagamento" action={<ChangeCardDialog onSave={setPaymentMethod} />}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-14 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {paymentMethod.brand} •••• {paymentMethod.lastDigits}
            </p>
            <p className="text-xs text-muted-foreground">
              {paymentMethod.holderName} · válido até {paymentMethod.expiresAt}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Histórico de faturas">
        <DataTable
          columns={invoiceTableColumns}
          data={MOCK_INVOICES}
          exportFilename="faturas"
          emptyState={{ icon: Receipt, title: "Nenhuma fatura emitida ainda" }}
        />
      </SectionCard>
    </div>
  );
}
