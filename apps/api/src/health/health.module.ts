import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";

// TerminusModule já provê PrismaHealthIndicator (e os demais indicadores
// nativos) automaticamente — não precisa ser registrado aqui.
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
