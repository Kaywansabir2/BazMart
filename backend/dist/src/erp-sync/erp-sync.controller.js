"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErpSyncController = void 0;
const common_1 = require("@nestjs/common");
const erp_sync_service_1 = require("./erp-sync.service");
let ErpSyncController = class ErpSyncController {
    constructor(erpSyncService) {
        this.erpSyncService = erpSyncService;
    }
    async handleStockUpdate(body, signature) {
        const updates = Array.isArray(body?.updates) ? body.updates : (Array.isArray(body) ? body : []);
        const result = await this.erpSyncService.processBatchStockUpdate(updates);
        return {
            success: true,
            timestamp: new Date().toISOString(),
            ...result,
        };
    }
    async triggerSync(adminKey) {
        const report = await this.erpSyncService.triggerManualSync();
        return {
            success: true,
            data: report,
        };
    }
};
exports.ErpSyncController = ErpSyncController;
__decorate([
    (0, common_1.Post)('webhook/stock-update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-erp-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ErpSyncController.prototype, "handleStockUpdate", null);
__decorate([
    (0, common_1.Post)('sync/trigger'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-admin-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ErpSyncController.prototype, "triggerSync", null);
exports.ErpSyncController = ErpSyncController = __decorate([
    (0, common_1.Controller)('api/v1/erp'),
    __metadata("design:paramtypes", [erp_sync_service_1.ErpSyncService])
], ErpSyncController);
//# sourceMappingURL=erp-sync.controller.js.map