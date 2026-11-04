"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchCardAdapter = void 0;
const common_1 = require("@nestjs/common");
let SwitchCardAdapter = class SwitchCardAdapter {
    constructor() {
        this.id = 'CARD';
    }
    getMetadata() {
        const isEnabled = process.env.ENABLE_SWITCH_CARD === 'true';
        return {
            id: 'CARD',
            nameEn: 'Visa / Mastercard',
            nameCkb: 'ڤیزا / ماستەرکارد',
            nameAr: 'فيزا / ماستركارد',
            subtitleEn: 'Local Iraqi & international debit and credit cards',
            subtitleCkb: 'کارتە ناوخۆیی و نێودەوڵەتییەکان',
            subtitleAr: 'البطاقات المصرفية المحلية والدولية',
            iconName: 'credit_card_outlined',
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
            message: 'Card Switch Gateway integration in progress.',
        };
    }
    async verifyPayment(ref) {
        return { success: true, transactionReference: ref, paymentStatus: 'PAID' };
    }
};
exports.SwitchCardAdapter = SwitchCardAdapter;
exports.SwitchCardAdapter = SwitchCardAdapter = __decorate([
    (0, common_1.Injectable)()
], SwitchCardAdapter);
//# sourceMappingURL=switch-card.adapter.js.map