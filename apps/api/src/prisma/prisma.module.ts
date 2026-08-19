import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * Global para que qualquer módulo de domínio (Pedidos, Estoque, Financeiro...)
 * possa injetar PrismaService sem precisar importar este módulo explicitamente.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
