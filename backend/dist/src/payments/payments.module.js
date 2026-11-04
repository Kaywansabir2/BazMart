"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const payments_service_1 = require("./payments.service");
const payments_controller_1 = require("./payments.controller");
const cod_adapter_1 = require("./cod.adapter");
const fastpay_adapter_1 = require("./fastpay.adapter");
const zaincash_adapter_1 = require("./zaincash.adapter");
const fib_adapter_1 = require("./fib.adapter");
const switch_card_adapter_1 = require("./switch-card.adapter");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [payments_controller_1.PaymentsController],
        providers: [
            payments_service_1.PaymentsService,
            cod_adapter_1.CodPaymentAdapter,
            fastpay_adapter_1.FastPayAdapter,
            zaincash_adapter_1.ZainCashAdapter,
            fib_adapter_1.FibAdapter,
            switch_card_adapter_1.SwitchCardAdapter,
        ],
        exports: [payments_service_1.PaymentsService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map