// backend/scripts/generate_400_seed_and_mock.js
const fs = require('fs');
const path = require('path');

const p1 = require('./catalog_part1.js');
const p2 = require('./catalog_part2.js');
const allProducts = [...p1, ...p2];

console.log(`Total catalog products loaded: ${allProducts.length}`);

const brandsMap = {
  'b-alrahma': 'Al Rahma',
  'b-ramak': 'Ramak',
  'b-almarai': 'Almarai',
  'b-maggi': 'Maggi',
  'b-parex': 'Parex',
  'b-kinder': 'Kinder',
  'b-nescafe': 'Nescafe',
  'b-dolce': 'Nescafe Dolce Gusto',
  'b-johnwest': 'John West',
  'b-vaseline': 'Vaseline',
  'b-sanita': 'Sanita',
  'b-coke': 'Coca-Cola',
  'b-kiri': 'Kiri',
  'b-puck': 'Puck',
  'b-nada': 'Nada',
};

// -------------------------------------------------------------
// 1. GENERATE backend/prisma/seed.ts
// -------------------------------------------------------------
function generateSeedTs() {
  const seedContent = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BazMart ERP Database with 400 SKUs (20 items x 20 categories)...');

  // 1. WAREHOUSES (DARK STORES)
  const warehouseErbil = await prisma.warehouse.upsert({
    where: { id: 'erbil-central-darkstore' },
    update: {},
    create: {
      id: 'erbil-central-darkstore',
      name: 'Erbil Central Dark Store',
      city: 'Erbil',
      latitude: 36.1901,
      longitude: 44.0091,
      deliveryRadiusKm: 20.0,
      minOrderIqd: 7000,
      deliveryFeeIqd: 0,
      isActive: true,
    },
  });

  const warehouseSuly = await prisma.warehouse.upsert({
    where: { id: 'suly-main-darkstore' },
    update: {},
    create: {
      id: 'suly-main-darkstore',
      name: 'Sulaymaniyah Main Dark Store',
      city: 'Sulaymaniyah',
      latitude: 35.5558,
      longitude: 45.4351,
      deliveryRadiusKm: 18.0,
      minOrderIqd: 7000,
      deliveryFeeIqd: 0,
      isActive: true,
    },
  });

  // 2. CATEGORIES (20 Categories matching Talabat Mart reference catalog)
  const categoriesData = [
    { id: 'cat-fruit-veg', slug: 'fruit-veg', nameEn: 'Fruit & Veg', nameCkb: 'میوە و سەوزە', nameAr: 'فواكه وخضروات', sortOrder: 1 },
    { id: 'cat-bakery', slug: 'bakery', nameEn: 'Bakery', nameCkb: 'نانەواخانە', nameAr: 'المخبوزات', sortOrder: 2 },
    { id: 'cat-meat', slug: 'poultry-meat-seafood', nameEn: 'Poultry, Meat & Seafood', nameCkb: 'مریشک و گۆشت و ماسی', nameAr: 'لحوم ودواجن وأسماك', sortOrder: 3 },
    { id: 'cat-frozen', slug: 'frozen-food', nameEn: 'Frozen Food', nameCkb: 'خۆراکی بەستوو', nameAr: 'أطعمة مجمدة', sortOrder: 4 },
    { id: 'cat-dairy', slug: 'dairy-eggs', nameEn: 'Dairy & Eggs', nameCkb: 'شیرەمەنی و هێلکە', nameAr: 'ألبان وبيض', sortOrder: 5 },
    { id: 'cat-beverages', slug: 'beverages', nameEn: 'Beverages', nameCkb: 'خواردنەوەکان', nameAr: 'المشروبات والعصائر', sortOrder: 6 },
    { id: 'cat-snacks', slug: 'snacks-chocolate', nameEn: 'Snacks & Chocolate', nameCkb: 'چەرەسات و نەستەلە', nameAr: 'وجبات خفيفة وشوكولاتة', sortOrder: 7 },
    { id: 'cat-coffee', slug: 'coffee-tea', nameEn: 'Coffee & Tea', nameCkb: 'قاوە و چا', nameAr: 'قهوة وشاي', sortOrder: 8 },
    { id: 'cat-milk', slug: 'milk', nameEn: 'Milk', nameCkb: 'شیر', nameAr: 'حليب', sortOrder: 9 },
    { id: 'cat-breakfast', slug: 'breakfast-food', nameEn: 'Breakfast Food', nameCkb: 'خوانی بەیانیان', nameAr: 'فطور الصباح', sortOrder: 10 },
    { id: 'cat-ready', slug: 'ready-to-eat', nameEn: 'Ready To Eat', nameCkb: 'خۆراکی ئامادەکراو', nameAr: 'وجبات جاهزة', sortOrder: 11 },
    { id: 'cat-cooking', slug: 'cooking-baking', nameEn: 'Cooking & Baking', nameCkb: 'کەرەستەی چێشتلێنان', nameAr: 'مستلزمات الطبخ والخبز', sortOrder: 12 },
    { id: 'cat-icecream', slug: 'ice-cream', nameEn: 'Ice Cream', nameCkb: 'دۆندرمە و ئایسکرێم', nameAr: 'آيس كريم', sortOrder: 13 },
    { id: 'cat-spices', slug: 'condiments-spices', nameEn: 'Condiments & Spices', nameCkb: 'بەهارات و بەرهەمی تام', nameAr: 'بهارات وتوابل', sortOrder: 14 },
    { id: 'cat-personal', slug: 'personal-care', nameEn: 'Personal Care', nameCkb: 'چاودێری کەسی', nameAr: 'العناية الشخصية', sortOrder: 15 },
    { id: 'cat-household', slug: 'household-cleaning', nameEn: 'Household & Cleaning', nameCkb: 'پاککەرەوە و ماڵ', nameAr: 'مستلزمات التنظيف', sortOrder: 16 },
    { id: 'cat-baby', slug: 'baby-care', nameEn: 'Baby Care', nameCkb: 'پێداویستی منداڵ', nameAr: 'عناية الطفل', sortOrder: 17 },
    { id: 'cat-pet', slug: 'pet-supplies', nameEn: 'Pet Supplies', nameCkb: 'پێداویستی ئاژەڵ', nameAr: 'مستلزمات الحيوانات', sortOrder: 18 },
    { id: 'cat-water', slug: 'water', nameEn: 'Water', nameCkb: 'ئاو', nameAr: 'مياه شرب', sortOrder: 19 },
    { id: 'cat-stationery', slug: 'stationery', nameEn: 'Stationery', nameCkb: 'پێداویستی خوێندنگە', nameAr: 'قرطاسية', sortOrder: 20 },
  ];

  for (const c of categoriesData) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { nameEn: c.nameEn, nameCkb: c.nameCkb, nameAr: c.nameAr, sortOrder: c.sortOrder },
      create: c,
    });
  }

  // 3. BRANDS (15 Brands)
  const brandsData = [
    { id: 'b-maggi', name: 'Maggi', bgColorHex: '#FFCC00', sortOrder: 1 },
    { id: 'b-parex', name: 'Parex', bgColorHex: '#9C27B0', sortOrder: 2 },
    { id: 'b-kinder', name: 'Kinder', bgColorHex: '#E53935', sortOrder: 3 },
    { id: 'b-dolce', name: 'Nescafe Dolce Gusto', bgColorHex: '#5D4037', sortOrder: 4 },
    { id: 'b-johnwest', name: 'John West', bgColorHex: '#1B5E20', sortOrder: 5 },
    { id: 'b-vaseline', name: 'Vaseline', bgColorHex: '#0288D1', sortOrder: 6 },
    { id: 'b-sanita', name: 'Sanita', bgColorHex: '#D32F2F', sortOrder: 7 },
    { id: 'b-coke', name: 'Coca-Cola', bgColorHex: '#F44336', sortOrder: 8 },
    { id: 'b-alrahma', name: 'Al Rahma', bgColorHex: '#2196F3', sortOrder: 9 },
    { id: 'b-ramak', name: 'Ramak', bgColorHex: '#4CAF50', sortOrder: 10 },
    { id: 'b-almarai', name: 'Almarai', bgColorHex: '#0055A5', sortOrder: 11 },
    { id: 'b-nescafe', name: 'Nescafe', bgColorHex: '#D32F2F', sortOrder: 12 },
    { id: 'b-kiri', name: 'Kiri', bgColorHex: '#0083CA', sortOrder: 13 },
    { id: 'b-puck', name: 'Puck', bgColorHex: '#006DB6', sortOrder: 14 },
    { id: 'b-nada', name: 'Nada', bgColorHex: '#009639', sortOrder: 15 },
  ];

  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { id: b.id },
      update: { name: b.name, bgColorHex: b.bgColorHex, sortOrder: b.sortOrder },
      create: b,
    });
  }

  // 4. COUNTRY ORIGINS ("Around the world")
  const countriesData = [
    { id: 'c-krd', code: 'KRD', nameEn: 'Kurdistan Region', nameCkb: 'کوردستان', nameAr: 'إقليم كوردستان' },
    { id: 'c-eu', code: 'EU', nameEn: 'European Union', nameCkb: 'یەکێتی ئەوروپا', nameAr: 'الاتحاد الأوروبي' },
    { id: 'c-usa', code: 'USA', nameEn: 'United States', nameCkb: 'ئەمریکا', nameAr: 'الولايات المتحدة' },
    { id: 'c-kor', code: 'KOR', nameEn: 'South Korea', nameCkb: 'کۆریای باشوور', nameAr: 'كوريا الجنوبية' },
  ];

  for (const co of countriesData) {
    await prisma.countryOrigin.upsert({
      where: { id: co.id },
      update: { nameEn: co.nameEn, nameCkb: co.nameCkb, nameAr: co.nameAr },
      create: co,
    });
  }

  // 5. PRODUCTS (400 Unique SKUs across 20 categories)
  const products = ${JSON.stringify(allProducts.map(p => ({
    id: p.id,
    externalErpId: p.erp,
    barcode: p.bar,
    titleEn: p.en,
    titleCkb: p.ckb,
    titleAr: p.ar,
    descriptionEn: `${p.en} - Premium quality grocery essential delivered fast from BazMart dark store.`,
    descriptionCkb: `${p.ckb} - کاڵای کوالێتی بەرز بە خێرایی لە بازماڕتەوە.`,
    descriptionAr: `${p.ar} - منتجات عالية الجودة مع توصيل سريع من باز مارت.`,
    unitText: p.unit,
    storageTemp: p.temp,
    categoryId: p.cat,
    brandId: p.brand,
    countryOriginId: p.co,
    originalPriceIqd: p.price,
    discountedPriceIqd: p.disc ? p.disc : null,
    discountPercentage: p.pct || null,
    imageUrl: `assets/products/${p.img}.png`,
    isFreshPick: p.fp || false,
    isBestSeller: p.ts || false,
    isTopSaver: !!p.disc,
    stock: p.stock
  })), null, 2)};

  console.log('Clearing old orders, warehouse stock, and products to cleanly seed 400 catalog SKUs...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.warehouseStock.deleteMany({});
  await prisma.product.deleteMany({});

  console.log(\`Upserting \${products.length} products with dark store stock...\`);
  for (const item of products) {
    const { stock, ...productData } = item;
    const p = await prisma.product.upsert({
      where: { id: productData.id },
      update: productData,
      create: productData,
    });

    // Create stock for Erbil dark store
    await prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: 'erbil-central-darkstore',
          productId: p.id,
        },
      },
      update: { stockQuantity: stock },
      create: {
        warehouseId: 'erbil-central-darkstore',
        productId: p.id,
        stockQuantity: stock,
      },
    });

    // Create stock for Sulaymaniyah dark store
    const sulyStock = Math.max(15, Math.floor(stock * 0.9));
    await prisma.warehouseStock.upsert({
      where: {
        warehouseId_productId: {
          warehouseId: 'suly-main-darkstore',
          productId: p.id,
        },
      },
      update: { stockQuantity: sulyStock },
      create: {
        warehouseId: 'suly-main-darkstore',
        productId: p.id,
        stockQuantity: sulyStock,
      },
    });
  }

  // 6. CAMPAIGN BANNERS (Vertical Cards & Horizontal Banners)
  const bannersData = [
    {
      id: 'b-promo-1',
      type: 'VERTICAL_PROMO_CARD',
      titleEn: 'Up to 30% off',
      titleCkb: 'داشکاندن تا ٣٠٪',
      titleAr: 'خصم يصل إلى ٣٠٪',
      subtitle: 'Hot Deals Mega Weekly Savers',
      badgeText: 'Hot Deals',
      linkedCategoryId: 'cat-fruit-veg',
      bgColorHex: '#FBF4ED',
      sortOrder: 1,
    },
    {
      id: 'b-promo-2',
      type: 'VERTICAL_PROMO_CARD',
      titleEn: 'Kiri Cream Cheese',
      titleCkb: 'پەنیری کیری',
      titleAr: 'جبنة كيري',
      subtitle: 'Cream Cheese 6P & 12P',
      badgeText: 'Kiri',
      linkedBrandId: 'b-kiri',
      bgColorHex: '#F3F7FF',
      sortOrder: 2,
    },
    {
      id: 'b-promo-3',
      type: 'VERTICAL_PROMO_CARD',
      titleEn: 'Kurdistan Chicken',
      titleCkb: 'مریشکی کوردی',
      titleAr: 'دجاج محلي',
      subtitle: 'Fresh Breast Fillet & Thighs',
      badgeText: 'Kurdistan Chicken',
      linkedCategoryId: 'cat-meat',
      bgColorHex: '#F6F8F3',
      sortOrder: 3,
    },
    {
      id: 'b-promo-4',
      type: 'VERTICAL_PROMO_CARD',
      titleEn: 'Nescafe Instant',
      titleCkb: 'نێسکافێ',
      titleAr: 'نسكافيه',
      subtitle: '3-in-1 Red Mug Pack',
      badgeText: 'Nescafe',
      linkedBrandId: 'b-nescafe',
      bgColorHex: '#FFF3F0',
      sortOrder: 4,
    },
    {
      id: 'b-promo-5',
      type: 'VERTICAL_PROMO_CARD',
      titleEn: 'Nada Fresh Milk',
      titleCkb: 'شیری نادا',
      titleAr: 'حليب ندى',
      subtitle: 'Dairy Essentials Daily',
      badgeText: 'Nada',
      linkedBrandId: 'b-nada',
      bgColorHex: '#F2F8F5',
      sortOrder: 5,
    },
    {
      id: 'b-promo-6',
      type: 'VERTICAL_PROMO_CARD',
      titleEn: 'Puck Dairy & Cheese',
      titleCkb: 'پەنیر و کەرەی بوک',
      titleAr: 'أجبان بوك',
      subtitle: 'Breakfast Delights',
      badgeText: 'Puck',
      linkedBrandId: 'b-puck',
      bgColorHex: '#FFF8E1',
      sortOrder: 6,
    },
    {
      id: 'b-banner-pepsi',
      type: 'FULL_WIDTH_BANNER',
      titleEn: 'Enjoy Ice-Cold Pepsi & Dew Today',
      titleCkb: 'لەگەڵ پێپسی و دیو تینوێتیت بشکێنە',
      titleAr: 'استمتع بالانتعاش مع بيبسي وماونتن ديو',
      subtitle: 'Delivered ice-cold in 15-20 minutes',
      badgeText: 'Instant Cold',
      linkedCategoryId: 'cat-beverages',
      bgColorHex: '#004B93',
      sortOrder: 1,
    },
  ];

  for (const bn of bannersData) {
    await prisma.campaignBanner.upsert({
      where: { id: bn.id },
      update: bn,
      create: bn,
    });
  }

  // 7. DRIVERS (6 In-House Fleet Riders across Erbil & Sulaymaniyah)
  const driversData = [
    { id: 'drv-karwan', fullName: 'Karwan Ahmed', phone: '+964 750 123 4567', vehicleType: 'Motorcycle', plateNumber: 'ERB-4592', warehouseId: 'erbil-central-darkstore', status: 'ON_DELIVERY', cashInHandIqd: 25000 },
    { id: 'drv-diyar', fullName: 'Diyar Omer', phone: '+964 750 234 5678', vehicleType: 'Motorcycle', plateNumber: 'ERB-8831', warehouseId: 'erbil-central-darkstore', status: 'AVAILABLE', cashInHandIqd: 10000 },
    { id: 'drv-shwan', fullName: 'Shwan Kamal', phone: '+964 750 345 6789', vehicleType: 'Motorcycle', plateNumber: 'ERB-1209', warehouseId: 'erbil-central-darkstore', status: 'AVAILABLE', cashInHandIqd: 0 },
    { id: 'drv-aram', fullName: 'Aram Jalal', phone: '+964 770 567 8901', vehicleType: 'Motorcycle', plateNumber: 'SLI-3412', warehouseId: 'suly-main-darkstore', status: 'ON_DELIVERY', cashInHandIqd: 15000 },
    { id: 'drv-mohammed', fullName: 'Mohammed Farhad', phone: '+964 750 678 9012', vehicleType: 'Motorcycle', plateNumber: 'SLI-9014', warehouseId: 'suly-main-darkstore', status: 'AVAILABLE', cashInHandIqd: 50000 },
    { id: 'drv-hiwa', fullName: 'Hiwa Rostam', phone: '+964 770 789 0123', vehicleType: 'Motorcycle', plateNumber: 'SLI-6743', warehouseId: 'suly-main-darkstore', status: 'ON_DELIVERY', cashInHandIqd: 20000 },
  ];

  for (const d of driversData) {
    await prisma.driver.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    });
  }

  // 8. PAYMENT CONFIGS
  const paymentGateways = [
    { id: 'COD', name: 'Cash on Delivery', isEnabled: true },
    { id: 'FASTPAY', name: 'FastPay Wallet', isEnabled: true },
    { id: 'FIB', name: 'First Iraqi Bank (FIB)', isEnabled: true },
    { id: 'ZAINCASH', name: 'ZainCash', isEnabled: true },
    { id: 'CARD', name: 'Visa / MasterCard', isEnabled: true },
  ];

  for (const p of paymentGateways) {
    await prisma.paymentConfig.upsert({
      where: { id: p.id },
      update: { name: p.name, isEnabled: p.isEnabled },
      create: p,
    });
  }

  // 9. 15 REALISTIC ACTIVE & HISTORICAL ORDERS ACROSS ALL STATUSES
  const ordersData = [
    {
      id: 'order-101',
      orderNumber: 'BM-10041',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Home',
        city: 'Erbil',
        neighborhood: 'Dream City',
        street: 'Street 10',
        building: 'Villa 42',
        landmark: 'Near Italian Village Gate',
        latitude: 36.1901,
        longitude: 44.0091,
      }),
      subtotalIqd: 9000,
      discountTotalIqd: 0,
      deliveryFeeIqd: 0,
      totalIqd: 9000,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_COD',
      orderStatus: 'PLACED',
      assignedDriverName: 'Karwan Ahmed',
      assignedDriverPhone: '+964 750 123 4567',
      estimatedDeliveryMinutes: '15-20 mins',
      isPacked: false,
      items: [
        { productId: 'p-alrahma', quantity: 4, unitPriceIqd: 2250, totalIqd: 9000 },
      ],
    },
    {
      id: 'order-102',
      orderNumber: 'BM-10042',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Office',
        city: 'Erbil',
        neighborhood: 'Empire World',
        street: 'Diamond Tower',
        building: 'Floor 7, Suite 704',
        landmark: 'Opposite Gulan Media',
        latitude: 36.2050,
        longitude: 43.9980,
      }),
      subtotalIqd: 14500,
      discountTotalIqd: 1200,
      deliveryFeeIqd: 0,
      totalIqd: 14500,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_COD',
      orderStatus: 'PACKING_IN_DARKSTORE',
      assignedDriverName: 'Karwan Ahmed',
      assignedDriverPhone: '+964 750 123 4567',
      estimatedDeliveryMinutes: '15-20 mins',
      isPacked: false,
      items: [
        { productId: 'p-cucumber', quantity: 2, unitPriceIqd: 1445, totalIqd: 2890 },
        { productId: 'p-tabasco-chicken', quantity: 4, unitPriceIqd: 850, totalIqd: 3400 },
        { productId: 'p-nescafe-latte', quantity: 2, unitPriceIqd: 1850, totalIqd: 3700 },
        { productId: 'p-mountain-dew', quantity: 10, unitPriceIqd: 287, totalIqd: 2870 },
      ],
    },
    {
      id: 'order-103',
      orderNumber: 'BM-10043',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Apartment',
        city: 'Erbil',
        neighborhood: 'Bakhtiari',
        street: '100m Road',
        building: 'Tower C, Apt 12',
        landmark: 'Beside Family Mall',
        latitude: 36.1990,
        longitude: 44.0150,
      }),
      subtotalIqd: 24500,
      discountTotalIqd: 3000,
      deliveryFeeIqd: 0,
      totalIqd: 24500,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_COD',
      orderStatus: 'OUT_FOR_DELIVERY',
      driverId: 'drv-diyar',
      assignedDriverName: 'Diyar Omer',
      assignedDriverPhone: '+964 750 234 5678',
      estimatedDeliveryMinutes: '8 mins away',
      isPacked: true,
      items: [
        { productId: 'p-ramak', quantity: 5, unitPriceIqd: 2000, totalIqd: 10000 },
        { productId: 'p-cucumber', quantity: 4, unitPriceIqd: 1445, totalIqd: 5780 },
        { productId: 'p-tabasco-beef', quantity: 4, unitPriceIqd: 1000, totalIqd: 4000 },
        { productId: 'p-pen', quantity: 9, unitPriceIqd: 500, totalIqd: 4500 },
      ],
    },
    {
      id: 'order-104',
      orderNumber: 'BM-10044',
      warehouseId: 'suly-main-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Home',
        city: 'Sulaymaniyah',
        neighborhood: 'Sarchinar',
        street: 'Main Boulevard',
        building: 'House 88',
        landmark: 'Near Sarchinar Park Fountain',
        latitude: 35.5600,
        longitude: 45.3900,
      }),
      subtotalIqd: 18000,
      discountTotalIqd: 1500,
      deliveryFeeIqd: 0,
      totalIqd: 18000,
      paymentMethod: 'FASTPAY',
      paymentStatus: 'PAID',
      orderStatus: 'OUT_FOR_DELIVERY',
      driverId: 'drv-aram',
      assignedDriverName: 'Aram Jalal',
      assignedDriverPhone: '+964 770 567 8901',
      estimatedDeliveryMinutes: '5 mins away',
      isPacked: true,
      items: [
        { productId: 'p-alrahma', quantity: 4, unitPriceIqd: 2250, totalIqd: 9000 },
        { productId: 'p-coconut-milk', quantity: 2, unitPriceIqd: 2500, totalIqd: 5000 },
        { productId: 'p-mountain-dew', quantity: 14, unitPriceIqd: 287, totalIqd: 4000 },
      ],
    },
    {
      id: 'order-105',
      orderNumber: 'BM-10045',
      warehouseId: 'suly-main-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Home',
        city: 'Sulaymaniyah',
        neighborhood: 'Rzgari',
        street: 'Street 4',
        building: 'Villa 19',
        landmark: 'Behind Hiwa Hospital',
        latitude: 35.5500,
        longitude: 45.4200,
      }),
      subtotalIqd: 12500,
      discountTotalIqd: 0,
      deliveryFeeIqd: 0,
      totalIqd: 12500,
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      driverId: 'drv-mohammed',
      assignedDriverName: 'Mohammed Farhad',
      assignedDriverPhone: '+964 750 678 9012',
      estimatedDeliveryMinutes: 'Delivered',
      isPacked: true,
      items: [
        { productId: 'p-ramak', quantity: 5, unitPriceIqd: 2000, totalIqd: 10000 },
        { productId: 'p-pen', quantity: 5, unitPriceIqd: 500, totalIqd: 2500 },
      ],
    },
    {
      id: 'order-106',
      orderNumber: 'BM-10046',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Home',
        city: 'Erbil',
        neighborhood: 'Gulan',
        street: 'Gulan St',
        building: 'Bld 14, Flat 3',
        landmark: 'Near World Trade Center',
        latitude: 36.2080,
        longitude: 44.0010,
      }),
      subtotalIqd: 18800,
      discountTotalIqd: 2000,
      deliveryFeeIqd: 0,
      totalIqd: 18800,
      paymentMethod: 'FIB',
      paymentStatus: 'PAID',
      orderStatus: 'PLACED',
      assignedDriverName: null,
      assignedDriverPhone: null,
      estimatedDeliveryMinutes: '15-20 mins',
      isPacked: false,
      items: [
        { productId: 'p-buldak-carbonara', quantity: 4, unitPriceIqd: 2200, totalIqd: 8800 },
        { productId: 'p-magnum-almond', quantity: 3, unitPriceIqd: 2000, totalIqd: 6000 },
        { productId: 'p-sarchinar-pack', quantity: 1, unitPriceIqd: 2000, totalIqd: 2000 },
        { productId: 'p-pilot-g2-blue', quantity: 1, unitPriceIqd: 2000, totalIqd: 2000 },
      ],
    },
    {
      id: 'order-107',
      orderNumber: 'BM-10047',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Villa',
        city: 'Erbil',
        neighborhood: 'Italian Village 1',
        street: 'Villa 120',
        building: 'Villa 120',
        landmark: 'Main Gate Italian 1',
        latitude: 36.2150,
        longitude: 44.0200,
      }),
      subtotalIqd: 33075,
      discountTotalIqd: 3500,
      deliveryFeeIqd: 0,
      totalIqd: 33075,
      paymentMethod: 'ZAINCASH',
      paymentStatus: 'PAID',
      orderStatus: 'PACKING_IN_DARKSTORE',
      assignedDriverName: 'Karwan Ahmed',
      assignedDriverPhone: '+964 750 123 4567',
      estimatedDeliveryMinutes: '15-20 mins',
      isPacked: false,
      items: [
        { productId: 'p-mahmood-rice', quantity: 1, unitPriceIqd: 10000, totalIqd: 10000 },
        { productId: 'p-afia-corn-oil', quantity: 1, unitPriceIqd: 6000, totalIqd: 6000 },
        { productId: 'p-fairy-lemon', quantity: 2, unitPriceIqd: 2800, totalIqd: 5600 },
        { productId: 'p-ariel-detergent-powder', quantity: 1, unitPriceIqd: 11475, totalIqd: 11475 },
      ],
    },
    {
      id: 'order-108',
      orderNumber: 'BM-10048',
      warehouseId: 'suly-main-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Apartment',
        city: 'Sulaymaniyah',
        neighborhood: 'Salim Street',
        street: 'Salim Boulevard',
        building: 'City Star Tower, Apt 405',
        landmark: 'Beside Grand Millennium Hotel',
        latitude: 35.5650,
        longitude: 45.4150,
      }),
      subtotalIqd: 20400,
      discountTotalIqd: 2500,
      deliveryFeeIqd: 0,
      totalIqd: 20400,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_COD',
      orderStatus: 'OUT_FOR_DELIVERY',
      driverId: 'drv-hiwa',
      assignedDriverName: 'Hiwa Rostam',
      assignedDriverPhone: '+964 770 789 0123',
      estimatedDeliveryMinutes: '6 mins away',
      isPacked: true,
      items: [
        { productId: 'p-kurdish-sumac', quantity: 2, unitPriceIqd: 2000, totalIqd: 4000 },
        { productId: 'p-pomegranate-molasses', quantity: 1, unitPriceIqd: 3200, totalIqd: 3200 },
        { productId: 'p-stuffed-grapeleaves', quantity: 2, unitPriceIqd: 3600, totalIqd: 7200 },
        { productId: 'p-kurdish-booza-pistachio', quantity: 1, unitPriceIqd: 4000, totalIqd: 4000 },
        { productId: 'p-sarchinar-pack', quantity: 1, unitPriceIqd: 2000, totalIqd: 2000 },
      ],
    },
    {
      id: 'order-109',
      orderNumber: 'BM-10049',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Office',
        city: 'Erbil',
        neighborhood: '100m Road',
        street: 'Gulan Intersection',
        building: 'Falcon Complex, 4th Floor',
        landmark: 'Opposite Erbil International Hotel',
        latitude: 36.1920,
        longitude: 44.0110,
      }),
      subtotalIqd: 15600,
      discountTotalIqd: 0,
      deliveryFeeIqd: 0,
      totalIqd: 15600,
      paymentMethod: 'FASTPAY',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      driverId: 'drv-diyar',
      assignedDriverName: 'Diyar Omer',
      assignedDriverPhone: '+964 750 234 5678',
      estimatedDeliveryMinutes: 'Delivered',
      isPacked: true,
      items: [
        { productId: 'p-double-a-paper', quantity: 2, unitPriceIqd: 6800, totalIqd: 13600 },
        { productId: 'p-pilot-g2-blue', quantity: 1, unitPriceIqd: 2000, totalIqd: 2000 },
      ],
    },
    {
      id: 'order-110',
      orderNumber: 'BM-10050',
      warehouseId: 'suly-main-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Home',
        city: 'Sulaymaniyah',
        neighborhood: 'Tuwi Malik',
        street: 'Street 18',
        building: 'House 55',
        landmark: 'Near Malik School',
        latitude: 35.5700,
        longitude: 45.4280,
      }),
      subtotalIqd: 24800,
      discountTotalIqd: 3200,
      deliveryFeeIqd: 0,
      totalIqd: 24800,
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      driverId: 'drv-aram',
      assignedDriverName: 'Aram Jalal',
      assignedDriverPhone: '+964 770 567 8901',
      estimatedDeliveryMinutes: 'Delivered',
      isPacked: true,
      items: [
        { productId: 'p-pampers-size3', quantity: 1, unitPriceIqd: 13200, totalIqd: 13200 },
        { productId: 'p-johnson-baby-shampoo', quantity: 1, unitPriceIqd: 5200, totalIqd: 5200 },
        { productId: 'p-pampers-wipes-aqua', quantity: 2, unitPriceIqd: 3200, totalIqd: 6400 },
      ],
    },
    {
      id: 'order-111',
      orderNumber: 'BM-10051',
      warehouseId: 'suly-main-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Apartment',
        city: 'Sulaymaniyah',
        neighborhood: 'Raberin',
        street: 'Khabat Street',
        building: 'Block 2, Apt 10',
        landmark: 'Behind City Center',
        latitude: 35.5480,
        longitude: 45.4410,
      }),
      subtotalIqd: 10350,
      discountTotalIqd: 1500,
      deliveryFeeIqd: 0,
      totalIqd: 10350,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_COD',
      orderStatus: 'PLACED',
      assignedDriverName: null,
      assignedDriverPhone: null,
      estimatedDeliveryMinutes: '15-20 mins',
      isPacked: false,
      items: [
        { productId: 'p-fresh-hummus', quantity: 2, unitPriceIqd: 1400, totalIqd: 2800 },
        { productId: 'p-falafel-meal', quantity: 2, unitPriceIqd: 2500, totalIqd: 5000 },
        { productId: 'p-tabbouleh-salad', quantity: 1, unitPriceIqd: 2550, totalIqd: 2550 },
      ],
    },
    {
      id: 'order-112',
      orderNumber: 'BM-10052',
      warehouseId: 'suly-main-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Home',
        city: 'Sulaymaniyah',
        neighborhood: 'Zargata',
        street: 'Street 9',
        building: 'House 14',
        landmark: 'Near Public Garden',
        latitude: 35.5620,
        longitude: 45.4300,
      }),
      subtotalIqd: 20000,
      discountTotalIqd: 2000,
      deliveryFeeIqd: 0,
      totalIqd: 20000,
      paymentMethod: 'FIB',
      paymentStatus: 'PAID',
      orderStatus: 'PACKING_IN_DARKSTORE',
      assignedDriverName: 'Mohammed Farhad',
      assignedDriverPhone: '+964 750 678 9012',
      estimatedDeliveryMinutes: '15-20 mins',
      isPacked: false,
      items: [
        { productId: 'p-whiskas-dry-tuna', quantity: 1, unitPriceIqd: 7600, totalIqd: 7600 },
        { productId: 'p-churu-chicken-puree', quantity: 2, unitPriceIqd: 3200, totalIqd: 6400 },
        { productId: 'p-bentonite-cat-litter', quantity: 1, unitPriceIqd: 6000, totalIqd: 6000 },
      ],
    },
    {
      id: 'order-113',
      orderNumber: 'BM-10053',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Home',
        city: 'Erbil',
        neighborhood: 'Ankawa',
        street: 'Chaldean Church Street',
        building: 'House 82',
        landmark: 'Near St. Joseph Cathedral',
        latitude: 36.2280,
        longitude: 43.9920,
      }),
      subtotalIqd: 28000,
      discountTotalIqd: 3000,
      deliveryFeeIqd: 0,
      totalIqd: 28000,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING_COD',
      orderStatus: 'OUT_FOR_DELIVERY',
      driverId: 'drv-shwan',
      assignedDriverName: 'Shwan Kamal',
      assignedDriverPhone: '+964 750 345 6789',
      estimatedDeliveryMinutes: '12 mins away',
      isPacked: true,
      items: [
        { productId: 'p-vaseline-cocoa', quantity: 1, unitPriceIqd: 5200, totalIqd: 5200 },
        { productId: 'p-korean-snail-cream', quantity: 1, unitPriceIqd: 14800, totalIqd: 14800 },
        { productId: 'p-korean-sheet-mask', quantity: 4, unitPriceIqd: 2000, totalIqd: 8000 },
      ],
    },
    {
      id: 'order-114',
      orderNumber: 'BM-10054',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Apartment',
        city: 'Erbil',
        neighborhood: 'Newroz',
        street: 'Kirkuk Road',
        building: 'Newroz Towers, 11th Floor',
        landmark: 'Opposite Newroz Park',
        latitude: 36.1750,
        longitude: 44.0250,
      }),
      subtotalIqd: 18175,
      discountTotalIqd: 2500,
      deliveryFeeIqd: 0,
      totalIqd: 18175,
      paymentMethod: 'ZAINCASH',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      driverId: 'drv-karwan',
      assignedDriverName: 'Karwan Ahmed',
      assignedDriverPhone: '+964 750 123 4567',
      estimatedDeliveryMinutes: 'Delivered',
      isPacked: true,
      items: [
        { productId: 'p-heinz-ketchup', quantity: 1, unitPriceIqd: 2975, totalIqd: 2975 },
        { productId: 'p-heinz-mayo', quantity: 1, unitPriceIqd: 3200, totalIqd: 3200 },
        { productId: 'p-parex-sponge-classic', quantity: 2, unitPriceIqd: 2400, totalIqd: 4800 },
        { productId: 'p-parex-cloth-microfiber', quantity: 2, unitPriceIqd: 3600, totalIqd: 7200 },
      ],
    },
    {
      id: 'order-115',
      orderNumber: 'BM-10055',
      warehouseId: 'erbil-central-darkstore',
      addressSnapshot: JSON.stringify({
        title: 'Villa',
        city: 'Erbil',
        neighborhood: 'English Village',
        street: 'Avenue 5',
        building: 'Villa 77',
        landmark: 'Near Club House',
        latitude: 36.2100,
        longitude: 44.0300,
      }),
      subtotalIqd: 16000,
      discountTotalIqd: 1000,
      deliveryFeeIqd: 0,
      totalIqd: 16000,
      paymentMethod: 'FASTPAY',
      paymentStatus: 'PAID',
      orderStatus: 'PLACED',
      assignedDriverName: null,
      assignedDriverPhone: null,
      estimatedDeliveryMinutes: '15-20 mins',
      isPacked: false,
      items: [
        { productId: 'p-evian-water-500', quantity: 4, unitPriceIqd: 1800, totalIqd: 7200 },
        { productId: 'p-san-pellegrino-500', quantity: 3, unitPriceIqd: 2000, totalIqd: 6000 },
        { productId: 'p-faber-pencils-12', quantity: 1, unitPriceIqd: 2800, totalIqd: 2800 },
      ],
    },
  ];

  for (const o of ordersData) {
    const { items, ...orderHeader } = o;
    const existing = await prisma.order.findUnique({ where: { orderNumber: orderHeader.orderNumber } });
    if (!existing) {
      await prisma.order.create({
        data: {
          ...orderHeader,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceIqd: item.unitPriceIqd,
              totalIqd: item.totalIqd,
              isPacked: orderHeader.isPacked,
            })),
          },
        },
      });
    }
  }

  console.log('Database Seeding Completed Successfully! All 20 categories, 15 brands, 4 countries, 400 products, 6 drivers, payment configs, and 15 orders ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  fs.writeFileSync(path.join(__dirname, '../prisma/seed.ts'), seedContent);
  console.log('Generated backend/prisma/seed.ts successfully.');
}

// -------------------------------------------------------------
// 2. GENERATE mobile-app/lib/core/data/mock_erp_catalog.dart
// -------------------------------------------------------------
function generateMockCatalogDart() {
  const dartProducts = allProducts.map(p => {
    const brandName = brandsMap[p.brand] || 'BazMart Local';
    const sellingPrice = p.disc ? p.disc : p.price;
    const oldPrice = p.disc ? p.price : null;
    const badge = p.pct ? `'Save ${p.pct}%'` : 'null';

    return `    const ProductModel(
      id: '${p.id}',
      externalErpId: '${p.erp}',
      name: '${p.en.replace(/'/g, "\\'")}',
      brand: '${brandName}',
      unit: '${p.unit}',
      priceIqd: ${sellingPrice},
      oldPriceIqd: ${oldPrice !== null ? oldPrice : 'null'},
      discountPercent: ${p.pct !== null && p.pct !== undefined ? p.pct : 'null'},
      stockQuantity: ${p.stock},
      storageTemp: '${p.temp}',
      sku: '${p.erp}',
      barcode: '${p.bar}',
      category: '${p.catEn}',
      imageUrl: 'assets/products/${p.img}.png',
      badgeLabel: ${badge},
      countryOriginId: '${p.co}',
    ),`;
  }).join('\n');

  const dartContent = `import 'package:flutter/material.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/brand_model.dart';
