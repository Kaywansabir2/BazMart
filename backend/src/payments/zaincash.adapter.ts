import { Injectable } from '@nestjs/common';
import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';

@Injectable()
export class ZainCashAdapter implements IPaymentGatewayAdapter {
  readonly id = 'ZAINCASH';

  getMetadata(): PaymentMethodMetadata {
    const isEnabled = process.env.ENABLE_ZAINCASH === 'true';
    return {
      id: 'ZAINCASH',
      nameEn: 'ZainCash',
      nameCkb: 'زەین کاش',
      nameAr: 'زين كاش',
      subtitleEn: 'Pay using your ZainCash Iraq mobile wallet',
      subtitleCkb: 'پارەدان لە رێگەی ئەپڵیکەیشنی زەین کاش',
      subtitleAr: 'ادفع مباشرة من محفظة زين كاش العراقية',
      iconName: 'phone_android_outlined',
      isEnabled,
      isUpcoming: !isEnabled,
      minOrderIqd: 7000,
    };
  }

  async processPayment(order: { orderNumber: string; totalIqd: number }): Promise<PaymentProcessResult> {
    return {
      success: false,
      transactionReference: '',
      paymentStatus: 'FAILED',
      message: 'ZainCash integration in progress.',
    };
  }

  async verifyPayment(ref: string): Promise<PaymentProcessResult> {
    return { success: true, transactionReference: ref, paymentStatus: 'PAID' };
  }
}

