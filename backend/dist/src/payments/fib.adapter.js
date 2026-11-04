"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FibAdapter = void 0;
const common_1 = require("@nestjs/common");
let FibAdapter = class FibAdapter {
    constructor() {
        this.id = 'FIB';
    }
    getMetadata() {
        const isEnabled = process.env.ENABLE_FIB === 'true';
        return {
            id: 'FIB',
            nameEn: 'First Iraqi Bank (FIB)',
            nameCkb: 'بانکی یەکەمی عێراقی',
            nameAr: 'المصرف العراقي الأول',
            subtitleEn: 'Direct secure transfer from your FIB account',
            subtitleCkb: 'پارەدانی راستەوخۆ و پارێزراو لە هەژماری بانکی FIB',
            subtitleAr: 'تحويل مباشر وآمن من حسابك لدى المصرف العراقي الأول',
            iconName: 'account_balance_outlined',
            isEnabled,
            isUpcoming: !isEnabled,
            minOrderIqd: 7000,
        };
    }
    async processPayment(order) {
        return {
            success: false,
            transactionReference: '',
            paymentStatus: 'FAILED',
            message: 'FIB adapter ready for merchant credentials.',
        };
    }
    async verifyPayment(ref) {
        return { success: true, transactionReference: ref, paymentStatus: 'PAID' };
    }
};
exports.FibAdapter = FibAdapter;
exports.FibAdapter = FibAdapter = __decorate([
    (0, common_1.Injectable)()
], FibAdapter);
//# sourceMappingURL=fib.adapter.js.map