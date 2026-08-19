import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Cinto e suspensórios: o middleware já redireciona por presença de
  // cookie; aqui validamos de verdade (a API confirmou o JWT) antes de
  // renderizar qualquer coisa do shell autenticado.
  if (!session) {
    redirect("/login");
  }

  const primaryMembership = session.memberships[0];
  if (!primaryMembership) {
    // Não deveria acontecer (o cadastro sempre cria um workspace com o
    // usuário como OWNER) — mas se acontecer, não há shell pra montar.
    redirect("/login");
  }

  return (
    <AppShell
      user={session.user}
      workspace={primaryMembership.workspace}
      role={primaryMembership.role}
    >
      {children}
    </AppShell>
  );
}
