import type { Metadata } from "next";
import { AbcContent } from "@/features/finance/abc-content";

export const metadata: Metadata = { title: "Análise ABC — Órbita" };

export default function FinanceiroAbcPage() {
  return <AbcContent />;
}
