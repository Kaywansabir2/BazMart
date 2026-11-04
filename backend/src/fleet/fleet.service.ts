import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FleetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAllDrivers(warehouseId?: string) {
    const where: any = {};
    if (warehouseId && warehouseId !== 'all') {
      where.warehouseId = warehouseId;
    }

    const drivers = await this.prisma.driver.findMany({
      where,
      include: {
        warehouse: true,
        assignedOrders: {
          where: {
            orderStatus: { in: ['PACKING_IN_DARKSTORE', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'] },
          },
          select: {
            id: true,
            orderNumber: true,
            totalIqd: true,
            paymentMethod: true,
            orderStatus: true,
            estimatedDeliveryMinutes: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return drivers.map(d => ({
      id: d.id,
      fullName: d.fullName,
      phone: d.phone,
      vehicleType: d.vehicleType,
      plateNumber: d.plateNumber,
      warehouseId: d.warehouseId,
      warehouseName: d.warehouse?.name,
      warehouseCity: d.warehouse?.city,
      status: d.status,
      cashInHandIqd: d.cashInHandIqd,
      averageRating: d.averageRating,
      totalRatingsCount: d.totalRatingsCount,
      activeOrder: d.assignedOrders[0] || null,
      createdAt: d.createdAt,
    }));
  }

  async getDriverById(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        warehouse: true,
        assignedOrders: {
          include: {
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID "${id}" not found.`);
    }

    return driver;
  }

  async createDriver(data: {
    fullName: string;
    phone: string;
    vehicleType: string;
    plateNumber: string;
    warehouseId: string;
  }) {
    return this.prisma.driver.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        vehicleType: data.vehicleType || 'Motorcycle',
        plateNumber: data.plateNumber,
        warehouseId: data.warehouseId,
        status: 'AVAILABLE',
        cashInHandIqd: 0,
      },
    });
  }

  async updateDriver(id: string, data: Partial<{
    fullName: string;
    phone: string;
    vehicleType: string;
    plateNumber: string;
    warehouseId: string;
    status: string;
  }>) {
    return this.prisma.driver.update({
      where: { id },
      data,
    });
  }

  async assignOrderToDriver(orderId: string, driverId: string) {
    const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver "${driverId}" not found.`);
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found.`);
    }

    // Update order with driver details & update driver status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        driverId,
        assignedDriverName: driver.fullName,
        assignedDriverPhone: driver.phone,
        orderStatus: 'OUT_FOR_DELIVERY',
        outForDeliveryAt: new Date(),
        estimatedDeliveryMinutes: '12-15 mins',
      },
      include: {
        items: { include: { product: true } },
      },
    });

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { status: 'BUSY_DELIVERING' },
    });

    await this.notificationsService.triggerOrderNotification(orderId, 'OUT_FOR_DELIVERY', {
      driverName: driver.fullName,
    }).catch(() => {});

    return updatedOrder;
  }

  async updateDeliveryStatus(orderId: string, status: string, driverId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { driver: true },
    });

    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found.`);
    }

    const validStatuses = ['PICKED_UP', 'ARRIVED_AT_CUSTOMER', 'DELIVERED', 'DELIVERED_COD_COLLECTED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid delivery status "${status}". Allowed: ${validStatuses.join(', ')}`);
    }

    const effectiveDriverId = driverId || order.driverId;

    if (status === 'PICKED_UP') {
      const updated = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'OUT_FOR_DELIVERY',
          pickedUpAt: new Date(),
          outForDeliveryAt: new Date(),
          estimatedDeliveryMinutes: '10-12 mins',
        },
      });

      await this.notificationsService.triggerOrderNotification(orderId, 'OUT_FOR_DELIVERY', {
        driverName: order.driver?.fullName || order.assignedDriverName,
      }).catch(() => {});

      return updated;
    }

    if (status === 'ARRIVED_AT_CUSTOMER') {
      return this.prisma.order.update({
        where: { id: orderId },
        data: {
          estimatedDeliveryMinutes: 'Arrived at your door',
        },
      });
    }

    if (status === 'DELIVERED' || status === 'DELIVERED_COD_COLLECTED') {
      // Complete order
      const isCod = order.paymentMethod === 'COD';
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'DELIVERED',
          paymentStatus: 'PAID',
          deliveredAt: new Date(),
          estimatedDeliveryMinutes: 'Delivered',
        },
      });

      // If COD, driver collected cash in hand
      if (effectiveDriverId) {
        await this.prisma.driver.update({
          where: { id: effectiveDriverId },
          data: {
            status: 'AVAILABLE',
            ...(isCod ? { cashInHandIqd: { increment: order.totalIqd } } : {}),
          },
        });
      }

      await this.notificationsService.triggerOrderNotification(orderId, 'DELIVERED', {
        driverName: order.driver?.fullName || order.assignedDriverName,
      }).catch(() => {});

      return updatedOrder;
    }

    return order;
  }

  async settleDriverCash(driverId: string) {
    const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver "${driverId}" not found.`);
    }

    const settledAmount = driver.cashInHandIqd;

    const updatedDriver = await this.prisma.driver.update({
      where: { id: driverId },
      data: { cashInHandIqd: 0 },
    });

    return {
      success: true,
      driverId,
      driverName: driver.fullName,
      settledAmountIqd: settledAmount,
      remainingCashInHandIqd: 0,
      settledAt: new Date().toISOString(),
      receiptNumber: `SETTLE-${Date.now().toString().slice(-6)}`,
      driver: updatedDriver,
    };
  }

  async getDriverAssignedOrders(driverId: string) {
    return this.prisma.order.findMany({
      where: {
        OR: [
          { driverId },
          { assignedDriverName: { contains: driverId } },
        ],
      },
      include: {
        items: {
          include: { product: true },
        },
        warehouse: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}

