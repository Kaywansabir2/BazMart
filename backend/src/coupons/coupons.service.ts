import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeEasternNumerals } from '../common/linguistic-normalizer';
import { normalizeIraqiPhone, isValidIraqiPhone } from '../common/iraqi-phone.util';

export interface ValidateCouponDto {
  code: string;
  customerPhone?: string;
  warehouseId?: string;
  cartItems: Array<{
    productId: string;
    quantity: number;
    unitPriceIqd?: number;
  }>;
}

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active, non-expired public coupons
   */
  async getAvailableCoupons(customerPhone?: string) {
    const now = new Date();
    let cleanPhone = customerPhone ? normalizeEasternNumerals(customerPhone).trim() : null;
    if (cleanPhone && isValidIraqiPhone(cleanPhone)) {
      cleanPhone = normalizeIraqiPhone(cleanPhone);
    }

    const coupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        expiresAt: { gt: now },
      },
      orderBy: { minOrderSubtotalIqd: 'asc' },
    });

    // Filter out coupons where global or personal usage limit is reached
    const available = [];
    for (const c of coupons) {
      if (c.usageLimitGlobal && c.currentUsageCount >= c.usageLimitGlobal) {
        continue;
      }
      if (cleanPhone) {
        const userRedemptions = await this.prisma.couponRedemption.count({
          where: { couponId: c.id, customerPhone: cleanPhone },
        });
        if (userRedemptions >= c.usageLimitPerCustomer) {
          continue;
        }
        if (c.firstOrderOnly) {
          const pastOrders = await this.prisma.order.count({
            where: { customer: { phone: cleanPhone } },
          });
          if (pastOrders > 0) {
            continue;
          }
        }
      }
      available.push({
        id: c.id,
        code: c.code,
        titleEn: c.titleEn,
        titleCkb: c.titleCkb,
        titleAr: c.titleAr,
        descriptionEn: c.descriptionEn,
        descriptionCkb: c.descriptionCkb,
        descriptionAr: c.descriptionAr,
        discountType: c.discountType,
        discountValue: c.discountValue,
        maxDiscountIqd: c.maxDiscountIqd,
        minOrderSubtotalIqd: c.minOrderSubtotalIqd,
        firstOrderOnly: c.firstOrderOnly,
        expiresAt: c.expiresAt,
      });
    }

    return available;
  }

  /**
   * Validate a promo code against cart items and customer rules
   */
  async validateCoupon(dto: ValidateCouponDto) {
    if (!dto.code || !dto.code.trim()) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'COUPON_CODE_REQUIRED',
        message: 'Please enter a valid promo code.',
      });
    }

    const cleanCode = normalizeEasternNumerals(dto.code).trim().toUpperCase();
    let cleanPhone = dto.customerPhone ? normalizeEasternNumerals(dto.customerPhone).trim() : null;
    if (cleanPhone && isValidIraqiPhone(cleanPhone)) {
      cleanPhone = normalizeIraqiPhone(cleanPhone);
    }

    const coupon = await this.prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'COUPON_NOT_FOUND',
        message: `Promo code "${cleanCode}" does not exist.`,
        messageCkb: `کۆدی داشکاندن "${cleanCode}" بوونی نییە.`,
        messageAr: `كود الخصم "${cleanCode}" غير موجود.`,
      });
    }

    if (!coupon.isActive) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'COUPON_INACTIVE',
        message: `Promo code "${cleanCode}" is no longer active.`,
        messageCkb: `کۆدی "${cleanCode}" ناچالاک کراوە.`,
        messageAr: `كود الخصم "${cleanCode}" غير فعال حالياً.`,
      });
    }

    const now = new Date();
    if (coupon.expiresAt <= now) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'COUPON_EXPIRED',
        message: `Promo code "${cleanCode}" has expired.`,
        messageCkb: `کۆدی "${cleanCode}" بەسەرچووە.`,
        messageAr: `كود الخصم "${cleanCode}" منتهي الصلاحية.`,
      });
    }

    if (coupon.startsAt > now) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'COUPON_NOT_STARTED',
        message: `Promo code "${cleanCode}" is not valid yet.`,
        messageCkb: `کۆدی "${cleanCode}" هێشتا دەستی پێ نەکردووە.`,
        messageAr: `كود الخصم "${cleanCode}" لم يبدأ بعد.`,
      });
    }

    if (coupon.usageLimitGlobal && coupon.currentUsageCount >= coupon.usageLimitGlobal) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'COUPON_LIMIT_REACHED',
        message: `Promo code "${cleanCode}" has reached its maximum total redemptions.`,
        messageCkb: `کۆدی "${cleanCode}" گەیشتووەتە زۆرترین ژمارەی بەکارهێنان.`,
        messageAr: `وصل كود الخصم "${cleanCode}" إلى الحد الأقصى للاستخدام.`,
      });
    }

    if (cleanPhone) {
      const userRedemptions = await this.prisma.couponRedemption.count({
        where: { couponId: coupon.id, customerPhone: cleanPhone },
      });
      if (userRedemptions >= coupon.usageLimitPerCustomer) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'COUPON_USER_LIMIT_REACHED',
          message: `You have already used promo code "${cleanCode}" the maximum number of times.`,
          messageCkb: `تۆ پێشتر کۆدی "${cleanCode}"ت بەکار هێناوە بەپێی ڕێژەی دیاریکراو.`,
          messageAr: `لقد استخدمت كود الخصم "${cleanCode}" بالحد الأقصى المسموح لك.`,
        });
      }

      if (coupon.firstOrderOnly) {
        const pastOrders = await this.prisma.order.count({
          where: {
            customer: { phone: cleanPhone },
            orderStatus: { notIn: ['CANCELLED'] },
          },
        });
        if (pastOrders > 0) {
          throw new BadRequestException({
            statusCode: 400,
            error: 'FIRST_ORDER_ONLY',
            message: `Promo code "${cleanCode}" is valid for new customers on their first order only.`,
            messageCkb: `کۆدی "${cleanCode}" تەنها بۆ یەکەمین داواکاری کڕیارە نوێیەکان کار دەکات.`,
            messageAr: `كود الخصم "${cleanCode}" صالح للعملاء الجدد في طلبهم الأول فقط.`,
          });
        }
      }
    }

    // Calculate Cart Subtotal strictly from database
    const productIds = (dto.cartItems || []).map((i) => i.productId);
    const dbProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        brand: true,
      },
    });

    // Helper to parse ID lists (JSON array or comma-separated)
    const parseIdList = (val?: string | null): string[] => {
      if (!val || !val.trim()) return [];
      const trimmed = val.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim().toLowerCase());
        } catch {}
      }
      return trimmed.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
    };

    const allowedCats = parseIdList(coupon.applicableCategoryIds);
    const allowedBrands = parseIdList(coupon.applicableBrandIds);

    let subtotalIqd = 0;
    let eligibleSubtotalIqd = 0;

    for (const item of dto.cartItems || []) {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod) continue;

      const unitPrice = prod.discountedPriceIqd ?? prod.originalPriceIqd;
      const itemTotal = unitPrice * item.quantity;
      subtotalIqd += itemTotal;

      // Check category restriction (match by ID or slug)
      let isCategoryAllowed = true;
      if (allowedCats.length > 0) {
        const catId = prod.categoryId?.toLowerCase() ?? '';
        const catSlug = prod.category?.slug?.toLowerCase() ?? '';
        isCategoryAllowed = (catId && allowedCats.includes(catId)) || (catSlug && allowedCats.includes(catSlug));
      }

      // Check brand restriction (match by ID or name)
      let isBrandAllowed = true;
      if (allowedBrands.length > 0) {
        const bId = prod.brandId?.toLowerCase() ?? '';
        const bName = prod.brand?.name?.toLowerCase() ?? '';
        isBrandAllowed = (bId && allowedBrands.includes(bId)) || (bName && allowedBrands.includes(bName));
      }

      // Check exclusion of already discounted items
      let isDiscountExcluded = false;
      if (coupon.excludeDiscountedItems && prod.discountedPriceIqd != null && prod.discountedPriceIqd < prod.originalPriceIqd) {
        isDiscountExcluded = true;
      }

      if (isCategoryAllowed && isBrandAllowed && !isDiscountExcluded) {
        eligibleSubtotalIqd += itemTotal;
      }
    }

    // Minimum subtotal requirement check (evaluated on pre-coupon basket subtotal)
    if (subtotalIqd < coupon.minOrderSubtotalIqd) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'MIN_ORDER_SUBTOTAL_NOT_MET',
        message: `Minimum order subtotal of IQD ${coupon.minOrderSubtotalIqd.toLocaleString()} required to apply ${coupon.code}.`,
        messageCkb: `پێویستە کەمترین کۆی سەبەتە ${coupon.minOrderSubtotalIqd.toLocaleString()} د.ع بێت بۆ بەکارهێنانی ${coupon.code}.`,
        messageAr: `الحد الأدنى للطلب هو ${coupon.minOrderSubtotalIqd.toLocaleString()} د.ع لاستخدام ${coupon.code}.`,
        requiredMinIqd: coupon.minOrderSubtotalIqd,
        currentSubtotalIqd: subtotalIqd,
      });
    }

    // Check if any items are eligible for this coupon
    if (eligibleSubtotalIqd === 0 && (allowedCats.length > 0 || allowedBrands.length > 0 || coupon.excludeDiscountedItems)) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'NO_ELIGIBLE_ITEMS',
        message: `No items in your cart are eligible for coupon "${coupon.code}" (already discounted items or non-applicable categories).`,
        messageCkb: `هیچ کاڵایەک لە سەبەتەکەتدا شایستەی کۆدی "${coupon.code}" نییە (کاڵای داشکاو یان لە دەرەوەی بەشە دیاریکراوەکانە).`,
        messageAr: `لا توجد منتجات في سلتك مؤهلة لكود الخصم "${coupon.code}" (منتجات مخفضة مسبقاً أو غير مشمولة).`,
      });
    }

    // Calculate Discount Amount
    let discountIqd = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      const rawDiscount = Math.round((eligibleSubtotalIqd * coupon.discountValue) / 100);
      discountIqd = coupon.maxDiscountIqd ? Math.min(rawDiscount, coupon.maxDiscountIqd) : rawDiscount;
    } else if (coupon.discountType === 'FIXED_IQD') {
      discountIqd = Math.min(coupon.discountValue, eligibleSubtotalIqd > 0 ? eligibleSubtotalIqd : subtotalIqd);
    } else if (coupon.discountType === 'FREE_DELIVERY') {
      discountIqd = 500; // Standard BazMart delivery fee is 500 IQD
    }

    // Ensure integer rounding with zero decimals
    discountIqd = Math.round(discountIqd);
    const newTotalIqd = Math.max(0, subtotalIqd - discountIqd);

    return {
      isValid: true,
      couponId: coupon.id,
      code: coupon.code,
      titleEn: coupon.titleEn,
      titleCkb: coupon.titleCkb,
      titleAr: coupon.titleAr,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountIqd: coupon.maxDiscountIqd,
      couponDiscountIqd: discountIqd,
      subtotalIqd,
      newTotalIqd,
      messageEn: `Code ${coupon.code} applied! You saved IQD ${discountIqd.toLocaleString()}`,
      messageCkb: `کۆدی ${coupon.code} جێبەجێکرا! ${discountIqd.toLocaleString()} د.ع داشکاندن کرا`,
      messageAr: `تم تطبيق الكوبون ${coupon.code}! تم خصم ${discountIqd.toLocaleString()} د.ع`,
    };
  }

  /**
   * Admin: List all coupons with redemption statistics
   */
  async getAllCoupons() {
    return this.prisma.coupon.findMany({
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Create a new promotional coupon
   */
  async createCoupon(data: {
    code: string;
    titleEn: string;
    titleCkb?: string;
    titleAr?: string;
    descriptionEn?: string;
    discountType: string;
    discountValue: number;
    maxDiscountIqd?: number;
    minOrderSubtotalIqd?: number;
    firstOrderOnly?: boolean;
    applicableCategoryIds?: string | string[];
    applicableBrandIds?: string | string[];
    excludeDiscountedItems?: boolean;
    usageLimitGlobal?: number;
    usageLimitPerCustomer?: number;
    expiresAt: string | Date;
    isActive?: boolean;
  }) {
    const cleanCode = normalizeEasternNumerals(data.code).trim().toUpperCase();

    const formattedCats = Array.isArray(data.applicableCategoryIds)
      ? JSON.stringify(data.applicableCategoryIds)
      : data.applicableCategoryIds || null;
    const formattedBrands = Array.isArray(data.applicableBrandIds)
      ? JSON.stringify(data.applicableBrandIds)
      : data.applicableBrandIds || null;

    return this.prisma.coupon.upsert({
      where: { code: cleanCode },
      update: {
        titleEn: data.titleEn,
        titleCkb: data.titleCkb || data.titleEn,
        titleAr: data.titleAr || data.titleEn,
        descriptionEn: data.descriptionEn || '',
        descriptionCkb: data.descriptionEn || '',
        descriptionAr: data.descriptionEn || '',
        discountType: data.discountType,
        discountValue: Math.round(Number(data.discountValue)),
        maxDiscountIqd: data.maxDiscountIqd ? Math.round(Number(data.maxDiscountIqd)) : null,
        minOrderSubtotalIqd: data.minOrderSubtotalIqd ? Math.round(Number(data.minOrderSubtotalIqd)) : 0,
        firstOrderOnly: Boolean(data.firstOrderOnly),
        applicableCategoryIds: formattedCats,
        applicableBrandIds: formattedBrands,
        excludeDiscountedItems: Boolean(data.excludeDiscountedItems),
        usageLimitGlobal: data.usageLimitGlobal ? Math.round(Number(data.usageLimitGlobal)) : null,
        usageLimitPerCustomer: data.usageLimitPerCustomer ? Math.round(Number(data.usageLimitPerCustomer)) : 1,
        expiresAt: new Date(data.expiresAt),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
      create: {
        code: cleanCode,
        titleEn: data.titleEn,
        titleCkb: data.titleCkb || data.titleEn,
        titleAr: data.titleAr || data.titleEn,
        descriptionEn: data.descriptionEn || '',
        descriptionCkb: data.descriptionEn || '',
        descriptionAr: data.descriptionEn || '',
        discountType: data.discountType,
        discountValue: Math.round(Number(data.discountValue)),
        maxDiscountIqd: data.maxDiscountIqd ? Math.round(Number(data.maxDiscountIqd)) : null,
        minOrderSubtotalIqd: data.minOrderSubtotalIqd ? Math.round(Number(data.minOrderSubtotalIqd)) : 0,
        firstOrderOnly: Boolean(data.firstOrderOnly),
        applicableCategoryIds: formattedCats,
        applicableBrandIds: formattedBrands,
        excludeDiscountedItems: Boolean(data.excludeDiscountedItems),
        usageLimitGlobal: data.usageLimitGlobal ? Math.round(Number(data.usageLimitGlobal)) : null,
        usageLimitPerCustomer: data.usageLimitPerCustomer ? Math.round(Number(data.usageLimitPerCustomer)) : 1,
        startsAt: new Date(),
        expiresAt: new Date(data.expiresAt),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
  }

  /**
   * Admin: Toggle Active status
   */
  async toggleCouponActive(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id "${id}" not found`);
    }
    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
  }
}

