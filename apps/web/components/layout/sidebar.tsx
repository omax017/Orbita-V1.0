"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { navSections, topNavItem, type NavItem, type NavLeaf } from "./sidebar-nav-data";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, item: NavItem) {
  if (item.href) return isActive(pathname, item.href);
  return item.children?.some((child) => isActive(pathname, child.href)) ?? false;
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        // sticky (não fixed) porque é filho direto do flex row do AppShell —
        // isso deixa o Header (irmão, na coluna ao lado) preencher o espaço
        // restante sozinho, sem precisar saber a largura atual da sidebar.
        "sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
      )}
    >
      <div className="flex h-header items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            {/* Ícone da marca (fundo próprio, funciona em claro/escuro) + nome
               como texto de verdade — não a wordmark SVG do kit, que tem o
               texto "órbita" fixo em preto (só funciona sobre fundo claro;
               a sidebar é escura por padrão). Ver docs/identidade-visual.md § 5. */}
            {/* unoptimized: o pipeline de otimização do next/image rejeita SVG
               por padrão (retorna 400) — SVG já é vetor, não ganha nada
               passando pelo otimizador raster mesmo. */}
            <Image src="/brand/icone-orbita.svg" alt="" width={24} height={24} unoptimized priority className="h-6 w-6 shrink-0 rounded-md" />
            <span className="truncate font-display text-base font-semibold text-sidebar-foreground">
              Órbita
            </span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <Image src="/brand/icone-orbita.svg" alt="Órbita" width={24} height={24} unoptimized priority className="block h-6 w-6 rounded-md" />
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        <NavLeafLink item={topNavItem} pathname={pathname} collapsed={collapsed} />

        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed ? (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                {section.label}
              </p>
            ) : (
              <div className="mx-2 mb-2 border-t border-sidebar-border" />
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    <NavGroup item={item} pathname={pathname} collapsed={collapsed} />
                  ) : (
                    <NavLeafLink
                      item={{ label: item.label, href: item.href!, icon: item.icon }}
                      pathname={pathname}
                      collapsed={collapsed}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex h-11 items-center justify-center border-t border-sidebar-border text-sidebar-foreground/60 hover:bg-accent hover:text-accent-foreground"
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}

function NavLeafLink({
  item,
  pathname,
  collapsed,
  indented = false,
}: {
  item: NavLeaf;
  pathname: string;
  collapsed: boolean;
  indented?: boolean;
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
        collapsed && "justify-center px-0",
        indented && !collapsed && "pl-8",
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function NavGroup({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const active = isItemActive(pathname, item);
  const [open, setOpen] = useState(active);
  const Icon = item.icon;

  // Colapsado: sem submenu inline (espaço insuficiente) — leva direto para o primeiro item.
  if (collapsed) {
    return (
      <NavLeafLink
        item={{ label: item.label, href: item.children![0].href, icon: Icon }}
        pathname={pathname}
        collapsed={collapsed}
      />
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground",
            active && "text-primary",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate text-left">{item.label}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pt-0.5">
        {item.children!.map((child) => (
          <NavLeafLink
            key={child.href}
            item={child}
            pathname={pathname}
            collapsed={false}
            indented
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
