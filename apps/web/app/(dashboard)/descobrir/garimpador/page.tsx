import { Suspense } from "react";
import type { Metadata } from "next";
import { GarimpadorContent } from "@/features/discovery/garimpador-content";

export const metadata: Metadata = { title: "Garimpador — Órbita" };

export default function DescobrirGarimpadorPage() {
  return (
    <Suspense fallback={null}>
      <GarimpadorContent />
    </Suspense>
  );
}
