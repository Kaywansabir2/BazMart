export interface PaymentMethodMetadata {
  id: string; // COD, FASTPAY, ZAINCASH, FIB, CARD
  nameEn: string;
  nameCkb: string;
  nameAr: string;
  subtitleEn: string;
  subtitleCkb: string;
  subtitleAr: string;
  iconName: string;
  isEnabled: boolean;
  isUpcoming: boolean;
  minOrderIqd: number;
}

export interface PaymentProcessResult {
  success: boolean;
  transactionReference: string;
  paymentStatus: 'PENDING_COD' | 'PAID' | 'FAILED' | 'REQUIRES_ACTION';
  redirectUrl?: string;
  driverInstructions?: string;
  message?: string;
}

export interface IPaymentGatewayAdapter {
  readonly id: string;
  getMetadata(): PaymentMethodMetadata;
  processPayment(order: {
    orderNumber: string;
    totalIqd: number;
    customerId?: string;
    customerPhone?: string;
  }): Promise<PaymentProcessResult>;
  verifyPayment(transactionReference: string): Promise<PaymentProcessResult>;
}

