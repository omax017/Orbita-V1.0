import "reflect-metadata";
import cookieParser from "cookie-parser";
import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  app.setGlobalPrefix("api");
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Necessário para ler os cookies httpOnly de sessão (ver apps/api/src/auth).
  app.use(cookieParser());

  // CORS liberado para o frontend em dev; restringir por domínio em produção.
  // credentials:true é obrigatório para o browser enviar/receber os cookies
  // de sessão em requisições cross-origin (web:3000 -> api:3333 em dev).
  app.enableCors({
    origin: process.env.WEB_APP_URL ?? "http://localhost:3000",
    credentials: true,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3333;
  await app.listen(port);
  logger.log(`Órbita API rodando em http://localhost:${port}/api`);
}

bootstrap();
