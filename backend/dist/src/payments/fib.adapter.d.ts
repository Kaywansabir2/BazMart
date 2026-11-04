import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';
export declare class FibAdapter implements IPaymentGatewayAdapter {
    readonly id = "FIB";
    getMetadata(): PaymentMethodMetadata;
    processPayment(order: {
        orderNumber: string;
        totalIqd: number;
    }): Promise<PaymentProcessResult>;
    verifyPayment(ref: string): Promise<PaymentProcessResult>;
}
