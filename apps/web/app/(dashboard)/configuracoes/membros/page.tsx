import type { Metadata } from "next";
import { MembrosContent } from "@/features/settings/membros-content";

export const metadata: Metadata = { title: "Membros — Órbita" };

export default function ConfiguracoesMembrosPage() {
  return <MembrosContent />;
}
