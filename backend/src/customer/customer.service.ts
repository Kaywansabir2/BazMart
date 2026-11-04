import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeIraqiPhone } from '../common/iraqi-phone.util';

export interface UpdateProfileDto {
  name?: string;
  preferredLanguage?: string;
}

export interface AddressDto {
  title?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  building?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to find or resolve customer by phone or customerId
   */
  async resolveCustomer(identifier: { phone?: string; customerId?: string }) {
    if (identifier.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: identifier.customerId },
        include: { addresses: true },
      });
      if (customer) return customer;
    }

    if (identifier.phone) {
      const normalized = normalizeIraqiPhone(identifier.phone);
      const customer = await this.prisma.customer.findUnique({
        where: { phone: normalized },
        include: { addresses: true },
      });
      if (customer) return customer;
    }

    throw new NotFoundException({
      statusCode: 404,
      error: 'CUSTOMER_NOT_FOUND',
      message: 'Customer account not found.',
      messageCkb: 'هەژماری بەکارهێنەر نەدۆزرایەوە.',
      messageAr: 'لم يتم العثور على حساب العميل.',
    });
  }

  /**
   * Get Customer Profile
   */
  async getProfile(identifier: { phone?: string; customerId?: string }) {
    const customer = await this.resolveCustomer(identifier);
    const orderCount = await this.prisma.order.count({
      where: {
        customerId: customer.id,
        orderStatus: { notIn: ['CANCELLED'] },
      },
    });

    return {
      success: true,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        preferredLanguage: customer.preferredLanguage,
        orderCount,
        addresses: customer.addresses,
        createdAt: customer.createdAt,
      },
    };
  }

  /**
   * Update Profile
   */
  async updateProfile(identifier: { phone?: string; customerId?: string }, dto: UpdateProfileDto) {
    const customer = await this.resolveCustomer(identifier);

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : customer.name,
        preferredLanguage: dto.preferredLanguage || customer.preferredLanguage,
      },
      include: { addresses: true },
    });

    return {
      success: true,
      customer: updated,
    };
  }

  /**
   * Get Saved Addresses
   */
  async getAddresses(identifier: { phone?: string; customerId?: string }) {
    const customer = await this.resolveCustomer(identifier);
    return {
      success: true,
      addresses: customer.addresses,
    };
  }

  /**
   * Add Saved Address
   */
  async addAddress(identifier: { phone?: string; customerId?: string }, dto: AddressDto) {
    const customer = await this.resolveCustomer(identifier);

    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const isFirstAddress = customer.addresses.length === 0;

    const newAddress = await this.prisma.customerAddress.create({
      data: {
        customerId: customer.id,
        title: dto.title || 'Home',
        city: dto.city || 'Erbil',
        neighborhood: dto.neighborhood || 'Dream City',
        street: dto.street || 'Street 10',
        building: dto.building || 'Villa 42',
        landmark: dto.landmark || null,
        latitude: dto.latitude || 36.1901,
        longitude: dto.longitude || 44.0091,
        isDefault: dto.isDefault !== undefined ? dto.isDefault : isFirstAddress,
      },
    });

    return {
      success: true,
      address: newAddress,
    };
  }

  /**
   * Update Saved Address
   */
  async updateAddress(
    identifier: { phone?: string; customerId?: string },
    addressId: string,
    dto: AddressDto,
  ) {
    const customer = await this.resolveCustomer(identifier);

    const existing = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId: customer.id },
    });

    if (!existing) {
      throw new NotFoundException('Address not found or does not belong to customer.');
    }

    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.customerAddress.update({
      where: { id: addressId },
      data: {
        title: dto.title ?? existing.title,
        city: dto.city ?? existing.city,
        neighborhood: dto.neighborhood ?? existing.neighborhood,
        street: dto.street ?? existing.street,
        building: dto.building ?? existing.building,
        landmark: dto.landmark ?? existing.landmark,
        latitude: dto.latitude ?? existing.latitude,
        longitude: dto.longitude ?? existing.longitude,
        isDefault: dto.isDefault ?? existing.isDefault,
      },
    });

    return {
      success: true,
      address: updated,
    };
  }

  /**
   * Delete Address
   */
  async deleteAddress(identifier: { phone?: string; customerId?: string }, addressId: string) {
    const customer = await this.resolveCustomer(identifier);

    const existing = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId: customer.id },
    });

    if (!existing) {
      throw new NotFoundException('Address not found or does not belong to customer.');
    }

    await this.prisma.customerAddress.delete({
      where: { id: addressId },
    });

    // If deleted was default, make another one default if exists
    if (existing.isDefault) {
      const remaining = await this.prisma.customerAddress.findFirst({
        where: { customerId: customer.id },
      });
      if (remaining) {
        await this.prisma.customerAddress.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return {
      success: true,
      message: 'Address deleted successfully.',
    };
  }

  /**
   * Get Past Orders
   */
  async getOrders(identifier: { phone?: string; customerId?: string }) {
    const customer = await this.resolveCustomer(identifier);

    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { customerId: customer.id },
          { customer: { phone: customer.phone } },
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      orders,
    };
  }

  /**
   * 1-Tap Reorder
   */
  async reorder(
    identifier: { phone?: string; customerId?: string },
    orderId: string,
    targetWarehouseId?: string,
  ) {
    const customer = await this.resolveCustomer(identifier);

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { customerId: customer.id },
          { customer: { phone: customer.phone } },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                stocks: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or does not belong to customer.');
    }

    const warehouseId = targetWarehouseId || order.warehouseId || 'erbil-central-darkstore';

    // Validate stock and latest prices
    const reorderItems = [];
    for (const item of order.items) {
      const prod = item.product;
      const stock = prod.stocks.find((s) => s.warehouseId === warehouseId);
      const availableQty = stock ? stock.stockQuantity : 0;
      const effectivePrice = prod.discountedPriceIqd ?? prod.originalPriceIqd;

      reorderItems.push({
        productId: prod.id,
        externalErpId: prod.externalErpId,
        titleEn: prod.titleEn,
        titleCkb: prod.titleCkb,
        titleAr: prod.titleAr,
        imageUrl: prod.imageUrl,
        unitPriceIqd: effectivePrice,
        requestedQuantity: item.quantity,
        availableStock: availableQty,
        canAdd: availableQty > 0,
        quantityToAdd: Math.min(item.quantity, Math.max(1, availableQty)),
      });
    }

    return {
      success: true,
      reorderItems,
      originalOrderId: order.id,
      orderNumber: order.orderNumber,
      messageEn: 'Reorder cart prepared with current stock & prices.',
      messageCkb: 'داواکاری ئامادەکرا بەپێی عەمبار و نرخی ئێستا.',
      messageAr: 'تم تجهيز سلة إعادة الطلب بالأسعار والمخزون الحالي.',
    };
  }

  /**
   * Personalized Products (Buy Again & Grab Your Usuals)
   */
  async getPersonalizedProducts(
    identifier: { phone?: string; customerId?: string },
    limit: number = 8,
  ) {
    let customer = null;
    try {
      customer = await this.resolveCustomer(identifier);
    } catch {
      // Guest or not found
    }

    let products: any[] = [];

    if (customer) {
      // Find products previously ordered by this customer
      const pastOrderItems = await this.prisma.orderItem.findMany({
        where: {
          order: {
            OR: [
              { customerId: customer.id },
              { customer: { phone: customer.phone } },
            ],
            orderStatus: { notIn: ['CANCELLED'] },
          },
        },
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
        },
        orderBy: { order: { createdAt: 'desc' } },
        take: 30,
      });

      const seenIds = new Set<string>();
      for (const item of pastOrderItems) {
        if (item.product && !seenIds.has(item.product.id)) {
          seenIds.add(item.product.id);
          products.push(item.product);
          if (products.length >= limit) break;
        }
      }
    }

    // If customer has no past orders or is guest, fall back to core reference products
    if (products.length === 0) {
      const fallbackProducts = await this.prisma.product.findMany({
        where: {
          OR: [
            { id: 'p-alrahma' },
            { id: 'p-ramak' },
            { id: 'p-eggs' },
            { id: 'p-coconut-milk' },
            { isBestSeller: true },
          ],
        },
        include: {
          category: true,
          brand: true,
        },
        take: limit,
      });
      products = fallbackProducts;
    }

    return {
      success: true,
      isPersonalized: customer !== null && products.length > 0,
      products,
    };
  }
}
