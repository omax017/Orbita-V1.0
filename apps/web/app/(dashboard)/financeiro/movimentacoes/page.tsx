import type { Metadata } from "next";
import { MovimentacoesContent } from "@/features/finance/movimentacoes-content";

export const metadata: Metadata = { title: "Movimentações — Órbita" };

export default function FinanceiroMovimentacoesPage() {
  return <MovimentacoesContent />;
}
