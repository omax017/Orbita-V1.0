import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Breadcrumb } from "./breadcrumb";
import { AccountMenu } from "./account-menu";
import { NotificationBell } from "./notification-bell";

export interface HeaderProps {
  user: { name: string; email: string; avatarUrl: string | null };
  workspace: { name: string };
  role: string;
}

/**
 * Header fixo do shell autenticado: breadcrumb à esquerda; upgrade/trial,
 * sino de notificações, alternância de tema e menu de conta à direita.
 *
 * `sticky top-0` (não `fixed`) porque é filho da coluna direita do flex row
 * em `AppShell` — assim ele naturalmente ocupa só o espaço ao lado da
 * sidebar, sem precisar calcular a largura dela (que muda ao recolher).
 */
export function Header({ user, workspace, role }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-header shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="min-w-0">
        <Breadcrumb />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button variant="default" size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Sparkles className="h-4 w-4" />
          Fazer upgrade
        </Button>
        <NotificationBell />
        <ThemeToggle />
        <AccountMenu
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          workspaceName={workspace.name}
          role={role}
        />
      </div>
    </header>
  );
}
