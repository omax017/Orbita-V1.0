"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "./components/section-card";

export interface PerfilContentProps {
  user: { name: string; email: string; avatarUrl: string | null };
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

/** Nome/telefone/avatar editáveis só localmente nesta etapa — não há
 * endpoint `PATCH /auth/me` ainda no backend (Etapa 2 só tem register/login/
 * refresh/logout/me). E-mail vem da sessão real e não é editável. */
export function PerfilContent({ user }: PerfilContentProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Dados pessoais" description="Essas informações aparecem no seu perfil e nos e-mails da equipe.">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg">{initialsOf(user.name)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              Trocar foto
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Nome</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input id="profile-email" value={user.email} disabled className="disabled:opacity-70" />
              <p className="text-xs text-muted-foreground">O e-mail de acesso não pode ser alterado.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Telefone</Label>
              <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave}>Salvar alterações</Button>
            {saved ? <span className="text-sm text-success">Salvo com sucesso.</span> : null}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
