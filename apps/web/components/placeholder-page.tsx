import { Construction, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

/**
 * Página "em construção" — usada em toda rota de `(dashboard)` cuja lógica
 * de negócio ainda não foi implementada (fora de escopo desta etapa). Prova
 * que a navegação da sidebar/breadcrumb funciona ponta a ponta sem precisar
 * de dados reais.
 */
export function PlaceholderPage({
  title,
  description = "Esta tela ainda não foi implementada — chega numa próxima etapa.",
  icon = Construction,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  );
}
