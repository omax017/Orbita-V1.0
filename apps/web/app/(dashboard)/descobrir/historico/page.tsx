import type { Metadata } from "next";
import { HistoricoContent } from "@/features/discovery/historico-content";

export const metadata: Metadata = { title: "Histórico — Órbita" };

export default function DescobrirHistoricoPage() {
  return <HistoricoContent />;
}
