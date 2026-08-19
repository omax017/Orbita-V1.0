import type { Metadata } from "next";
import { IaContent } from "@/features/settings/ia-content";

export const metadata: Metadata = { title: "IA (MCP) — Órbita" };

export default function ConfiguracoesIaPage() {
  return <IaContent />;
}
