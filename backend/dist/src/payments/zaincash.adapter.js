"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZainCashAdapter = void 0;
const common_1 = require("@nestjs/common");
let ZainCashAdapter = class ZainCashAdapter {
    constructor() {
        this.id = 'ZAINCASH';
    }
    getMetadata() {
        const isEnabled = process.env.ENABLE_ZAINCASH === 'true';
        return {
            id: 'ZAINCASH',
            nameEn: 'ZainCash',
            nameCkb: 'زەین کاش',
            nameAr: 'زين كاش',
            subtitleEn: 'Pay using your ZainCash Iraq mobile wallet',
            subtitleCkb: 'پارەدان لە رێگەی ئەپڵیکەیشنی زەین کاش',
            subtitleAr: 'ادفع مباشرة من محفظة زين كاش العراقية',
            iconName: 'phone_android_outlined',
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
            message: 'ZainCash integration in progress.',
        };
    }
    async verifyPayment(ref) {
        return { success: true, transactionReference: ref, paymentStatus: 'PAID' };
    }
};
exports.ZainCashAdapter = ZainCashAdapter;
exports.ZainCashAdapter = ZainCashAdapter = __decorate([
    (0, common_1.Injectable)()
], ZainCashAdapter);
//# sourceMappingURL=zaincash.adapter.js.map