import '../models/country_origin_model.dart';
import '../models/banner_model.dart';

class MockErpCatalog {
  // Top Promo Cards
  static final List<PromoCardModel> promoCards = [
    const PromoCardModel(
      id: 'promo_hot_deals',
      title: 'Up to 30% off',
      bubbleBadge: 'Hot Deals',
      itemSubtitle: 'Mega Weekly Savers',
      imageType: 'hot_deals',
      backgroundColor: Color(0xFFFBF4ED),
      waveColor: Color(0xFFFF5A00),
    ),
    const PromoCardModel(
      id: 'promo_kiri',
      title: 'Kiri',
      bubbleBadge: null,
      itemSubtitle: 'Cream Cheese 6P',
      imageType: 'kiri',
      backgroundColor: Color(0xFFF3F7FF),
      waveColor: Color(0xFF1E88E5),
    ),
    const PromoCardModel(
      id: 'promo_kurdistan_chicken',
      title: 'Kurdistan Chicken',
      bubbleBadge: null,
      itemSubtitle: 'Fresh Breast Fillet',
      imageType: 'kurdistan_chicken',
      backgroundColor: Color(0xFFF6F8F3),
      waveColor: Color(0xFF2E7D32),
    ),
    const PromoCardModel(
      id: 'promo_nescafe',
      title: 'Nescafe',
      bubbleBadge: null,
      itemSubtitle: '3-in-1 Red Mug Pack',
      imageType: 'nescafe',
      backgroundColor: Color(0xFFFFF3F0),
      waveColor: Color(0xFFD32F2F),
    ),
    const PromoCardModel(
      id: 'promo_nada',
      title: 'Nada',
      bubbleBadge: null,
      itemSubtitle: 'Fresh Ayran 1.5L',
      imageType: 'nada',
      backgroundColor: Color(0xFFF2F8F5),
      waveColor: Color(0xFF00897B),
    ),
    const PromoCardModel(
      id: 'promo_puck',
      title: 'Puck',
      bubbleBadge: null,
      itemSubtitle: 'Cream Cheese Spread',
      imageType: 'puck',
      backgroundColor: Color(0xFFFFF8E1),
      waveColor: Color(0xFFF57F17),
    ),
  ];

