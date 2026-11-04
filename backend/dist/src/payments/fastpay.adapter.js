"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastPayAdapter = void 0;
const common_1 = require("@nestjs/common");
let FastPayAdapter = class FastPayAdapter {
    constructor() {
        this.id = 'FASTPAY';
    }
    getMetadata() {
        const isEnabled = process.env.ENABLE_FASTPAY === 'true';
        return {
            id: 'FASTPAY',
            nameEn: 'FastPay Wallet',
            nameCkb: 'فاست پەی',
            nameAr: 'محفظة فاست باي',
            subtitleEn: 'Seamless mobile payment via FastPay account',
            subtitleCkb: 'پارەدانی خێرا لە رێگەی ئەپڵیکەیشنی فاست پەی',
            subtitleAr: 'الدفع الإلكتروني الفوري عبر تطبيق فاست باي',
            iconName: 'account_balance_wallet_outlined',
            isEnabled,
            isUpcoming: !isEnabled,
            minOrderIqd: 7000,
        };
    }
    async processPayment(order) {
        if (process.env.ENABLE_FASTPAY !== 'true') {
            return {
                success: false,
                transactionReference: '',
                paymentStatus: 'FAILED',
                message: 'FastPay Gateway is currently in sandbox onboarding mode.',
            };
        }
        return {
            success: true,
            transactionReference: `FP-${Date.now()}`,
            paymentStatus: 'PAID',
            message: 'FastPay payment authorized.',
        };
    }
    async verifyPayment(ref) {
        return { success: true, transactionReference: ref, paymentStatus: 'PAID' };
    }
};
exports.FastPayAdapter = FastPayAdapter;
exports.FastPayAdapter = FastPayAdapter = __decorate([
    (0, common_1.Injectable)()
], FastPayAdapter);
//# sourceMappingURL=fastpay.adapter.js.map