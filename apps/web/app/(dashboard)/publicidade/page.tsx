import type { Metadata } from "next";
import { AdsContent } from "@/features/ads/ads-content";

export const metadata: Metadata = { title: "Publicidade — Órbita" };

export default function PublicidadePage() {
  return <AdsContent />;
}
