import { Sidebar } from "./sidebar";
import { Header, type HeaderProps } from "./header";

export interface AppShellProps extends HeaderProps {
  children: React.ReactNode;
}

/**
 * Casca do app autenticado: sidebar + header + área de conteúdo, num flex
 * row simples (em vez de dois elementos `fixed` posicionados manualmente —
 * ver o comentário em `sidebar.tsx`/`header.tsx` sobre por quê).
 */
export function AppShell({ user, workspace, role, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} workspace={workspace} role={role} />
        <main className="flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  );
}
