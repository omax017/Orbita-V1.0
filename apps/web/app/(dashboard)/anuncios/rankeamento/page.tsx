import type { Metadata } from "next";
import { RankingContent } from "@/features/listings/ranking-content";

export const metadata: Metadata = { title: "Rankeamento — Órbita" };

export default function AnunciosRankeamentoPage() {
  return <RankingContent />;
}
