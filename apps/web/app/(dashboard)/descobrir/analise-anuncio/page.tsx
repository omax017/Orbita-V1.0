import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { AnuncioContent } from "@/features/discovery/anuncio-content";

export const metadata: Metadata = { title: "Análise de Anúncio — Órbita" };

export default async function DescobrirAnaliseAnuncioPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceId = session.memberships[0]?.workspace.id;
  if (!workspaceId) redirect("/login");

  return (
    <Suspense fallback={null}>
      <AnuncioContent workspaceId={workspaceId} />
    </Suspense>
  );
}
