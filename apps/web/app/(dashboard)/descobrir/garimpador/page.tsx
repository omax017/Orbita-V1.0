import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { GarimpadorContent } from "@/features/discovery/garimpador-content";

export const metadata: Metadata = { title: "Garimpador — Órbita" };

export default async function DescobrirGarimpadorPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceId = session.memberships[0]?.workspace.id;
  if (!workspaceId) redirect("/login");

  return (
    <Suspense fallback={null}>
      <GarimpadorContent workspaceId={workspaceId} />
    </Suspense>
  );
}
