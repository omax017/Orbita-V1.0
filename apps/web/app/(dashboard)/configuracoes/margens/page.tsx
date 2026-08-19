import type { Metadata } from "next";
import { MargensContent } from "@/features/settings/margens-content";

export const metadata: Metadata = { title: "Margens — Órbita" };

export default function ConfiguracoesMargensPage() {
  return <MargensContent />;
}
