import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCoupons() {
  console.log('Seeding Kurdistan & Iraq promotional coupons...');

  const coupons = [
    {
      code: 'BAZ20',
      titleEn: '20% off orders above IQD 10,000 (Max IQD 5,000)',
      titleCkb: 'داشکاندنی ٢٠٪ بۆ داواکاری سەروو ١٠،٠٠٠ د.ع (زۆرینە ٥،٠٠٠ د.ع)',
      titleAr: 'خصم 20% للطلبات فوق 10,000 د.ع (حد أقصى 5,000 د.ع)',
      descriptionEn: 'Save 20% on your grocery basket up to IQD 5,000 discount',
      descriptionCkb: 'داشکاندنی ٢٠٪ لە بازماڕت بەدەستبهێنە تا ٥،٠٠٠ د.ع',
      descriptionAr: 'وفر 20% على سلة البقالة بحد أقصى 5,000 دينار',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscountIqd: 5000,
      minOrderSubtotalIqd: 10000,
      firstOrderOnly: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      excludeDiscountedItems: false,
      usageLimitGlobal: 1000,
      usageLimitPerCustomer: 3,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 86400000),
      expiresAt: new Date(Date.now() + 86400000 * 30),
      isActive: true,
    },
    {
      code: 'SLEMANI2500',
      titleEn: 'IQD 2,500 instant discount on orders over IQD 8,000',
      titleCkb: 'داشکاندنی دەستبەجێی ٢،٥٠٠ د.ع بۆ داواکاری سەروو ٨،٠٠٠ د.ع',
      titleAr: 'خصم فوري 2,500 د.ع للطلبات فوق 8,000 د.ع',
      descriptionEn: 'Flat IQD 2,500 discount for Sulaymaniyah & Kurdistan customers',
      descriptionCkb: 'داشکاندنی ٢،٥٠٠ د.ع بۆ کڕیارانی سلێمانی و کوردستان',
      descriptionAr: 'خصم 2,500 دينار لزبائن السليمانية وكردستان',
      discountType: 'FIXED_IQD',
      discountValue: 2500,
      maxDiscountIqd: null,
      minOrderSubtotalIqd: 8000,
      firstOrderOnly: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      excludeDiscountedItems: false,
      usageLimitGlobal: 500,
      usageLimitPerCustomer: 2,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 86400000),
      expiresAt: new Date(Date.now() + 86400000 * 30),
      isActive: true,
    },
    {
      code: 'FIRST5000',
      titleEn: 'IQD 5,000 off your very first BazMart order!',
      titleCkb: '٥،٠٠٠ د.ع داشکاندن بۆ یەکەم داواکاری لە بازماڕت!',
      titleAr: 'خصم 5,000 د.ع على طلبك الأول من باز مارت!',
      descriptionEn: 'Welcome bonus for new shoppers on orders above IQD 12,000',
      descriptionCkb: 'دیاری بەخێرهاتن بۆ یەکەمین کڕین سەروو ١٢،٠٠٠ د.ع',
      descriptionAr: 'هدية ترحيبية لأول طلب فوق 12,000 د.ع',
      discountType: 'FIXED_IQD',
      discountValue: 5000,
      maxDiscountIqd: null,
      minOrderSubtotalIqd: 12000,
      firstOrderOnly: true,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      excludeDiscountedItems: false,
      usageLimitGlobal: 1000,
      usageLimitPerCustomer: 1,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 86400000),
      expiresAt: new Date(Date.now() + 86400000 * 60),
      isActive: true,
    },
    {
      code: 'FREEDEL',
      titleEn: 'Free rapid delivery on your order',
      titleCkb: 'گەیاندنی خێرای بێبەرامبەر بۆ داواکارییەکەت',
      titleAr: 'توصيل سريع مجاني لطلبك',
      descriptionEn: 'Enjoy 100% free delivery on orders meeting the IQD 7,000 minimum',
      descriptionCkb: 'گەیاندنی بەلاش لە بازماڕت بۆ کڕینی سەروو ٧،٠٠٠ د.ع',
      descriptionAr: 'توصيل مجاني بالكامل عند استيفاء حد 7,000 د.ع',
      discountType: 'FREE_DELIVERY',
      discountValue: 500,
      maxDiscountIqd: null,
      minOrderSubtotalIqd: 7000,
      firstOrderOnly: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      excludeDiscountedItems: false,
      usageLimitGlobal: 2000,
      usageLimitPerCustomer: 5,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 86400000),
      expiresAt: new Date(Date.now() + 86400000 * 30),
      isActive: true,
    },
    {
      code: 'FRESHONLY15',
      titleEn: '15% off fresh produce (Fruit, Veg & Dairy)',
      titleCkb: 'داشکاندنی ١٥٪ بۆ بەرهەمە تازەکان (میوە، سەوزە و شیرەمەنی)',
      titleAr: 'خصم 15% على المنتجات الطازجة (فواكه، خضار وألبان)',
      descriptionEn: 'Save 15% on fresh category items with no double discounts',
      descriptionCkb: '١٥٪ داشکاندن بۆ بەشەکانی میوە و سەوزە و شیرەمەنی',
      descriptionAr: 'وفر 15% على أصناف الألبان والفواكه والخضار',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscountIqd: 4000,
      minOrderSubtotalIqd: 7000,
      firstOrderOnly: false,
      applicableCategoryIds: '["fruit-veg", "dairy-eggs", "milk"]',
      applicableBrandIds: null,
      excludeDiscountedItems: true,
      usageLimitGlobal: 1000,
      usageLimitPerCustomer: 5,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 86400000),
      expiresAt: new Date(Date.now() + 86400000 * 30),
      isActive: true,
    },
    {
      code: 'EXPIRED10',
      titleEn: '10% off flash sale (Expired)',
      titleCkb: '١٠٪ داشکاندن (بەسەرچوو)',
      titleAr: 'خصم 10% عرض خاطف (منتهي الصلاحية)',
      descriptionEn: 'Flash discount code that has passed its expiration window',
      descriptionCkb: 'کۆدی داشکاندن کە کاتەکەی بەسەرچووە',
      descriptionAr: 'كوبون منتهي الصلاحية للاختبار السلبي',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscountIqd: 3000,
      minOrderSubtotalIqd: 7000,
      firstOrderOnly: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      excludeDiscountedItems: false,
      usageLimitGlobal: 100,
      usageLimitPerCustomer: 1,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 86400000 * 10),
      expiresAt: new Date(Date.now() - 86400000), // Expired in the past!
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    console.log(`- Upserted coupon: ${c.code} (${c.discountType})`);
  }
}

if (require.main === module) {
  seedCoupons()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
      process.exit(1);
    });
}

