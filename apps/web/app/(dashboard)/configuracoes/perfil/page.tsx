import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { PerfilContent } from "@/features/settings/perfil-content";

export const metadata: Metadata = { title: "Perfil — Órbita" };

export default async function ConfiguracoesPerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <PerfilContent user={session.user} />;
}
