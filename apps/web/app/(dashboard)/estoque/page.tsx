import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { CatalogContent } from "@/features/catalog/catalog-content";

export const metadata: Metadata = { title: "Estoque — Órbita" };

export default async function EstoquePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const workspaceId = session.memberships[0]?.workspace.id;
  if (!workspaceId) redirect("/login");

  return <CatalogContent workspaceId={workspaceId} />;
}
