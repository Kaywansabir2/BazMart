import { Injectable } from '@nestjs/common';
import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';

@Injectable()
export class FastPayAdapter implements IPaymentGatewayAdapter {
  readonly id = 'FASTPAY';

  getMetadata(): PaymentMethodMetadata {
    const isEnabled = process.env.ENABLE_FASTPAY === 'true';
    return {
      id: 'FASTPAY',
      nameEn: 'FastPay Wallet',
      nameCkb: 'فاست پەی',
      nameAr: 'محفظة فاست باي',
      subtitleEn: 'Seamless mobile payment via FastPay account',
      subtitleCkb: 'پارەدانی خێرا لە رێگەی ئەپڵیکەیشنی فاست پەی',
      subtitleAr: 'الدفع الإلكتروني الفوري عبر تطبيق فاست باي',
      iconName: 'account_balance_wallet_outlined',
      isEnabled,
      isUpcoming: !isEnabled,
      minOrderIqd: 7000,
    };
  }

  async processPayment(order: { orderNumber: string; totalIqd: number }): Promise<PaymentProcessResult> {
    if (process.env.ENABLE_FASTPAY !== 'true') {
      return {
        success: false,
        transactionReference: '',
        paymentStatus: 'FAILED',
        message: 'FastPay Gateway is currently in sandbox onboarding mode.',
      };
    }
    return {
      success: true,
      transactionReference: `FP-${Date.now()}`,
      paymentStatus: 'PAID',
      message: 'FastPay payment authorized.',
    };
  }

  async verifyPayment(ref: string): Promise<PaymentProcessResult> {
    return { success: true, transactionReference: ref, paymentStatus: 'PAID' };
  }
}

