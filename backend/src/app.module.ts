import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CatalogModule } from './catalog/catalog.module';
import { ErpSyncModule } from './erp-sync/erp-sync.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { FleetModule } from './fleet/fleet.module';
import { AdminModule } from './admin/admin.module';
import { CouponsModule } from './coupons/coupons.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    PrismaModule,
    CatalogModule,
    ErpSyncModule,
    PaymentsModule,
    OrdersModule,
    FleetModule,
    AdminModule,
    CouponsModule,
    AuthModule,
    CustomerModule,
    NotificationsModule,
    RatingsModule,
  ],
})
export class AppModule {}
