import type { ColumnDef } from "@tanstack/react-table";
import type { MockListing } from "@/features/listings/types";
import { MarketplaceTag } from "@/components/marketplace-tag";
import { formatCurrency } from "@/lib/format";
import { LinkSkuPopover } from "./link-sku-popover";
import type { MockSku } from "../types";

export interface MissingSkuColumnsOptions {
  onLink: (listingId: string, sku: MockSku) => void;
  skus: MockSku[];
}

export function buildMissingSkuColumns({ onLink, skus }: MissingSkuColumnsOptions): ColumnDef<MockListing>[] {
  return [
    {
      accessorKey: "title",
      header: "Anúncio",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <span className={`h-8 w-8 shrink-0 rounded-md ${row.original.thumbnailColor}`} />
          <div className="min-w-0">
            <p className="max-w-xs truncate font-medium text-foreground">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">#{row.original.externalId}</p>
          </div>
        </div>
      ),
      meta: { exportable: false },
    },
    {
      id: "account",
      header: "Conta",
      accessorFn: (listing) => listing.accountLabel,
      cell: ({ row }) => (
        <MarketplaceTag provider={row.original.provider} accountLabel={row.original.accountLabel} />
      ),
    },
    {
      accessorKey: "price",
      header: "Preço",
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <LinkSkuPopover itemTitle={row.original.title} onLink={(sku) => onLink(row.original.id, sku)} skus={skus} />
      ),
      meta: { exportable: false },
    },
  ];
}
