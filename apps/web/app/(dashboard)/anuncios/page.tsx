import { redirect } from "next/navigation";

// "Anúncios" tem submenu — o item pai leva direto para o primeiro filho.
export default function AnunciosIndexPage() {
  redirect("/anuncios/listagem");
}
