import { StatusBadge } from "@/components/ui/status-badge";
import type { ListingStatus } from "../types";

const STATUS_LABEL: Record<ListingStatus, string> = {
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  CLOSED: "Encerrado",
  UNDER_REVIEW: "Em revisão",
};

const STATUS_TONE: Record<ListingStatus, "success" | "warning" | "destructive" | "neutral"> = {
  ACTIVE: "success",
  PAUSED: "warning",
  CLOSED: "destructive",
  UNDER_REVIEW: "warning",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <StatusBadge label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />;
}
