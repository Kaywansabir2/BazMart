import { PrismaService } from '../prisma/prisma.service';
import { IErpConnector, ErpCatalogItem, ErpStockDelta } from './erp-connector.interface';
export declare class ErpSyncService implements IErpConnector {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    fetchDeltaCatalog(since?: Date): Promise<ErpCatalogItem[]>;
    fetchBranchStock(warehouseId: string): Promise<ErpStockDelta[]>;
    pushCompletedOrderToErp(order: any): Promise<{
        success: boolean;
        erpTransactionId: string;
    }>;
    processBatchStockUpdate(updates: ErpStockDelta[]): Promise<{
        processedCount: number;
        updatedProducts: string[];
        errors: string[];
    }>;
    triggerManualSync(): Promise<{
        status: string;
        syncedAt: string;
        totalProductsCount: number;
        activeWarehousesCount: number;
        report: string;
    }>;
}