  // 15 Mapped Brands
  static final List<BrandModel> brands = [
    const BrandModel(
      id: 'brand_maggi',
      name: 'Maggi',
      backgroundColor: Color(0xFFFFEB3B),
      textColor: Color(0xFFD32F2F),
      badgeText: 'MAGGI',
    ),
    const BrandModel(
      id: 'brand_parex',
      name: 'Parex',
      backgroundColor: Color(0xFF7B1FA2),
      textColor: Colors.white,
      badgeText: 'parex',
    ),
    const BrandModel(
      id: 'brand_kinder',
      name: 'Kinder',
      backgroundColor: Color(0xFFFFFAF5),
      textColor: Color(0xFFE53935),
      badgeText: 'Kinder',
    ),
    const BrandModel(
      id: 'brand_nescafe_dg',
      name: 'Nescafe Dolce Gusto',
      backgroundColor: Color(0xFF4E342E),
      textColor: Colors.white,
      badgeText: 'NESCAFE',
    ),
    const BrandModel(
      id: 'brand_john_west',
      name: 'John West',
      backgroundColor: Color(0xFF004D40),
      textColor: Colors.white,
      badgeText: 'JOHN WEST',
    ),
    const BrandModel(
      id: 'brand_vaseline',
      name: 'Vaseline',
      backgroundColor: Color(0xFFE1F5FE),
      textColor: Color(0xFF0277BD),
      badgeText: 'Vaseline',
    ),
    const BrandModel(
      id: 'brand_sanita',
      name: 'Sanita',
      backgroundColor: Color(0xFFFFEBEE),
      textColor: Color(0xFFC62828),
      badgeText: 'Sanita',
    ),
    const BrandModel(
      id: 'brand_coca_cola',
      name: 'Coca-Cola',
      backgroundColor: Color(0xFFFFEBEE),
      textColor: Color(0xFFD32F2F),
      badgeText: 'Coca-Cola',
    ),
    const BrandModel(
      id: 'brand_alrahma',
      name: 'Al Rahma',
      backgroundColor: Color(0xFFE3F2FD),
      textColor: Color(0xFF1565C0),
      badgeText: 'الرحمة',
    ),
    const BrandModel(
      id: 'brand_ramak',
      name: 'Ramak',
      backgroundColor: Color(0xFFE8F5E9),
      textColor: Color(0xFF2E7D32),
      badgeText: 'رامك',
    ),
    const BrandModel(
      id: 'brand_almarai',
      name: 'Almarai',
      backgroundColor: Color(0xFFE1F5FE),
      textColor: Color(0xFF01579B),
      badgeText: 'المراعي',
    ),
    const BrandModel(
      id: 'brand_nescafe',
      name: 'Nescafe',
      backgroundColor: Color(0xFFFFEBEE),
      textColor: Color(0xFFC62828),
      badgeText: 'NESCAFE',
    ),
    const BrandModel(
      id: 'brand_kiri',
      name: 'Kiri',
      backgroundColor: Color(0xFFE1F5FE),
      textColor: Color(0xFF0277BD),
      badgeText: 'كيري',
    ),
    const BrandModel(
      id: 'brand_puck',
      name: 'Puck',
      backgroundColor: Color(0xFFFFF8E1),
      textColor: Color(0xFFF57F17),
      badgeText: 'بوك',
    ),
    const BrandModel(
      id: 'brand_nada',
      name: 'Nada',
      backgroundColor: Color(0xFFE8F5E9),
      textColor: Color(0xFF1B5E20),
      badgeText: 'ندى',
    ),
  ];

