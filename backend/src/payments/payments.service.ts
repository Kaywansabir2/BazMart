import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IPaymentGatewayAdapter, PaymentMethodMetadata, PaymentProcessResult } from './payment-gateway.interface';
import { CodPaymentAdapter } from './cod.adapter';
import { FastPayAdapter } from './fastpay.adapter';
import { ZainCashAdapter } from './zaincash.adapter';
import { FibAdapter } from './fib.adapter';
import { SwitchCardAdapter } from './switch-card.adapter';

@Injectable()
export class PaymentsService {
  private readonly adapters = new Map<string, IPaymentGatewayAdapter>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly codAdapter: CodPaymentAdapter,
    private readonly fastPayAdapter: FastPayAdapter,
    private readonly zainCashAdapter: ZainCashAdapter,
    private readonly fibAdapter: FibAdapter,
    private readonly switchCardAdapter: SwitchCardAdapter,
  ) {
    this.registerAdapter(this.codAdapter);
    this.registerAdapter(this.fastPayAdapter);
    this.registerAdapter(this.zainCashAdapter);
    this.registerAdapter(this.fibAdapter);
    this.registerAdapter(this.switchCardAdapter);
  }

  private registerAdapter(adapter: IPaymentGatewayAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  async getPaymentMethods(): Promise<PaymentMethodMetadata[]> {
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

  async togglePaymentConfig(id: string, isEnabled: boolean, credentials?: string) {
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

  getAdapter(id: string): IPaymentGatewayAdapter {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new BadRequestException(`Unsupported payment method "${id}".`);
    }
    return adapter;
  }

  async processPayment(methodId: string, order: {
    orderNumber: string;
    totalIqd: number;
    customerId?: string;
    customerPhone?: string;
  }): Promise<PaymentProcessResult> {
    const adapter = this.getAdapter(methodId);
    return adapter.processPayment(order);
  }
}
