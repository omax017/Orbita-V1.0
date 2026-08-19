import { redirect } from "next/navigation";

// "Configurações" tem abas laterais — o item pai leva direto pra primeira aba.
export default function ConfiguracoesIndexPage() {
  redirect("/configuracoes/perfil");
}