  // 4 Country Origins ("Around the world")
  static final List<CountryOriginModel> countryOrigins = [
    const CountryOriginModel(
      id: 'c-krd',
      nameEn: 'Kurdistan Region',
      nameCkb: 'کوردستان',
      nameAr: 'إقليم كوردستان',
      flagType: 'kurdistan',
    ),
    const CountryOriginModel(
      id: 'c-eu',
      nameEn: 'European Union',
      nameCkb: 'یەکێتی ئەوروپا',
      nameAr: 'الاتحاد الأوروبي',
      flagType: 'eu',
    ),
    const CountryOriginModel(
      id: 'c-usa',
      nameEn: 'United States',
      nameCkb: 'ئەمریکا',
      nameAr: 'الولايات المتحدة',
      flagType: 'usa',
    ),
    const CountryOriginModel(
      id: 'c-kor',
      nameEn: 'South Korea',
      nameCkb: 'کۆریای باشوور',
      nameAr: 'كوريا الجنوبية',
      flagType: 'korea',
    ),
  ];

  // 20 Reference Categories
  static final List<CategoryModel> categories = [
    const CategoryModel(id: 'cat-fruit-veg', slug: 'fruit-veg', nameEn: 'Fruit & Veg', nameCkb: 'میوە و سەوزە', nameAr: 'فواكه وخضروات', iconAsset: 'assets/categories/fruit_veg.png'),
    const CategoryModel(id: 'cat-bakery', slug: 'bakery', nameEn: 'Bakery', nameCkb: 'نانەواخانە', nameAr: 'المخبوزات', iconAsset: 'assets/categories/bakery.png'),
    const CategoryModel(id: 'cat-meat', slug: 'poultry-meat-seafood', nameEn: 'Poultry, Meat & Seafood', nameCkb: 'مریشک و گۆشت و ماسی', nameAr: 'لحوم ودواجن وأسماك', iconAsset: 'assets/categories/meat.png'),
    const CategoryModel(id: 'cat-frozen', slug: 'frozen-food', nameEn: 'Frozen Food', nameCkb: 'خۆراکی بەستوو', nameAr: 'أطعمة مجمدة', iconAsset: 'assets/categories/frozen.png'),
    const CategoryModel(id: 'cat-dairy', slug: 'dairy-eggs', nameEn: 'Dairy & Eggs', nameCkb: 'شیرەمەنی و هێلکە', nameAr: 'ألبان وبيض', iconAsset: 'assets/categories/dairy.png'),
    const CategoryModel(id: 'cat-beverages', slug: 'beverages', nameEn: 'Beverages', nameCkb: 'خواردنەوەکان', nameAr: 'المشروبات والعصائر', iconAsset: 'assets/categories/beverages.png'),
    const CategoryModel(id: 'cat-snacks', slug: 'snacks-chocolate', nameEn: 'Snacks & Chocolate', nameCkb: 'چەرەسات و نەستەلە', nameAr: 'وجبات خفيفة وشوكولاتة', iconAsset: 'assets/categories/snacks.png'),
    const CategoryModel(id: 'cat-coffee', slug: 'coffee-tea', nameEn: 'Coffee & Tea', nameCkb: 'قاوە و چا', nameAr: 'قهوة وشاي', iconAsset: 'assets/categories/coffee.png'),
    const CategoryModel(id: 'cat-milk', slug: 'milk', nameEn: 'Milk', nameCkb: 'شیر', nameAr: 'حليب', iconAsset: 'assets/categories/milk.png'),
    const CategoryModel(id: 'cat-breakfast', slug: 'breakfast-food', nameEn: 'Breakfast Food', nameCkb: 'خوانی بەیانیان', nameAr: 'فطور الصباح', iconAsset: 'assets/categories/breakfast.png'),
    const CategoryModel(id: 'cat-ready', slug: 'ready-to-eat', nameEn: 'Ready To Eat', nameCkb: 'خۆراکی ئامادەکراو', nameAr: 'وجبات جاهزة', iconAsset: 'assets/categories/ready_to_eat.png'),
    const CategoryModel(id: 'cat-cooking', slug: 'cooking-baking', nameEn: 'Cooking & Baking', nameCkb: 'کەرەستەی چێشتلێنان', nameAr: 'مستلزمات الطبخ والخبز', iconAsset: 'assets/categories/cooking.png'),
    const CategoryModel(id: 'cat-icecream', slug: 'ice-cream', nameEn: 'Ice Cream', nameCkb: 'دۆندرمە و ئایسکرێم', nameAr: 'آيس كريم', iconAsset: 'assets/categories/icecream.png'),
    const CategoryModel(id: 'cat-spices', slug: 'condiments-spices', nameEn: 'Condiments & Spices', nameCkb: 'بەهارات و بەرهەمی تام', nameAr: 'بهارات وتوابل', iconAsset: 'assets/categories/spices.png'),
    const CategoryModel(id: 'cat-personal', slug: 'personal-care', nameEn: 'Personal Care', nameCkb: 'چاودێری کەسی', nameAr: 'العناية الشخصية', iconAsset: 'assets/categories/personal.png'),
    const CategoryModel(id: 'cat-household', slug: 'household-cleaning', nameEn: 'Household & Cleaning', nameCkb: 'پاککەرەوە و ماڵ', nameAr: 'مستلزمات التنظيف', iconAsset: 'assets/categories/household.png'),
    const CategoryModel(id: 'cat-baby', slug: 'baby-care', nameEn: 'Baby Care', nameCkb: 'پێداویستی منداڵ', nameAr: 'عناية الطفل', iconAsset: 'assets/categories/baby.png'),
    const CategoryModel(id: 'cat-pet', slug: 'pet-supplies', nameEn: 'Pet Supplies', nameCkb: 'پێداویستی ئاژەڵ', nameAr: 'مستلزمات الحيوانات', iconAsset: 'assets/categories/pet.png'),
    const CategoryModel(id: 'cat-water', slug: 'water', nameEn: 'Water', nameCkb: 'ئاو', nameAr: 'مياه شرب', iconAsset: 'assets/categories/water.png'),
    const CategoryModel(id: 'cat-stationery', slug: 'stationery', nameEn: 'Stationery', nameCkb: 'پێداویستی خوێندنگە', nameAr: 'قرطاسية', iconAsset: 'assets/categories/stationery.png'),
  ];

