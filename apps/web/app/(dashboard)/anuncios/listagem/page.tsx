import type { Metadata } from "next";
import { ListingsContent } from "@/features/listings/listings-content";

export const metadata: Metadata = { title: "Anúncios — Órbita" };

export default function AnunciosListagemPage() {
  return <ListingsContent />;
}
