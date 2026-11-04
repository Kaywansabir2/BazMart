import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeIraqiPhone } from '../common/iraqi-phone.util';

export interface CreateNotificationDto {
  customerId?: string;
  customerPhone?: string;
  orderId?: string;
  type: string;
  titleEn: string;
  titleCkb: string;
  titleAr: string;
  bodyEn: string;
  bodyCkb: string;
  bodyAr: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Automatically trigger a localized order notification on status transition
   */
  async triggerOrderNotification(
    orderId: string,
    status: string,
    options?: { driverName?: string; totalIqd?: number },
  ) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true, driver: true },
      });

      if (!order) return null;

      const orderNumber = order.orderNumber;
      const totalIqd = options?.totalIqd ?? order.totalIqd;
      const formattedTotal = totalIqd.toLocaleString();
      const driverName = options?.driverName || order.driver?.fullName || order.assignedDriverName || 'Karwan Ahmed';
      const customerPhone = order.customer?.phone;
      const customerId = order.customerId;

      let notifData: CreateNotificationDto | null = null;

      if (status === 'PLACED') {
        notifData = {
          customerId: customerId ?? undefined,
          customerPhone: customerPhone ?? undefined,
          orderId: order.id,
          type: 'ORDER_PLACED',
          titleEn: `Order #${orderNumber} Confirmed!`,
          titleCkb: `داواکاری #${orderNumber} پەسەند کرا!`,
          titleAr: `تم تأكيد الطلب #${orderNumber}!`,
          bodyEn: `We received your order (IQD ${formattedTotal}). Our dark store pickers are starting now.`,
          bodyCkb: `داواکارییەکەت بە بڕی IQD ${formattedTotal} وەرگیرا و لە کۆگا ئامادە دەکرێت.`,
          bodyAr: `استلمنا طلبك بقيمة IQD ${formattedTotal}. بدأ فريق التجهيز في المتجر المظلم الآن.`,
        };
      } else if (status === 'PACKING_IN_DARKSTORE' || status === 'READY_FOR_PICKUP') {
        notifData = {
          customerId: customerId ?? undefined,
          customerPhone: customerPhone ?? undefined,
          orderId: order.id,
          type: 'ORDER_PACKING',
          titleEn: 'Packing Your Groceries 🛒',
          titleCkb: 'ئامادەکردنی کاڵاکان 🛒',
          titleAr: 'جاري تجهيز طلبك 🛒',
          bodyEn: 'Your items are being scanned and packed at BazMart Dark Store.',
          bodyCkb: 'کاڵاکانت لە کۆگای بازمارت خەریکی پێچانەوەن.',
          bodyAr: 'يتم فحص وتغليف منتجاتك في متجر بازمارت الآن.',
        };
      } else if (status === 'OUT_FOR_DELIVERY') {
        notifData = {
          customerId: customerId ?? undefined,
          customerPhone: customerPhone ?? undefined,
          orderId: order.id,
          type: 'ORDER_OUT_FOR_DELIVERY',
          titleEn: 'Rider is on the Way! 🛵',
          titleCkb: 'شۆفێر بەڕێوەیە بۆ لات! 🛵',
          titleAr: 'السائق في الطريق إليك! 🛵',
          bodyEn: `Courier ${driverName} picked up your order and will arrive in ~15 mins.`,
          bodyCkb: `شۆفێر ${driverName} داواکارییەکەی وەرگرت و لە ماوەی ١٥ خولەکدا دەگات.`,
          bodyAr: `استلم المندوب ${driverName} طلبك وسوف يصل خلال 15 دقيقة تقريباً.`,
        };
      } else if (status === 'DELIVERED') {
        notifData = {
          customerId: customerId ?? undefined,
          customerPhone: customerPhone ?? undefined,
          orderId: order.id,
          type: 'ORDER_DELIVERED',
          titleEn: 'Order Delivered! 🎉',
          titleCkb: 'داواکارییەکەت گەیشت! 🎉',
          titleAr: 'تم تسليم الطلب! 🎉',
          bodyEn: 'Enjoy your groceries! Tap to rate your experience and rider.',
          bodyCkb: 'نۆشی گیانت بێت! کلیک بکە بۆ هەڵسەنگاندنی خزمەتگوزاری و شۆفێرەکە.',
          bodyAr: 'بالعافية! اضغط لتقييم تجربتك مع بازمارت والسائق.',
        };
      }

      if (notifData) {
        const created = await this.prisma.notification.create({
          data: notifData,
        });
        this.logger.log(`Created notification [${notifData.type}] for order #${orderNumber}`);
        return created;
      }
    } catch (e) {
      this.logger.error(`Failed to trigger notification for order ${orderId}: ${e.message}`);
    }
    return null;
  }

  /**
   * Get notifications for a customer (or phone), plus broadcast notifications
   */
  async getNotifications(params: { phone?: string; customerId?: string; type?: string }) {
    let normalizedPhone: string | undefined;
    if (params.phone) {
      try {
        normalizedPhone = normalizeIraqiPhone(params.phone);
      } catch {
        normalizedPhone = params.phone;
      }
    }

    const orConditions: any[] = [
      { customerId: null, customerPhone: null }, // Broadcast notifications
    ];

    if (params.customerId) {
      orConditions.push({ customerId: params.customerId });
    }
    if (normalizedPhone) {
      orConditions.push({ customerPhone: normalizedPhone });
      orConditions.push({ customerPhone: { contains: normalizedPhone.replace('+964', '') } });
    }

    const where: any = { OR: orConditions };
    if (params.type && params.type !== 'ALL') {
      if (params.type === 'ORDERS') {
        where.type = { in: ['ORDER_PLACED', 'ORDER_PACKING', 'ORDER_OUT_FOR_DELIVERY', 'ORDER_DELIVERED'] };
      } else if (params.type === 'PROMOS') {
        where.type = { in: ['PROMO_OFFER', 'PRICE_DROP'] };
      } else {
        where.type = params.type;
      }
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return {
      success: true,
      unreadCount,
      totalCount: notifications.length,
      notifications,
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification "${id}" not found.`);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return { success: true, notification: updated };
  }

  /**
   * Mark all notifications as read for a given phone or customer
   */
  async markAllAsRead(phone?: string, customerId?: string) {
    const where: any = {};
    if (phone) {
      const normalized = normalizeIraqiPhone(phone);
      where.OR = [
        { customerPhone: normalized },
        { customerPhone: { contains: normalized.replace('+964', '') } },
        { customerId: null }, // broadcast
      ];
    } else if (customerId) {
      where.OR = [{ customerId }, { customerId: null }];
    }

    await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * Admin Broadcast Promo Notification
   */
  async broadcastNotification(data: {
    titleEn: string;
    titleCkb?: string;
    titleAr?: string;
    bodyEn: string;
    bodyCkb?: string;
    bodyAr?: string;
    type?: string;
  }) {
    const created = await this.prisma.notification.create({
      data: {
        type: data.type || 'PROMO_OFFER',
        titleEn: data.titleEn,
        titleCkb: data.titleCkb || data.titleEn,
        titleAr: data.titleAr || data.titleEn,
        bodyEn: data.bodyEn,
        bodyCkb: data.bodyCkb || data.bodyEn,
        bodyAr: data.bodyAr || data.bodyEn,
        isRead: false,
      },
    });

    this.logger.log(`Broadcasted promo notification: "${data.titleEn}"`);
    return { success: true, notification: created };
  }
}

