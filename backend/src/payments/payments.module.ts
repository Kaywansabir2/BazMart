import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CodPaymentAdapter } from './cod.adapter';
import { FastPayAdapter } from './fastpay.adapter';
import { ZainCashAdapter } from './zaincash.adapter';
import { FibAdapter } from './fib.adapter';
import { SwitchCardAdapter } from './switch-card.adapter';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    CodPaymentAdapter,
    FastPayAdapter,
    ZainCashAdapter,
    FibAdapter,
    SwitchCardAdapter,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
