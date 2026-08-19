"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { navSections, topNavItem } from "./sidebar-nav-data";

// Mapa achatado href -> label a partir dos dados da sidebar, + entradas que
// não aparecem no menu (subrotas de Configurações, por exemplo).
const ROUTE_LABELS: Record<string, string> = {
  [topNavItem.href]: topNavItem.label,
  "/configuracoes/perfil": "Perfil",
  "/configuracoes/seguranca": "Segurança",
  "/configuracoes/cobranca": "Cobrança",
  "/configuracoes/integracoes": "Integrações",
  "/configuracoes/planos": "Planos",
  "/configuracoes/margens": "Margens",
  "/configuracoes/ia": "IA (MCP)",
  "/configuracoes/indicacao": "Indicação",
  "/configuracoes/membros": "Membros",
};

for (const section of navSections) {
  for (const item of section.items) {
    if (item.href) ROUTE_LABELS[item.href] = item.label;
    for (const child of item.children ?? []) {
      ROUTE_LABELS[child.href] = child.label;
    }
  }
}

function humanize(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    return { href, label: ROUTE_LABELS[href] ?? humanize(segment) };
  });

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : null}
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
