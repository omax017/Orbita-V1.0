import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Compass,
  FileBarChart,
  FileSearch,
  Gauge,
  HelpCircle,
  History,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Megaphone,
  Pickaxe,
  Receipt,
  Settings,
  ShoppingCart,
  Tags,
  Trophy,
  Wallet,
  Wrench,
} from "lucide-react";

export interface NavLeaf {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavLeaf[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/** Item pinado acima das seções — sempre visível, sem grupo/label. */
export const topNavItem: NavLeaf & { icon: LucideIcon } = {
  label: "Dashboard",
  href: "/dashboard",
  icon: Gauge,
};

export const navSections: NavSection[] = [
  {
    label: "Gerenciar",
    items: [
      { label: "Pedidos", href: "/pedidos", icon: ShoppingCart },
      {
        label: "Anúncios",
        icon: Tags,
        children: [
          { label: "Listagem", href: "/anuncios/listagem", icon: ListChecks },
          { label: "Rankeamento", href: "/anuncios/rankeamento", icon: Trophy },
          { label: "Catálogos", href: "/anuncios/catalogos", icon: LayoutGrid },
        ],
      },
      { label: "Estoque", href: "/estoque", icon: Boxes },
      {
        label: "Financeiro",
        icon: Wallet,
        children: [
          { label: "Resumo", href: "/financeiro/resumo", icon: Gauge },
          { label: "Análise ABC", href: "/financeiro/abc", icon: BarChart3 },
          { label: "Análise DRE", href: "/financeiro/dre", icon: FileBarChart },
          { label: "Movimentações", href: "/financeiro/movimentacoes", icon: Receipt },
        ],
      },
      { label: "Publicidade", href: "/publicidade", icon: Megaphone },
    ],
  },
  {
    label: "Descobrir",
    items: [
      { label: "Garimpador", href: "/descobrir/garimpador", icon: Pickaxe },
      { label: "Concorrentes", href: "/descobrir/concorrentes", icon: Compass },
      { label: "Análise de Anúncio", href: "/descobrir/analise-anuncio", icon: FileSearch },
      { label: "Ferramentas", href: "/descobrir/ferramentas", icon: Wrench },
      { label: "Histórico", href: "/descobrir/historico", icon: History },
    ],
  },
  {
    label: "Ajuda e Configurações",
    items: [
      { label: "Configurações", href: "/configuracoes", icon: Settings },
      { label: "Suporte", href: "/suporte", icon: LifeBuoy },
      { label: "Central de ajuda", href: "/central-ajuda", icon: HelpCircle },
    ],
  },
];
