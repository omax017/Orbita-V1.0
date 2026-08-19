import type { Metadata } from "next";
import { PlanosContent } from "@/features/settings/planos-content";

export const metadata: Metadata = { title: "Planos — Órbita" };

export default function ConfiguracoesPlanosPage() {
  return <PlanosContent />;
}
