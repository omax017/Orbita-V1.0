import type { Metadata } from "next";
import { CatalogContent } from "@/features/catalog/catalog-content";

export const metadata: Metadata = { title: "Estoque — Órbita" };

export default function EstoquePage() {
  return <CatalogContent />;
}
