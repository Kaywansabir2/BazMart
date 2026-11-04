import { Injectable } from '@nestjs/common';
import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';

@Injectable()
export class SwitchCardAdapter implements IPaymentGatewayAdapter {
  readonly id = 'CARD';

  getMetadata(): PaymentMethodMetadata {
    const isEnabled = process.env.ENABLE_SWITCH_CARD === 'true';
    return {
      id: 'CARD',
      nameEn: 'Visa / Mastercard',
      nameCkb: 'ڤیزا / ماستەرکارد',
      nameAr: 'فيزا / ماستركارد',
      subtitleEn: 'Local Iraqi & international debit and credit cards',
      subtitleCkb: 'کارتە ناوخۆیی و نێودەوڵەتییەکان',
      subtitleAr: 'البطاقات المصرفية المحلية والدولية',
      iconName: 'credit_card_outlined',
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
      message: 'Card Switch Gateway integration in progress.',
    };
  }

  async verifyPayment(ref: string): Promise<PaymentProcessResult> {
    return { success: true, transactionReference: ref, paymentStatus: 'PAID' };
  }
}

