import type { Metadata } from "next";
import { OrdersContent } from "@/features/orders/orders-content";

export const metadata: Metadata = { title: "Pedidos — Órbita" };

export default function PedidosPage() {
  return <OrdersContent />;
}
