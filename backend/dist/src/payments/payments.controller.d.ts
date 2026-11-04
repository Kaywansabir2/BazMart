import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getMethods(): Promise<{
        success: boolean;
        data: import("./payment-gateway.interface").PaymentMethodMetadata[];
    }>;
}
