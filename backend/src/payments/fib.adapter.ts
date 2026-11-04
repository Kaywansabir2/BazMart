import { Injectable } from '@nestjs/common';
import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';

@Injectable()
export class FibAdapter implements IPaymentGatewayAdapter {
  readonly id = 'FIB';

  getMetadata(): PaymentMethodMetadata {
    const isEnabled = process.env.ENABLE_FIB === 'true';
    return {
      id: 'FIB',
      nameEn: 'First Iraqi Bank (FIB)',
      nameCkb: 'بانکی یەکەمی عێراقی',
      nameAr: 'المصرف العراقي الأول',
      subtitleEn: 'Direct secure transfer from your FIB account',
      subtitleCkb: 'پارەدانی راستەوخۆ و پارێزراو لە هەژماری بانکی FIB',
      subtitleAr: 'تحويل مباشر وآمن من حسابك لدى المصرف العراقي الأول',
      iconName: 'account_balance_outlined',
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
      message: 'FIB adapter ready for merchant credentials.',
    };
  }

  async verifyPayment(ref: string): Promise<PaymentProcessResult> {
    return { success: true, transactionReference: ref, paymentStatus: 'PAID' };
  }
}

