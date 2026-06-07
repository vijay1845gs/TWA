import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { HealthController } from './health/health.controller';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { BillingModule } from './modules/billing/billing.module';
import { StorageModule } from './modules/storage/storage.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { EnquiriesModule } from './modules/enquiries/enquiries.module';
import { BackupModule } from './modules/backup/backup.module';


@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting — global defaults (per-route overrides via @Throttle())
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,   // 1 minute window
        limit: 60,    // 60 requests per minute globally
      },
    ]),

    // Core
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    BillingModule,
    StorageModule,
    PaymentsModule,
    ReceiptsModule,
    AnalyticsModule,
    GalleryModule,
    EnquiriesModule,
    BackupModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global throttler guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // Global JWT guard (bypassed by @Public())
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // Global roles guard
    { provide: APP_GUARD, useClass: RolesGuard },

    // Global response transformer
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

    // Global exception filters
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
