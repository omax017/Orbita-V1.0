import type { Metadata } from "next";
import { FerramentasContent } from "@/features/discovery/ferramentas-content";

export const metadata: Metadata = { title: "Ferramentas — Órbita" };

export default function DescobrirFerramentasPage() {
  return <FerramentasContent />;
}
