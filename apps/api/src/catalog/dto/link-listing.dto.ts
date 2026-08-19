import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { MarketplaceProvider } from "@prisma/client";

/** Vincula um Sku a um anúncio (Listing) já sincronizado — mesma operação da
 * "Vincular" (LinkSkuPopover) do frontend (Etapa 4/5), agora com endpoint de
 * verdade. É o que a extensão chama quando o usuário está na página de um
 * anúncio e quer ligar aquele SKU a ele. */
export class LinkListingDto {
  @IsEnum(MarketplaceProvider)
  provider!: MarketplaceProvider;

  @IsString()
  @MaxLength(60)
  externalListingId!: string;

  /** Variação (cor/tamanho) — "" quando o anúncio não tem variação (ver
   * comentário no schema em ListingSku sobre NULL vs string vazia em UNIQUE). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  variationExternalId?: string;
}
