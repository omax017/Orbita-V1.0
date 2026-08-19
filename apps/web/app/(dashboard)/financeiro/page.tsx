import { redirect } from "next/navigation";

// "Financeiro" tem submenu — o item pai leva direto para o primeiro filho.
export default function FinanceiroIndexPage() {
  redirect("/financeiro/resumo");
}
