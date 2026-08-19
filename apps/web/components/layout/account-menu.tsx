"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/api";

export interface AccountMenuProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  workspaceName: string;
  role: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Dono",
  ADMIN: "Admin",
  MEMBER: "Membro",
  VIEWER: "Visualizador",
};

export function AccountMenu({ name, email, avatarUrl, workspaceName, role }: AccountMenuProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Menu da conta"
        >
          <Avatar>
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="truncate text-xs font-medium text-foreground">{workspaceName}</p>
          <p className="text-xs text-muted-foreground">{ROLE_LABEL[role] ?? role}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/configuracoes">
            <UserIcon />
            Meu perfil
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/configuracoes">
            <Settings />
            Configurações
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} disabled={loggingOut}>
          <LogOut />
          {loggingOut ? "Saindo…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
