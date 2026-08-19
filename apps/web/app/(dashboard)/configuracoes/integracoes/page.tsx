import type { Metadata } from "next";
import { IntegracoesContent } from "@/features/settings/integracoes-content";

export const metadata: Metadata = { title: "Integrações — Órbita" };

export default function ConfiguracoesIntegracoesPage() {
  return <IntegracoesContent />;
}
