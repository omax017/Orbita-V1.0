import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../auth/guards/workspace.guard";
import { CurrentWorkspace, CurrentWorkspacePayload } from "../auth/decorators/current-workspace.decorator";
import { CatalogService } from "./catalog.service";
import { CreateSkuDto } from "./dto/create-sku.dto";
import { UpdateSkuDto } from "./dto/update-sku.dto";
import { LinkListingDto } from "./dto/link-listing.dto";

/**
 * CRUD real de SKU — a Etapa 5 só tinha a tela de Estoque com dados
 * mockados; este é o backend de verdade que ela (e a extensão de
 * navegador da Etapa 10) passam a consumir.
 */
@Controller("catalog/skus")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@CurrentWorkspace() workspace: CurrentWorkspacePayload, @Query("q") q?: string) {
    return this.catalog.list(workspace.workspaceId, q);
  }

  @Get(":id")
  findOne(@CurrentWorkspace() workspace: CurrentWorkspacePayload, @Param("id") id: string) {
    return this.catalog.findOne(workspace.workspaceId, id);
  }

  @Post()
  create(@CurrentWorkspace() workspace: CurrentWorkspacePayload, @Body() dto: CreateSkuDto) {
    return this.catalog.create(workspace.workspaceId, dto);
  }

  @Patch(":id")
  update(@CurrentWorkspace() workspace: CurrentWorkspacePayload, @Param("id") id: string, @Body() dto: UpdateSkuDto) {
    return this.catalog.update(workspace.workspaceId, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@CurrentWorkspace() workspace: CurrentWorkspacePayload, @Param("id") id: string) {
    return this.catalog.remove(workspace.workspaceId, id);
  }

  @Post(":id/link-listing")
  linkListing(
    @CurrentWorkspace() workspace: CurrentWorkspacePayload,
    @Param("id") id: string,
    @Body() dto: LinkListingDto,
  ) {
    return this.catalog.linkListing(workspace.workspaceId, id, dto);
  }
}
