import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSkuDto } from "./dto/create-sku.dto";
import { UpdateSkuDto } from "./dto/update-sku.dto";
import { LinkListingDto } from "./dto/link-listing.dto";

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string, query?: string) {
    return this.prisma.sku.findMany({
      where: {
        workspaceId,
        ...(query
          ? {
              OR: [
                { code: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const sku = await this.prisma.sku.findFirst({ where: { id, workspaceId } });
    if (!sku) throw new NotFoundException("SKU não encontrado");
    return sku;
  }

  async create(workspaceId: string, dto: CreateSkuDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.sku.findUnique({ where: { workspaceId_code: { workspaceId, code } } });
    if (existing) throw new ConflictException(`Já existe um SKU com o código "${code}"`);

    return this.prisma.sku.create({
      data: {
        workspaceId,
        code,
        name: dto.name.trim(),
        description: dto.description,
        costAmount: dto.costAmount,
        packagingCostAmount: dto.packagingCostAmount ?? 0,
        barcode: dto.barcode,
        weightGrams: dto.weightGrams,
        stockLocal: dto.stockLocal ?? 0,
        stockFull: dto.stockFull ?? 0,
        lowStockThreshold: dto.lowStockThreshold ?? 5,
        active: dto.active ?? true,
      },
    });
  }

  /** Update parcial — é o caminho usado pela extensão pra "cadastrar
   * rapidamente o custo": manda só `{ costAmount }`. */
  async update(workspaceId: string, id: string, dto: UpdateSkuDto) {
    await this.findOne(workspaceId, id); // 404 antes de tentar o update

    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const existing = await this.prisma.sku.findUnique({ where: { workspaceId_code: { workspaceId, code } } });
      if (existing && existing.id !== id) throw new ConflictException(`Já existe um SKU com o código "${code}"`);
    }

    return this.prisma.sku.update({
      where: { id },
      data: {
        ...(dto.code ? { code: dto.code.trim().toUpperCase() } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.costAmount !== undefined ? { costAmount: dto.costAmount } : {}),
        ...(dto.packagingCostAmount !== undefined ? { packagingCostAmount: dto.packagingCostAmount } : {}),
        ...(dto.barcode !== undefined ? { barcode: dto.barcode } : {}),
        ...(dto.weightGrams !== undefined ? { weightGrams: dto.weightGrams } : {}),
        ...(dto.stockLocal !== undefined ? { stockLocal: dto.stockLocal } : {}),
        ...(dto.stockFull !== undefined ? { stockFull: dto.stockFull } : {}),
        ...(dto.lowStockThreshold !== undefined ? { lowStockThreshold: dto.lowStockThreshold } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });
  }

  /** Hard delete de verdade (não soft delete) — seguro porque `OrderItem.sku`
   * usa `onDelete: SetNull` (pedidos já sincronizados preservam o histórico,
   * só perdem o vínculo de custo daqui pra frente) e `ListingSku.sku` usa
   * `onDelete: Cascade` (o vínculo com anúncios some junto, correto — não
   * faz sentido um vínculo apontando pra um SKU que não existe mais). */
  async remove(workspaceId: string, id: string): Promise<void> {
    await this.findOne(workspaceId, id); // 404 antes de tentar remover
    await this.prisma.sku.delete({ where: { id } });
  }

  /** Vincula (ou confirma o vínculo já existente) de um Sku a um anúncio —
   * resolve `Listing` por `(marketplaceAccountId, externalListingId)`, então
   * precisa que a conta já esteja sincronizada (Etapa 9) e o anúncio já
   * exista em `Listing`. Sem isso, 404 explicando o motivo. */
  async linkListing(workspaceId: string, skuId: string, dto: LinkListingDto) {
    await this.findOne(workspaceId, skuId);

    const listing = await this.prisma.listing.findFirst({
      where: { workspaceId, provider: dto.provider, externalListingId: dto.externalListingId },
    });
    if (!listing) {
      throw new NotFoundException(
        "Anúncio não encontrado — a conta desse marketplace precisa estar conectada e sincronizada antes de vincular",
      );
    }

    return this.prisma.listingSku.upsert({
      where: {
        listingId_skuId_variationExternalId: {
          listingId: listing.id,
          skuId,
          variationExternalId: dto.variationExternalId ?? "",
        },
      },
      create: { listingId: listing.id, skuId, variationExternalId: dto.variationExternalId ?? "" },
      update: {},
    });
  }
}
