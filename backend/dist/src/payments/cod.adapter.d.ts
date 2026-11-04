import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';
export declare class CodPaymentAdapter implements IPaymentGatewayAdapter {
    readonly id = "COD";
    getMetadata(): PaymentMethodMetadata;
    processPayment(order: {
        orderNumber: string;
        totalIqd: number;
        customerId?: string;
        customerPhone?: string;
    }): Promise<PaymentProcessResult>;
    verifyPayment(transactionReference: string): Promise<PaymentProcessResult>;
}
