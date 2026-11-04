"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodPaymentAdapter = void 0;
const common_1 = require("@nestjs/common");
let CodPaymentAdapter = class CodPaymentAdapter {
    constructor() {
        this.id = 'COD';
    }
    getMetadata() {
        return {
            id: 'COD',
            nameEn: 'Cash on Delivery (COD)',
            nameCkb: 'پارەدان لە کاتی وەرگرتن (کاش)',
            nameAr: 'الدفع نقداً عند الاستلام',
            subtitleEn: 'Pay cash in IQD when our rider delivers your order',
            subtitleCkb: 'کاشی بە دینار بدە کاتێک کاڵاکەت پێدەگات',
            subtitleAr: 'ادفع نقداً بالدينار العراقي عند وصول مندوب التوصيل',
            iconName: 'payments_outlined',
            isEnabled: true,
            isUpcoming: false,
            minOrderIqd: 7000,
        };
    }
    async processPayment(order) {
        if (order.totalIqd < 7000) {
            throw new common_1.BadRequestException(`Order total (IQD ${order.totalIqd}) is below minimum order threshold of IQD 7000.`);
        }
        return {
            success: true,
            transactionReference: `COD-${order.orderNumber}`,
            paymentStatus: 'PENDING_COD',
            driverInstructions: `Collect exactly IQD ${order.totalIqd} in cash from customer upon delivery. Provide physical receipt.`,
            message: 'Cash on Delivery initialized successfully.',
        };
    }
    async verifyPayment(transactionReference) {
        return {
            success: true,
            transactionReference,
            paymentStatus: 'PAID',
            message: 'Driver reported cash collected successfully in IQD.',
        };
    }
};
exports.CodPaymentAdapter = CodPaymentAdapter;
exports.CodPaymentAdapter = CodPaymentAdapter = __decorate([
    (0, common_1.Injectable)()
], CodPaymentAdapter);
//# sourceMappingURL=cod.adapter.js.map