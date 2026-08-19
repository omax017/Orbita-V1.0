"use client";

import { useState } from "react";
import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_CONNECTED_ACCOUNTS } from "./mock-data";
import { SectionCard } from "./components/section-card";
import { ConnectedAccountCard } from "./components/connected-account-card";
import { ConnectAccountDialog } from "./components/connect-account-dialog";

export function IntegracoesContent() {
  const [accounts, setAccounts] = useState(MOCK_CONNECTED_ACCOUNTS);

  function handleSync(id: string) {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "SYNCING" } : a)));
    setTimeout(() => {
      setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "CONNECTED", connectedAt: a.connectedAt } : a)));
    }, 1200);
  }

  function handleDisconnect(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Contas de marketplace conectadas" action={<ConnectAccountDialog />}>
        {accounts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma conta conectada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {accounts.map((account) => (
              <ConnectedAccountCard key={account.id} account={account} onSync={handleSync} onDisconnect={handleDisconnect} />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Integração com ERP" description="Sincronize pedidos e estoque direto com o seu sistema de gestão.">
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Boxes className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Nenhum ERP conectado</p>
              <p className="text-xs text-muted-foreground">Bling, Tiny, Omie e outros — em breve.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>Em breve</Button>
        </div>
      </SectionCard>
    </div>
  );
}
