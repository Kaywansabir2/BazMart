import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';
export declare class ZainCashAdapter implements IPaymentGatewayAdapter {
    readonly id = "ZAINCASH";
    getMetadata(): PaymentMethodMetadata;
    processPayment(order: {
        orderNumber: string;
        totalIqd: number;
    }): Promise<PaymentProcessResult>;
    verifyPayment(ref: string): Promise<PaymentProcessResult>;
}
