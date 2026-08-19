import type { Metadata } from "next";
import { SegurancaContent } from "@/features/settings/seguranca-content";

export const metadata: Metadata = { title: "Segurança — Órbita" };

export default function ConfiguracoesSegurancaPage() {
  return <SegurancaContent />;
}
