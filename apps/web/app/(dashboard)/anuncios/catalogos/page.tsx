import type { Metadata } from "next";
import { CatalogosContent } from "@/features/listings/catalogos-content";

export const metadata: Metadata = { title: "Catálogos — Órbita" };

export default function AnunciosCatalogosPage() {
  return <CatalogosContent />;
}
