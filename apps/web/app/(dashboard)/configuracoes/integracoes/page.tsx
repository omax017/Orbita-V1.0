import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { IntegracoesContent } from "@/features/settings/integracoes-content";

export const metadata: Metadata = { title: "Integrações — Órbita" };

export default async function ConfiguracoesIntegracoesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceId = session.memberships[0]?.workspace.id;
  if (!workspaceId) redirect("/login");

  return (
    <Suspense fallback={null}>
      <IntegracoesContent workspaceId={workspaceId} />
    </Suspense>
  );
}
