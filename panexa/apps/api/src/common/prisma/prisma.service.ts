import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@panexa/database/generated/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }]
        : ['warn', 'error'],
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Prisma conectado ao PostgreSQL')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
