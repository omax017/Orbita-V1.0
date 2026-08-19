import type { Metadata } from "next";
import { CobrancaContent } from "@/features/settings/cobranca-content";

export const metadata: Metadata = { title: "Cobrança — Órbita" };

export default function ConfiguracoesCobrancaPage() {
  return <CobrancaContent />;
}
