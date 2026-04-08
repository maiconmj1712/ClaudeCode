import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { BullModule } from '@nestjs/bull'
import { AuthModule } from './modules/auth/auth.module'
import { ClinicsModule } from './modules/clinics/clinics.module'
import { CompaniesModule } from './modules/companies/companies.module'
import { ProductsModule } from './modules/products/products.module'
import { OrdersModule } from './modules/orders/orders.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { AutomationsModule } from './modules/automations/automations.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { SettingsModule } from './modules/settings/settings.module'
import { PrismaModule } from './common/prisma/prisma.module'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),

    // Rate limiting: 100 req/min per IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Redis queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: new URL(config.get('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: parseInt(new URL(config.get('REDIS_URL', 'redis://localhost:6379')).port || '6379'),
        },
      }),
    }),

    // Domain modules
    PrismaModule,
    AuthModule,
    ClinicsModule,
    CompaniesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    AutomationsModule,
    DashboardModule,
    SettingsModule,
  ],
})
export class AppModule {}
