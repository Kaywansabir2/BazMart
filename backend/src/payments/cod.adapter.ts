import { Injectable, BadRequestException } from '@nestjs/common';
import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';

@Injectable()
export class CodPaymentAdapter implements IPaymentGatewayAdapter {
  readonly id = 'COD';

  getMetadata(): PaymentMethodMetadata {
    return {
      id: 'COD',
      nameEn: 'Cash on Delivery (COD)',
      nameCkb: 'پارەدان لە کاتی وەرگرتن (کاش)',
      nameAr: 'الدفع نقداً عند الاستلام',
      subtitleEn: 'Pay cash in IQD when our rider delivers your order',
      subtitleCkb: 'کاشی بە دینار بدە کاتێک کاڵاکەت پێدەگات',
      subtitleAr: 'ادفع نقداً بالدينار العراقي عند وصول مندوب التوصيل',
      iconName: 'payments_outlined',
      isEnabled: true,
      isUpcoming: false,
      minOrderIqd: 7000,
    };
  }

  async processPayment(order: {
    orderNumber: string;
    totalIqd: number;
    customerId?: string;
    customerPhone?: string;
  }): Promise<PaymentProcessResult> {
    if (order.totalIqd < 7000) {
      throw new BadRequestException(
        `Order total (IQD ${order.totalIqd}) is below minimum order threshold of IQD 7000.`
      );
    }

    return {
      success: true,
      transactionReference: `COD-${order.orderNumber}`,
      paymentStatus: 'PENDING_COD',
      driverInstructions: `Collect exactly IQD ${order.totalIqd} in cash from customer upon delivery. Provide physical receipt.`,
      message: 'Cash on Delivery initialized successfully.',
    };
  }

  async verifyPayment(transactionReference: string): Promise<PaymentProcessResult> {
    return {
      success: true,
      transactionReference,
      paymentStatus: 'PAID',
      message: 'Driver reported cash collected successfully in IQD.',
    };
  }
}

