import type { Metadata } from "next";
import { ResumoContent } from "@/features/finance/resumo-content";

export const metadata: Metadata = { title: "Resumo Financeiro — Órbita" };

export default function FinanceiroResumoPage() {
  return <ResumoContent />;
}
