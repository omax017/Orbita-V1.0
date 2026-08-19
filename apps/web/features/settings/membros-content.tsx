"use client";

import { useState } from "react";
import { ChevronDown, UserX } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_MEMBERS } from "./mock-data";
import type { WorkspaceMember, WorkspaceRole } from "./types";
import { SectionCard } from "./components/section-card";
import { InviteMemberDialog } from "./components/invite-member-dialog";

const ROLE_LABEL: Record<WorkspaceRole, string> = { OWNER: "Dono", ADMIN: "Admin", MEMBER: "Membro", VIEWER: "Visualizador" };
const ASSIGNABLE_ROLES: WorkspaceRole[] = ["ADMIN", "MEMBER", "VIEWER"];
const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function MembrosContent() {
  const [members, setMembers] = useState<WorkspaceMember[]>(MOCK_MEMBERS);

  function handleInvite(member: WorkspaceMember) {
    setMembers((prev) => [...prev, member]);
  }

  function handleRoleChange(id: string, role: WorkspaceRole) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <SectionCard title="Membros do workspace" description={`${members.length} pessoa(s) com acesso`} action={<InviteMemberDialog onInvite={handleInvite} />}>
      <div className="flex flex-col divide-y divide-border">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initialsOf(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
                  {member.name}
                  {member.status === "PENDING_INVITE" ? <Badge variant="warning">Convite pendente</Badge> : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.email} · desde {DATE_FORMAT.format(member.joinedAt)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {member.role === "OWNER" ? (
                <Badge>Dono</Badge>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      {ROLE_LABEL[member.role]}
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {ASSIGNABLE_ROLES.map((role) => (
                      <DropdownMenuItem key={role} onSelect={() => handleRoleChange(member.id, role)}>
                        {ROLE_LABEL[role]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {member.role !== "OWNER" ? (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label="Remover membro" onClick={() => handleRemove(member.id)}>
                  <UserX className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
