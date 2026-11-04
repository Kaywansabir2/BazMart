import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { ErpSyncService } from '../erp-sync/erp-sync.service';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationsService } from '../notifications/notifications.service';
import { validateDeliveryGeofence } from './geofencing';
import { normalizeEasternNumerals } from '../common/linguistic-normalizer';
import { normalizeIraqiPhone, isValidIraqiPhone } from '../common/iraqi-phone.util';

export interface CreateOrderDto {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  warehouseId?: string;
  address: {
    city: string;
    neighborhood: string;
    street?: string;
    building?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    deliveryInstructions?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    expectedPriceIqd?: number;
    expectedStock?: number;
  }>;
  paymentMethod: string; // COD, FASTPAY, FIB, ZAIN_CASH, SWITCH_CARD
  couponCode?: string;
}

interface IdempotentRecord {
  result: { order: any; payment: any };
  timestamp: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  // Idempotency cache with 120-second sliding expiration
  private readonly idempotencyStore = new Map<string, IdempotentRecord>();
  // In-flight concurrency coalesce lock
  private readonly inFlightStore = new Map<string, Promise<{ order: any; payment: any }>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly erpSyncService: ErpSyncService,
    private readonly couponsService: CouponsService,
    private readonly notificationsService: NotificationsService,
  ) {
    // Periodic garbage collector for expired idempotency entries
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.idempotencyStore.entries()) {
        if (now - record.timestamp > 120000) {
          this.idempotencyStore.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Validate Cart items against live DB & ERP inventory before checkout
   */
  async validateCart(dto: {
    warehouseId?: string;
    items: Array<{ productId: string; quantity: number; expectedPriceIqd?: number }>;
  }) {
    const warehouseId = dto.warehouseId || 'erbil-central-darkstore';
    const productIds = dto.items.map(i => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        stocks: {
          where: { warehouseId },
        },
      },
    });

    const outOfStockItems: any[] = [];
    const priceChangedItems: any[] = [];

    for (const itemDto of dto.items) {
      const product = products.find(p => p.id === itemDto.productId);
      if (!product) {
        outOfStockItems.push({
          productId: itemDto.productId,
          reason: 'ITEM_NOT_FOUND',
        });
        continue;
      }

      const currentPrice = Math.round(product.discountedPriceIqd ?? product.originalPriceIqd);
      const stockRec = product.stocks[0];
      const available = stockRec ? Math.max(0, stockRec.stockQuantity - stockRec.reservedQuantity) : 0;

      if (available < itemDto.quantity) {
        outOfStockItems.push({
          productId: product.id,
          titleEn: product.titleEn,
          availableStock: available,
          requestedQuantity: itemDto.quantity,
          reason: 'OUT_OF_STOCK',
        });
      }

      if (itemDto.expectedPriceIqd !== undefined && Math.round(itemDto.expectedPriceIqd) !== currentPrice) {
        priceChangedItems.push({
          productId: product.id,
          titleEn: product.titleEn,
          currentPriceIqd: currentPrice,
          previousPriceIqd: itemDto.expectedPriceIqd,
          reason: 'PRICE_CHANGED',
        });
      }
    }

    const hasChanges = outOfStockItems.length > 0 || priceChangedItems.length > 0;
    return {
      isValid: !hasChanges,
      hasChanges,
      outOfStockItems,
      priceChangedItems,
      updatedItems: [...outOfStockItems, ...priceChangedItems],
    };
  }

  /**
   * Atomic Order Placement with In-Flight Coalescing, Concurrency Locking & Tamper Prevention
   */
  async createOrder(dto: CreateOrderDto, idempotencyKey?: string): Promise<{ order: any; payment: any; isIdempotentReplay?: boolean }> {
    const cleanKey = idempotencyKey ? idempotencyKey.trim() : null;

    if (cleanKey) {
      // 1. Check completed idempotency cache
      const existing = this.idempotencyStore.get(cleanKey);
      if (existing) {
        this.logger.log(`[Idempotency] Returning cached response for key: ${cleanKey}`);
        return {
          ...existing.result,
          isIdempotentReplay: true,
        };
      }

      // 2. Coalesce concurrent in-flight double-taps
      const inFlight = this.inFlightStore.get(cleanKey);
      if (inFlight) {
        this.logger.log(`[Idempotency] Coalescing concurrent in-flight request for key: ${cleanKey}`);
        const result = await inFlight;
        return {
          ...result,
          isIdempotentReplay: true,
        };
      }
    }

    const execution = this.executeCreateOrder(dto);
    if (cleanKey) {
      this.inFlightStore.set(cleanKey, execution);
    }

    try {
      const result = await execution;
      if (cleanKey) {
        this.idempotencyStore.set(cleanKey, {
          result,
          timestamp: Date.now(),
        });
      }
      return result;
    } finally {
      if (cleanKey) {
        this.inFlightStore.delete(cleanKey);
      }
    }
  }

  private async executeCreateOrder(dto: CreateOrderDto): Promise<{ order: any; payment: any }> {

    // 2. Validate Cart Items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    // 3. Normalize Eastern Arabic & Kurdish Numerals in inputs
    if (dto.customerPhone) {
      if (isValidIraqiPhone(dto.customerPhone)) {
        dto.customerPhone = normalizeIraqiPhone(dto.customerPhone);
      } else {
        dto.customerPhone = normalizeEasternNumerals(dto.customerPhone).trim();
      }
    }

    // 4. Geofencing Validation & Automatic Dark Store Branch Routing
    const lat = dto.address?.latitude;
    const lng = dto.address?.longitude;
    const geofenceResult = validateDeliveryGeofence(lat, lng);

    if (!geofenceResult.inZone) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'OUT_OF_DELIVERY_ZONE',
        message: `Outside rapid delivery zone (${geofenceResult.distanceKm} km from nearest dark store). Rapid delivery is available in Erbil, Sulaymaniyah, Duhok, and Baghdad.`,
        closestZone: geofenceResult.closestZoneName,
      });
    }

    // Assign appropriate warehouse
    let warehouseId = dto.warehouseId;
    if (!warehouseId && geofenceResult.matchedZone) {
      warehouseId = geofenceResult.matchedZone.warehouseId;
    }
    if (!warehouseId) {
      const defaultWarehouse = await this.prisma.warehouse.findFirst({
        where: { isActive: true },
      });
      warehouseId = defaultWarehouse ? defaultWarehouse.id : 'erbil-central-darkstore';
    }

    // 5. Fetch Products from Database
    const productIds = dto.items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        stocks: {
          where: { warehouseId },
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products in cart do not exist in catalog.');
    }

    // 6. Mid-Cart ERP Price & Stock Verification
    const midCartChanges: any[] = [];
    for (const itemDto of dto.items) {
      const product = products.find(p => p.id === itemDto.productId)!;
      const unitPrice = Math.round(product.discountedPriceIqd ?? product.originalPriceIqd);
      const stockRec = product.stocks[0];
      const available = stockRec ? Math.max(0, stockRec.stockQuantity - stockRec.reservedQuantity) : 0;

      if (available < itemDto.quantity) {
        midCartChanges.push({
          productId: product.id,
          titleEn: product.titleEn,
          availableStock: available,
          requestedQuantity: itemDto.quantity,
          reason: 'OUT_OF_STOCK',
        });
      }

      if (itemDto.expectedPriceIqd !== undefined && Math.round(itemDto.expectedPriceIqd) !== unitPrice) {
        midCartChanges.push({
          productId: product.id,
          titleEn: product.titleEn,
          currentPriceIqd: unitPrice,
          expectedPriceIqd: itemDto.expectedPriceIqd,
          reason: 'PRICE_CHANGED',
        });
      }
    }

    if (midCartChanges.length > 0) {
      throw new ConflictException({
        statusCode: 409,
        error: 'CART_SYNC_REQUIRED',
        message: 'One or more items in your cart had price or stock changes from our ERP. Please review updated cart.',
        updatedItems: midCartChanges,
      });
    }

    // 7. Calculate Order Totals Strictly from DB (Price Tampering Guard)
    let subtotalIqd = 0;
    let discountTotalIqd = 0;
    const orderItemsData: any[] = [];

    for (const itemDto of dto.items) {
      const product = products.find(p => p.id === itemDto.productId)!;
      // Strictly round to whole Iraqi Dinars (Zero decimals)
      const originalPrice = Math.round(product.originalPriceIqd);
      const discountedPrice = product.discountedPriceIqd ? Math.round(product.discountedPriceIqd) : null;
      const unitPrice = discountedPrice ?? originalPrice;
      const itemSubtotal = unitPrice * itemDto.quantity;

      subtotalIqd += itemSubtotal;
      if (discountedPrice && originalPrice > discountedPrice) {
        discountTotalIqd += (originalPrice - discountedPrice) * itemDto.quantity;
      }

      orderItemsData.push({
        productId: product.id,
        quantity: itemDto.quantity,
        unitPriceIqd: unitPrice,
        totalIqd: itemSubtotal,
        productSnapshot: JSON.stringify({
          titleEn: product.titleEn,
          titleCkb: product.titleCkb,
          titleAr: product.titleAr,
          unitText: product.unitText,
          imageUrl: product.imageUrl,
        }),
      });
    }

    // 8. Strict Minimum Basket Enforcement (IQD 7000)
    const minOrderIqd = 7000;
    if (subtotalIqd < minOrderIqd) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'MIN_ORDER_THRESHOLD_NOT_MET',
        message: `Order subtotal (IQD ${subtotalIqd}) does not meet the minimum order requirement of IQD ${minOrderIqd}.`,
        currentSubtotalIqd: subtotalIqd,
        requiredMinIqd: minOrderIqd,
      });
    }

    // 8.5 Validate Promo Code / Coupon if supplied
    let appliedCoupon: any = null;
    let couponDiscountIqd = 0;
    if (dto.couponCode && dto.couponCode.trim()) {
      appliedCoupon = await this.couponsService.validateCoupon({
        code: dto.couponCode,
        customerPhone: dto.customerPhone,
        warehouseId,
        cartItems: dto.items,
      });
      couponDiscountIqd = appliedCoupon.couponDiscountIqd;
    }

    let deliveryFeeIqd = 0; // Promotional Free Delivery
    if (appliedCoupon && appliedCoupon.discountType === 'FREE_DELIVERY') {
      deliveryFeeIqd = 0;
    }
    const totalIqd = Math.max(0, subtotalIqd - couponDiscountIqd + deliveryFeeIqd);
    const orderNumber = `BM-${Math.floor(10000 + Math.random() * 90000)}`;

    // 9. Payment Strategy Processing
    const paymentResult = await this.paymentsService.processPayment(dto.paymentMethod || 'COD', {
      orderNumber,
      totalIqd,
      customerPhone: dto.customerPhone,
    });

    // 10. Atomic Concurrency Lock & Order Creation Transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Step A: Atomically Lock & Decrement Warehouse Stock
      for (const itemDto of dto.items) {
        const updateResult = await tx.warehouseStock.updateMany({
          where: {
            warehouseId,
            productId: itemDto.productId,
            stockQuantity: { gte: itemDto.quantity }, // Row-level condition prevents oversell
          },
          data: {
            stockQuantity: {
              decrement: itemDto.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new ConflictException({
            statusCode: 409,
            error: 'INSUFFICIENT_STOCK',
            message: `Product ${itemDto.productId} just sold out or has insufficient stock in warehouse "${warehouseId}".`,
          });
        }
      }

      // Step B: Upsert Customer
      let customerId = dto.customerId;
      if (!customerId && dto.customerPhone) {
        const customer = await tx.customer.upsert({
          where: { phone: dto.customerPhone },
          create: {
            phone: dto.customerPhone,
            name: dto.customerName || 'BazMart Customer',
          },
          update: {},
        });
        customerId = customer.id;
      }

      // Step C: Create Order Record
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          warehouseId,
          addressSnapshot: JSON.stringify(dto.address),
          subtotalIqd,
          discountTotalIqd,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          couponDiscountIqd,
          deliveryFeeIqd,
          totalIqd,
          paymentMethod: dto.paymentMethod || 'COD',
          paymentStatus: paymentResult.paymentStatus,
          orderStatus: 'PLACED',
          placedAt: new Date(),
          assignedDriverName: 'Karwan Ahmed',
          assignedDriverPhone: '+964 750 491 8822',
          estimatedDeliveryMinutes: '15 - 20 mins',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Step D: Record Coupon Redemption & Increment Usage
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.couponId },
          data: { currentUsageCount: { increment: 1 } },
        });

        await tx.couponRedemption.create({
          data: {
            couponId: appliedCoupon.couponId,
            orderId: createdOrder.id,
            customerPhone: dto.customerPhone || 'GUEST',
            discountAppliedIqd: couponDiscountIqd,
          },
        });
      }

      return createdOrder;
    });

    // Fire & Forget ERP Sync
    this.erpSyncService.pushCompletedOrderToErp(order).catch(() => {});

    // Trigger initial PLACED order notification
    await this.notificationsService.triggerOrderNotification(order.id, 'PLACED', { totalIqd: order.totalIqd }).catch(() => {});

    const responsePayload = {
      order,
      payment: paymentResult,
    };

    return responsePayload;
  }

  async getOrder(idOrNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { orderNumber: idOrNumber },
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        warehouse: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order "${idOrNumber}" not found.`);
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const dataUpdate: any = { orderStatus: status };
    if (status === 'PACKING_IN_DARKSTORE' || status === 'READY_FOR_PICKUP') {
      dataUpdate.packingAt = new Date();
    } else if (status === 'OUT_FOR_DELIVERY') {
      dataUpdate.outForDeliveryAt = new Date();
    } else if (status === 'DELIVERED') {
      dataUpdate.deliveredAt = new Date();
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: dataUpdate,
    });

    await this.notificationsService.triggerOrderNotification(orderId, status).catch(() => {});

    return updated;
  }
}
