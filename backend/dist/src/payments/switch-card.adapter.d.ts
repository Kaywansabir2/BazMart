import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';
export declare class SwitchCardAdapter implements IPaymentGatewayAdapter {
    readonly id = "CARD";
    getMetadata(): PaymentMethodMetadata;
    processPayment(order: {
        orderNumber: string;
        totalIqd: number;
    }): Promise<PaymentProcessResult>;
    verifyPayment(ref: string): Promise<PaymentProcessResult>;
}
