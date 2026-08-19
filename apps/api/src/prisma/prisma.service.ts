import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Wrapper do PrismaClient como provider do Nest, com lifecycle hooks
 * para conectar/desconectar junto com a aplicação.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Conectado ao PostgreSQL via Prisma");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
