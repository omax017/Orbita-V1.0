import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WorkspaceGuard } from "../auth/guards/workspace.guard";
import { CurrentUser, CurrentUserPayload } from "../auth/decorators/current-user.decorator";
import { CurrentWorkspace, CurrentWorkspacePayload } from "../auth/decorators/current-workspace.decorator";
import { DiscoveryService } from "./discovery.service";
import { GarimpadorQueryDto } from "./dto/garimpador-query.dto";
import { UrlQueryDto } from "./dto/url-query.dto";

/**
 * Endpoints reais por trás do módulo Descobrir (Etapa 7, antes só
 * frontend/mock) — o que a extensão de navegador (Etapa 10) chama a partir
 * da página de um anúncio pra "disparar uma análise de concorrente".
 * Resultado ainda é gerado (sem scraping real, ver `DiscoveryService`), mas
 * agora fica persistido em `SearchHistory` de verdade.
 */
@Controller("discovery")
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Post("garimpador")
  garimpador(
    @CurrentWorkspace() workspace: CurrentWorkspacePayload,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GarimpadorQueryDto,
  ) {
    return this.discovery.garimpador(workspace.workspaceId, user.userId, dto.termo, dto.categoria);
  }

  @Post("concorrentes")
  concorrentes(
    @CurrentWorkspace() workspace: CurrentWorkspacePayload,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UrlQueryDto,
  ) {
    return this.discovery.concorrentes(workspace.workspaceId, user.userId, dto.url);
  }

  @Post("anuncio")
  anuncio(
    @CurrentWorkspace() workspace: CurrentWorkspacePayload,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UrlQueryDto,
  ) {
    return this.discovery.anuncio(workspace.workspaceId, user.userId, dto.url);
  }

  @Get("history")
  history(@CurrentWorkspace() workspace: CurrentWorkspacePayload) {
    return this.discovery.history(workspace.workspaceId);
  }
}
