import { Suspense } from "react";
import type { Metadata } from "next";
import { ConcorrentesContent } from "@/features/discovery/concorrentes-content";

export const metadata: Metadata = { title: "Análise de Concorrentes — Órbita" };

export default function DescobrirConcorrentesPage() {
  return (
    <Suspense fallback={null}>
      <ConcorrentesContent />
    </Suspense>
  );
}
