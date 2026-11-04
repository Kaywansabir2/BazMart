import { ErpSyncService } from './erp-sync.service';
import { ErpStockDelta } from './erp-connector.interface';
export declare class ErpSyncController {
    private readonly erpSyncService;
    constructor(erpSyncService: ErpSyncService);
    handleStockUpdate(body: {
        updates: ErpStockDelta[];
    }, signature?: string): Promise<{
        processedCount: number;
        updatedProducts: string[];
        errors: string[];
        success: boolean;
        timestamp: string;
    }>;
    triggerSync(adminKey?: string): Promise<{
        success: boolean;
        data: {
            status: string;
            syncedAt: string;
            totalProductsCount: number;
            activeWarehousesCount: number;
            report: string;
        };
    }>;
}
