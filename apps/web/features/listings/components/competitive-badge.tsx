import { Trophy, TrendingDown } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { COMPETITIVE_POSITION_LABEL, type CompetitivePosition } from "../types";

/** Posição na disputa de buy box do anúncio — só é relevante pra anúncios de Catálogo. */
export function CompetitiveBadge({ position }: { position: CompetitivePosition }) {
  if (position === "UNKNOWN") return null;

  return (
    <StatusBadge
      label={COMPETITIVE_POSITION_LABEL[position]}
      tone={position === "WINNING" ? "success" : "destructive"}
      dot={false}
    />
  );
}

export function CompetitiveIcon({ position }: { position: CompetitivePosition }) {
  if (position === "WINNING") return <Trophy className="h-3.5 w-3.5 text-success" />;
  if (position === "LOSING") return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
  return null;
}
