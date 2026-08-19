"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Gift,
  Plug,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { label: "Perfil", href: "/configuracoes/perfil", icon: User },
  { label: "Segurança", href: "/configuracoes/seguranca", icon: ShieldCheck },
  { label: "Cobrança", href: "/configuracoes/cobranca", icon: Receipt },
  { label: "Planos", href: "/configuracoes/planos", icon: CreditCard },
  { label: "Margens", href: "/configuracoes/margens", icon: SlidersHorizontal },
  { label: "IA (MCP)", href: "/configuracoes/ia", icon: Sparkles },
  { label: "Indicação", href: "/configuracoes/indicacao", icon: Gift },
  { label: "Integrações", href: "/configuracoes/integracoes", icon: Plug },
  { label: "Membros", href: "/configuracoes/membros", icon: Users },
] as const;

/** Navegação lateral de Configurações — cada aba é uma rota real
 * (`/configuracoes/<aba>`), não um tab-switch client-side, pra cada uma ter
 * URL própria (compartilhável, voltar do browser funciona). */
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
      {SETTINGS_TABS.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:shrink",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
