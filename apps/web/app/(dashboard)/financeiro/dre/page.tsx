import type { Metadata } from "next";
import { DreContent } from "@/features/finance/dre-content";

export const metadata: Metadata = { title: "Análise DRE — Órbita" };

export default function FinanceiroDrePage() {
  return <DreContent />;
}
