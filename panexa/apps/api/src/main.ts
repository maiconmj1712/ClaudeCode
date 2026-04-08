import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] })

  // ── Security ────────────────────────────────────────────────────────────────
  app.use(helmet())
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // ── Validation ──────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    })
  )

  // ── Swagger (dev only) ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Panexa API')
      .setDescription('B2B2B SaaS de Saúde Ocupacional — API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const doc = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, doc)
    logger.log('Swagger disponível em: http://localhost:3001/docs')
  }

  // ── Start ───────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3001
  await app.listen(port)
  logger.log(`API rodando em: http://localhost:${port}`)
}

bootstrap()
