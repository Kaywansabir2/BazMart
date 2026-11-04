import { PrismaService } from '../prisma/prisma.service';
import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';
import { CodPaymentAdapter } from './cod.adapter';
import { FastPayAdapter } from './fastpay.adapter';
import { ZainCashAdapter } from './zaincash.adapter';
import { FibAdapter } from './fib.adapter';
import { SwitchCardAdapter } from './switch-card.adapter';
export declare class PaymentsService {
    private readonly prisma;
    private readonly codAdapter;
    private readonly fastPayAdapter;
    private readonly zainCashAdapter;
    private readonly fibAdapter;
    private readonly switchCardAdapter;
    private readonly adapters;
    constructor(prisma: PrismaService, codAdapter: CodPaymentAdapter, fastPayAdapter: FastPayAdapter, zainCashAdapter: ZainCashAdapter, fibAdapter: FibAdapter, switchCardAdapter: SwitchCardAdapter);
    private registerAdapter;
    getPaymentMethods(): Promise<PaymentMethodMetadata[]>;
    getPaymentConfigs(): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        isEnabled: boolean;
        credentials: string | null;
    }[]>;
    togglePaymentConfig(id: string, isEnabled: boolean, credentials?: string): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        isEnabled: boolean;
        credentials: string | null;
    }>;
    getAdapter(id: string): IPaymentGatewayAdapter;
    processPayment(methodId: string, order: {
        orderNumber: string;
        totalIqd: number;
        customerId?: string;
        customerPhone?: string;
    }): Promise<PaymentProcessResult>;
}
