import type { Metadata } from "next";
import { IndicacaoContent } from "@/features/settings/indicacao-content";

export const metadata: Metadata = { title: "Indicação — Órbita" };

export default function ConfiguracoesIndicacaoPage() {
  return <IndicacaoContent />;
}
