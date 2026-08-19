"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Boxes, CheckCircle2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import type { ConnectedAccount } from "./types";
import { SectionCard } from "./components/section-card";
import { ConnectedAccountCard } from "./components/connected-account-card";
import { ConnectAccountDialog } from "./components/connect-account-dialog";

const ERROR_MESSAGES: Record<string, string> = {
  not_configured: "O Mercado Livre ainda não está configurado no servidor (faltam as credenciais do app).",
  missing_params: "A autorização voltou incompleta do Mercado Livre. Tente conectar de novo.",
  callback_failed: "Não foi possível concluir a conexão com o Mercado Livre. Tente de novo em alguns minutos.",
};

export function IntegracoesContent({ workspaceId }: { workspaceId: string }) {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const connectedNotice = searchParams.get("integration_connected");
  const errorCode = searchParams.get("integration_error");

  async function loadAccounts() {
    setLoading(true);
    try {
      const data = await apiFetch<ConnectedAccount[]>("/integrations/accounts", { workspaceId });
      setAccounts(data.filter((a) => a.status !== "DISCONNECTED"));
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSync(id: string) {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "SYNCING" } : a)));
    try {
      await apiFetch(`/integrations/accounts/${id}/sync`, { method: "POST", workspaceId });
    } finally {
      // O sync roda em background (fila) — não sabemos exatamente quando
      // termina daqui, então recarrega a lista depois de um tempo pra
      // pegar o `lastSyncedAt`/status atualizados.
      setTimeout(loadAccounts, 4000);
    }
  }

  async function handleDisconnect(id: string) {
    await apiFetch(`/integrations/accounts/${id}`, { method: "DELETE", workspaceId });
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {connectedNotice ? (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Conta do Mercado Livre conectada com sucesso.
        </div>
      ) : null}
      {errorCode ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {ERROR_MESSAGES[errorCode] ?? "Não foi possível conectar a conta."}
        </div>
      ) : null}

      <SectionCard title="Contas de marketplace conectadas" action={<ConnectAccountDialog workspaceId={workspaceId} />}>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Carregando…</p>
        ) : accounts.length === 0 ? (
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
