import "dotenv/config";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(cookie as any);
  await app.register(multipart as any, {
    limits: { fileSize: 25 * 1024 * 1024 },
  });

  app.setGlobalPrefix("api");
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3000, "0.0.0.0");
}

bootstrap();
