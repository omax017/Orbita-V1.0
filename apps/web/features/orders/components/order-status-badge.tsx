import { StatusBadge } from "@/components/ui/status-badge";
import { ORDER_STATUS_LABEL } from "../mock-data";
import type { OrderStatus } from "../types";

const STATUS_TONE: Record<OrderStatus, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  PENDING: "neutral",
  PAID: "info",
  IN_PREPARATION: "warning",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELED: "destructive",
  RETURNED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge label={ORDER_STATUS_LABEL[status]} tone={STATUS_TONE[status]} />;
}
