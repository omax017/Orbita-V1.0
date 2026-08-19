import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DashboardContent } from "@/features/dashboard/dashboard-content";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard — Órbita" };

export default async function DashboardPage() {
  // Next.js dedupa fetches idênticos dentro da mesma requisição — chamar de
  // novo aqui não bate na API duas vezes, reaproveita a chamada que o
  // layout já fez para montar o AppShell.
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <DashboardContent userName={session.user.name} />;
}
