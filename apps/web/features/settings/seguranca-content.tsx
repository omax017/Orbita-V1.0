"use client";

import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MOCK_ACTIVE_SESSIONS } from "./mock-data";
import { SectionCard } from "./components/section-card";

const RELATIVE = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Sem endpoint real de troca de senha/2FA ainda (backend só tem
 * register/login/refresh/logout/me) — UI completa e validada localmente,
 * "salvar" mostra confirmação mock. Sessões ativas são mockadas. */
export function SegurancaContent() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState(MOCK_ACTIVE_SESSIONS);

  function handleChangePassword() {
    setError(null);
    if (newPassword.length < 8) {
      setError("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSaved(false), 2500);
  }

  function handleEndSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Trocar senha" description="Use uma senha forte, com pelo menos 8 caracteres.">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex items-center gap-3">
            <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword || !confirmPassword}>
              Atualizar senha
            </Button>
            {saved ? <span className="text-sm text-success">Senha atualizada.</span> : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Verificação em duas etapas (2FA)" description="Adiciona uma camada extra de segurança no login.">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{twoFactorEnabled ? "2FA ativado" : "2FA desativado"}</p>
              <p className="text-xs text-muted-foreground">Código gerado por app autenticador (Google Authenticator, Authy).</p>
            </div>
          </div>
          <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
        </div>
        {twoFactorEnabled ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Escaneie o QR code no seu app autenticador e guarde a chave de recuperação{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">HBW-7F2K-9QRT-3XZL</code> em lugar seguro.
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Sessões ativas" description="Dispositivos com sua conta conectada agora.">
        <div className="flex flex-col divide-y divide-border">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {session.device}
                  {session.isCurrent ? <Badge variant="success">Sessão atual</Badge> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.location} · {session.ipAddress} · último acesso {RELATIVE.format(session.lastActiveAt)}
                </p>
              </div>
              {!session.isCurrent ? (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleEndSession(session.id)}>
                  <LogOut className="h-3.5 w-3.5" />
                  Encerrar
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
