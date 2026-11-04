import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';
export declare class FastPayAdapter implements IPaymentGatewayAdapter {
    readonly id = "FASTPAY";
    getMetadata(): PaymentMethodMetadata;
    processPayment(order: {
        orderNumber: string;
        totalIqd: number;
    }): Promise<PaymentProcessResult>;
    verifyPayment(ref: string): Promise<PaymentProcessResult>;
}