  static List<CategoryModel> get categoriesPage1 => categories.take(12).toList();
  static List<CategoryModel> get categoriesPage2 => categories.skip(12).toList();

  static List<CategoryModel> get allCategories => categories;
  static List<BrandModel> get allBrands => brands;
  static List<CountryOriginModel> get countries => countryOrigins;
  static List<CountryOriginModel> get allCountries => countryOrigins;

  // Master Catalog: All 400 SKUs (20 categories x 20 items)
  static final List<ProductModel> allProducts = [
${dartProducts}
  ];

  // Curated Subsections for Home Screen Display
  static List<ProductModel> get buyAgainProducts => [
    findProductById('p-alrahma')!,
    findProductById('p-ramak')!,
    findProductById('p-eggs')!,
    findProductById('p-almarai')!,
  ];

  static List<ProductModel> get bestSellers => [
    findProductById('p-cucumber')!,
    findProductById('p-mountain-dew')!,
    findProductById('p-ramak')!,
    findProductById('p-tabasco-chicken')!,
  ];

  static List<ProductModel> get topSavers => allProducts.where((p) => p.isOnSale).take(10).toList();

  static List<ProductModel> get freshPicks => allProducts.where((p) => p.category == 'Fruit & Veg').take(8).toList();

  static List<ProductModel> get tabascoNoodles => allProducts.where((p) => p.category == 'Ready To Eat').take(8).toList();

  static List<ProductModel> get nescafeIced => allProducts.where((p) => p.category == 'Coffee & Tea').take(8).toList();

  static List<ProductModel> get frequentlyBoughtTogether => [
    findProductById('p-alrahma')!,
    findProductById('p-cucumber')!,
    findProductById('p-mountain-dew')!,
  ];

  static ProductModel? findProductById(String id) {
    try {
      return allProducts.firstWhere((p) => p.id == id);
    } catch (_) {
      return allProducts.first;
    }
  }
}
`;

  fs.writeFileSync(path.join(__dirname, '../../mobile-app/lib/core/data/mock_erp_catalog.dart'), dartContent);
  console.log('Generated mobile-app/lib/core/data/mock_erp_catalog.dart successfully.');
}

generateSeedTs();
generateMockCatalogDart();
console.log('Both seed.ts and mock_erp_catalog.dart generated with 400 SKUs!');
