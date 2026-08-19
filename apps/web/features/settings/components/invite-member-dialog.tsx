"use client";

import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { WorkspaceMember, WorkspaceRole } from "../types";

const ROLES: { value: WorkspaceRole; label: string; description: string }[] = [
  { value: "ADMIN", label: "Admin", description: "Gerencia tudo, exceto cobrança" },
  { value: "MEMBER", label: "Membro", description: "Acesso operacional completo" },
  { value: "VIEWER", label: "Visualizador", description: "Só leitura" },
];

export function InviteMemberDialog({ onInvite }: { onInvite: (member: WorkspaceMember) => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("MEMBER");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    onInvite({
      id: `mem_${Date.now()}`,
      name: "Convite pendente",
      email: email.trim(),
      avatarUrl: null,
      role,
      joinedAt: new Date(),
      status: "PENDING_INVITE",
    });
    setOpen(false);
    setEmail("");
    setRole("MEMBER");
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Convidar membro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>Enviamos um e-mail com o link de convite.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">E-mail</Label>
            <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pessoa@empresa.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Papel</Label>
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors",
                    role === r.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent",
                  )}
                >
                  <span className="text-sm font-medium text-foreground">{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.description}</span>
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Enviar convite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
