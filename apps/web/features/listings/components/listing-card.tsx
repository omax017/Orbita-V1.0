"use client";

import { Boxes, MoreHorizontal, PackageX, Pencil, Tag as TagIcon, TriangleAlert, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpandableCard } from "@/components/ui/expandable-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkSkuPopover } from "@/features/catalog/components/link-sku-popover";
import type { MockSku } from "@/features/catalog/types";
import { MarketplaceTag } from "@/components/marketplace-tag";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { MockListing } from "../types";
import { ListingStatusBadge } from "./listing-status-badge";
import { CompetitiveBadge } from "./competitive-badge";
import { EditPriceDialog } from "./edit-price-dialog";

export interface ListingCardProps {
  listing: MockListing;
  onLinkSku: (listingId: string, sku: MockSku) => void;
  onEditPrice: (listingId: string, newPrice: number) => void;
  onToggleStatus: (listingId: string) => void;
}

/**
 * Card expansível de anúncio — montado sobre o mesmo `ExpandableCard`
 * genérico do `OrderCard` (Etapa 4). É exatamente o reuso que motivou o
 * componente existir: nenhuma peça de casca foi reescrita aqui.
 */
export function ListingCard({ listing, onLinkSku, onEditPrice, onToggleStatus }: ListingCardProps) {
  const missingSku = listing.skuCode === null;
  const missingPackaging = !missingSku && !listing.hasPackagingCost;

  return (
    <ExpandableCard
      header={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <MarketplaceTag provider={listing.provider} accountLabel={listing.accountLabel} />
            <span className="text-sm font-semibold text-foreground">#{listing.externalId}</span>
            <ListingStatusBadge status={listing.status} />
            {listing.fromCatalog ? (
              <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
                Catálogo
              </Badge>
            ) : null}
            <CompetitiveBadge position={listing.competitivePosition} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Mais ações">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onToggleStatus(listing.id)}>
                {listing.status === "ACTIVE" ? "Pausar anúncio" : "Ativar anúncio"}
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicar anúncio</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ver no marketplace</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      summary={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`h-9 w-9 shrink-0 rounded-md ${listing.thumbnailColor}`} />
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{listing.title}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {listing.skuCode ? (
                  <span className="text-xs text-muted-foreground">SKU {listing.skuCode}</span>
                ) : (
                  <span className="text-xs text-warning">Sem SKU vinculado</span>
                )}
                {listing.tag ? (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <TagIcon className="h-3 w-3" />
                    {listing.tag}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Preço</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(listing.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Vendas</p>
              <p className="text-sm font-semibold text-foreground">{formatNumber(listing.salesCount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Faturamento</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(listing.revenue)}</p>
            </div>

            <div className="flex items-center gap-1.5">
              {missingSku ? (
                <>
                  <Badge variant="warning" className="gap-1">
                    <TriangleAlert className="h-3 w-3" />
                    Sem custo
                  </Badge>
                  <LinkSkuPopover itemTitle={listing.title} onLink={(sku) => onLinkSku(listing.id, sku)} />
                </>
              ) : missingPackaging ? (
                <Badge variant="warning" className="gap-1">
                  <PackageX className="h-3 w-3" />
                  Sem embalagem
                </Badge>
              ) : null}
              <EditPriceDialog
                listingTitle={listing.title}
                currentPrice={listing.price}
                onSave={(price) => onEditPrice(listing.id, price)}
              />
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Valor recebido</dt>
            <dd className="mt-0.5 text-sm font-semibold text-foreground">
              {formatCurrency(listing.netReceived)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Estoque disponível</dt>
            <dd className="mt-0.5 text-sm font-semibold text-foreground">
              {formatNumber(listing.availableQuantity)} un.
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <Boxes className="h-3 w-3" />
              Tipo de anúncio
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">{listing.listingKind}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              Logística
            </dt>
            <dd className="mt-0.5 text-sm text-foreground">{listing.logisticsType}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <EditPriceDialog
            listingTitle={listing.title}
            currentPrice={listing.price}
            onSave={(price) => onEditPrice(listing.id, price)}
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Editar preço
              </Button>
            }
          />
        </div>
      </div>
    </ExpandableCard>
  );
}
