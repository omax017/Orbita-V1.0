import { redirect } from "next/navigation";

// "Descobrir" é label de seção na sidebar (não um link) — quem cair aqui
// direto vai para o primeiro item da seção.
export default function DescobrirIndexPage() {
  redirect("/descobrir/garimpador");
}
