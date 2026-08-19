import { StatusBadge } from "@/components/ui/status-badge";
import { STOCK_HEALTH_LABEL, type StockHealth } from "../types";

const HEALTH_TONE: Record<StockHealth, "success" | "warning" | "destructive"> = {
  HEALTHY: "success",
  LOW: "warning",
  CRITICAL: "warning",
  OUT_OF_STOCK: "destructive",
};

export function StockHealthBadge({ health }: { health: StockHealth }) {
  return <StatusBadge label={STOCK_HEALTH_LABEL[health]} tone={HEALTH_TONE[health]} />;
}
