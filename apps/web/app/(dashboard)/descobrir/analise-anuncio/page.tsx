import { Suspense } from "react";
import type { Metadata } from "next";
import { AnuncioContent } from "@/features/discovery/anuncio-content";

export const metadata: Metadata = { title: "Análise de Anúncio — Órbita" };

export default function DescobrirAnaliseAnuncioPage() {
  return (
    <Suspense fallback={null}>
      <AnuncioContent />
    </Suspense>
  );
}
