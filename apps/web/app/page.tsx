import { redirect } from "next/navigation";

// A raiz nunca renderiza nada por si só — o middleware já manda quem não
// tem sessão para /login antes disso, então na prática só usuários
// autenticados chegam aqui (ex.: iOS PWA reabrindo em "/").
export default function RootPage() {
  redirect("/dashboard");
}
