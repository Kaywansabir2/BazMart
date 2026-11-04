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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cod_adapter_1 = require("./cod.adapter");
const fastpay_adapter_1 = require("./fastpay.adapter");
const zaincash_adapter_1 = require("./zaincash.adapter");
const fib_adapter_1 = require("./fib.adapter");
const switch_card_adapter_1 = require("./switch-card.adapter");
let PaymentsService = class PaymentsService {
    constructor(prisma, codAdapter, fastPayAdapter, zainCashAdapter, fibAdapter, switchCardAdapter) {
        this.prisma = prisma;
        this.codAdapter = codAdapter;
        this.fastPayAdapter = fastPayAdapter;
        this.zainCashAdapter = zainCashAdapter;
        this.fibAdapter = fibAdapter;
        this.switchCardAdapter = switchCardAdapter;
        this.adapters = new Map();
        this.registerAdapter(this.codAdapter);
        this.registerAdapter(this.fastPayAdapter);
        this.registerAdapter(this.zainCashAdapter);
        this.registerAdapter(this.fibAdapter);
        this.registerAdapter(this.switchCardAdapter);
    }
    registerAdapter(adapter) {
        this.adapters.set(adapter.id, adapter);
    }
    async getPaymentMethods() {
        const configs = await this.prisma.paymentConfig.findMany();
        const configMap = new Map(configs.map(c => [c.id, c]));
        return Array.from(this.adapters.values()).map(a => {
            const meta = a.getMetadata();
            const cfg = configMap.get(a.id);
            if (cfg) {
                return {
                    ...meta,
                    isEnabled: cfg.isEnabled,
                };
            }
            return meta;
        });
    }
    async getPaymentConfigs() {
        return this.prisma.paymentConfig.findMany();
    }
    async togglePaymentConfig(id, isEnabled, credentials) {
        return this.prisma.paymentConfig.upsert({
            where: { id },
            update: {
                isEnabled,
                ...(credentials !== undefined ? { credentials } : {}),
            },
            create: {
                id,
                name: id,
                isEnabled,
                credentials: credentials || '{}',
            },
        });
    }
    getAdapter(id) {
        const adapter = this.adapters.get(id);
        if (!adapter) {
            throw new common_1.BadRequestException(`Unsupported payment method "${id}".`);
        }
        return adapter;
    }
    async processPayment(methodId, order) {
        const adapter = this.getAdapter(methodId);
        return adapter.processPayment(order);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cod_adapter_1.CodPaymentAdapter,
        fastpay_adapter_1.FastPayAdapter,
        zaincash_adapter_1.ZainCashAdapter,
        fib_adapter_1.FibAdapter,
        switch_card_adapter_1.SwitchCardAdapter])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map