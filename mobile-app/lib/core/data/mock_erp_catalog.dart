import 'package:flutter/material.dart';
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
      titleCkb: 'داشکاندن تا ٣٠٪',
      titleAr: 'خصم حتى ٣٠٪',
      bubbleBadge: 'Hot Deals',
      bubbleBadgeCkb: 'داشکاندنی گەرم',
      bubbleBadgeAr: 'عروض مميزة',
      itemSubtitle: 'Mega Weekly Savers',
      itemSubtitleCkb: 'داشکاندنی هەفتانە',
      itemSubtitleAr: 'توفير أسبوعي ضخم',
      imageType: 'hot_deals',
      backgroundColor: Color(0xFFFBF4ED),
      waveColor: Color(0xFFFF5A00),
    ),
    const PromoCardModel(
      id: 'promo_kiri',
      title: 'Kiri',
      titleCkb: 'کیری',
      titleAr: 'كيري',
      bubbleBadge: null,
      itemSubtitle: 'Cream Cheese 6P',
      itemSubtitleCkb: 'پەنیری ٦ پارچە',
      itemSubtitleAr: 'جبنة بالقشطة ٦ قطع',
      imageType: 'kiri',
      backgroundColor: Color(0xFFF3F7FF),
      waveColor: Color(0xFF1E88E5),
    ),
    const PromoCardModel(
      id: 'promo_kurdistan_chicken',
      title: 'Kurdistan Chicken',
      titleCkb: 'مریشکی کوردستان',
      titleAr: 'دجاج كوردستان',
      bubbleBadge: null,
      itemSubtitle: 'Fresh Breast Fillet',
      itemSubtitleCkb: 'سنگی مریشکی فرێش',
      itemSubtitleAr: 'فيليه صدر دجاج طازج',
      imageType: 'kurdistan_chicken',
      backgroundColor: Color(0xFFF6F8F3),
      waveColor: Color(0xFF2E7D32),
    ),
    const PromoCardModel(
      id: 'promo_nescafe',
      title: 'Nescafe',
      titleCkb: 'نیسکافێ',
      titleAr: 'نسكافيه',
      bubbleBadge: null,
      itemSubtitle: '3-in-1 Red Mug Pack',
      itemSubtitleCkb: '٣ لە ١ ڕێد مەگ',
      itemSubtitleAr: '٣ في ١ ريد مج',
      imageType: 'nescafe',
      backgroundColor: Color(0xFFFFF3F0),
      waveColor: Color(0xFFD32F2F),
    ),
    const PromoCardModel(
      id: 'promo_nada',
      title: 'Nada',
      titleCkb: 'نادا',
      titleAr: 'ندى',
      bubbleBadge: null,
      itemSubtitle: 'Fresh Ayran 1.5L',
      itemSubtitleCkb: 'دۆی فرێش ١.٥ لیتر',
      itemSubtitleAr: 'عيران طازج ١.٥ لتر',
      imageType: 'nada',
      backgroundColor: Color(0xFFF2F8F5),
      waveColor: Color(0xFF00897B),
    ),
    const PromoCardModel(
      id: 'promo_puck',
      title: 'Puck',
      titleCkb: 'پۆک',
      titleAr: 'بوك',
      bubbleBadge: null,
      itemSubtitle: 'Cream Cheese Spread',
      itemSubtitleCkb: 'پەنیری کرێم',
      itemSubtitleAr: 'جبنة كريمية قابلة للدهن',
      imageType: 'puck',
      backgroundColor: Color(0xFFFFF8E1),
      waveColor: Color(0xFFF57F17),
    ),
  ];

  // 15 Mapped Brands (Primary 8 for Shop by Brand 2x4 grid: Maggi, Parex, Kinder, Nescafe DG, John West, Vaseline, Sanita, Coca-Cola)
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
      backgroundColor: Color(0xFFF3F7FF),
      textColor: Color(0xFF1E88E5),
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

  // The 20 Canonical Reference Products from Talabat Mart Screenshots
  static final List<ProductModel> canonicalProducts = [
    // 1: Al Rahma Low Fat Milk, 1L
    const ProductModel(
      id: 'p-alrahma',
      externalErpId: 'ERP-SKU-1001',
      name: 'Al Rahma Low Fat Milk, 1L',
      nameCkb: 'شیری کەم چەوری ئەلڕەحمە، ١ لتر',
      nameAr: 'حليب قليل الدسم الرحمة، ١ لتر',
      brand: 'Al Rahma',
      unit: '1 L',
      priceIqd: 2250,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 120,
      storageTemp: 'Stored at 5°',
      sku: 'ERP-SKU-1001',
      barcode: '628100123001',
      category: 'Milk',
      imageUrl: 'assets/products/milk_alrahma.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 2: Ramak Full Fat Milk, 3%Fat
    const ProductModel(
      id: 'p-ramak',
      externalErpId: 'ERP-SKU-1002',
      name: 'Ramak Full Fat Milk, 3%Fat',
      nameCkb: 'شیری پڕ چەوری ڕامەک، ٣٪ چەوری',
      nameAr: 'حليب كامل الدسم راماك، ٣٪ چەوری',
      brand: 'Ramak',
      unit: '1 L',
      priceIqd: 2250,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 140,
      storageTemp: 'Stored at 5°',
      sku: 'ERP-SKU-1002',
      barcode: '628100123002',
      category: 'Milk',
      imageUrl: 'assets/products/milk_ramak.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 3: White Eggs 15 Pieces
    const ProductModel(
      id: 'p-eggs',
      externalErpId: 'ERP-SKU-1003',
      name: 'White Eggs 15 Pieces',
      nameCkb: 'هێلکەی سپی ١٥ دانەیی',
      nameAr: 'بيض أبيض ١٥ حبة',
      brand: 'Al Rahma',
      unit: '15 pcs',
      priceIqd: 3750,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 100,
      storageTemp: 'Stored at 5°',
      sku: 'ERP-SKU-1003',
      barcode: '628100123003',
      category: 'Dairy & Eggs',
      imageUrl: 'assets/products/eggs.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 4: Almarai Full Fat Long Life Milk, 1L
    const ProductModel(
      id: 'p-almarai',
      externalErpId: 'ERP-SKU-1004',
      name: 'Almarai Full Fat Long Life Milk, 1L',
      nameCkb: 'شیری تەواو چەوری درێژخایەنی ئەلمەراعی، ١ لتر',
      nameAr: 'حليب كامل الدسم طويل الأجل المراعي، ١ لتر',
      brand: 'Almarai',
      unit: '1 L',
      priceIqd: 2750,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 95,
      storageTemp: 'Stored at 5°',
      sku: 'ERP-SKU-1004',
      barcode: '628100123004',
      category: 'Milk',
      imageUrl: 'assets/products/milk_almarai.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 5: Cucumber - Local, 1kg
    const ProductModel(
      id: 'p-cucumber',
      externalErpId: 'ERP-SKU-1005',
      name: 'Cucumber - Local, 1kg',
      nameCkb: 'خەیاری کوردی تازە، ١ کگم',
      nameAr: 'خيار بلدي طازج، ١ كغم',
      brand: 'Al Rahma',
      unit: '1 kg',
      priceIqd: 1445,
      oldPriceIqd: 1700,
      discountPercent: 15,
      stockQuantity: 80,
      storageTemp: 'Fresh Room',
      sku: 'ERP-SKU-1005',
      barcode: '628100123005',
      category: 'Fruit & Veg',
      imageUrl: 'assets/products/cucumber.png',
      badgeLabel: 'Save 15%',
      countryOriginId: 'c-krd',
    ),
    // 6: Schneider K15 Ballpoint Pen Blue
    const ProductModel(
      id: 'p-pen',
      externalErpId: 'ERP-SKU-1006',
      name: 'Schneider K15 Ballpoint Pen Blue',
      nameCkb: 'پێنووسی شنایدەر کەی١٥ شین',
      nameAr: 'قلم جاف شنايدر أزرق',
      brand: 'Parex',
      unit: '1 Pc',
      priceIqd: 400,
      oldPriceIqd: 500,
      discountPercent: 20,
      stockQuantity: 150,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1006',
      barcode: '628100123006',
      category: 'Stationery',
      imageUrl: 'assets/products/pen.png',
      badgeLabel: 'Save 20%',
      countryOriginId: 'c-eu',
    ),
    // 7: Mountain Dew Can, 330ml
    const ProductModel(
      id: 'p-mountain-dew',
      externalErpId: 'ERP-SKU-1007',
      name: 'Mountain Dew Can, 330ml',
      nameCkb: 'ماونتن دیو قتوو، ٣٣٠ مل',
      nameAr: 'ماونتن ديو علبة، ٣٣٠ مل',
      brand: 'Coca-Cola',
      unit: '330 ml',
      priceIqd: 595,
      oldPriceIqd: 700,
      discountPercent: 15,
      stockQuantity: 200,
      storageTemp: 'Chilled',
      sku: 'ERP-SKU-1007',
      barcode: '628100123007',
      category: 'Beverages',
      imageUrl: 'assets/products/mountain_dew.png',
      badgeLabel: 'Save 15%',
      countryOriginId: 'c-usa',
    ),
    // 8: Schauma 7 Herbs Fresh Shampoo, 400ml
    const ProductModel(
      id: 'p-schauma',
      externalErpId: 'ERP-SKU-1008',
      name: 'Schauma 7 Herbs Fresh Shampoo, 400ml',
      nameCkb: 'شامپۆی شاوما ٧ گیای فرێش، ٤٠٠ مل',
      nameAr: 'شامبو شاوما ٧ أعشاب، ٤٠٠ مل',
      brand: 'Vaseline',
      unit: '400 ml',
      priceIqd: 2800,
      oldPriceIqd: 3500,
      discountPercent: 20,
      stockQuantity: 65,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1008',
      barcode: '628100123008',
      category: 'Personal Care',
      imageUrl: 'assets/products/shampoo.png',
      badgeLabel: 'Save 20%',
      countryOriginId: 'c-eu',
    ),
    // 9: Shallot - Iran, 500g
    const ProductModel(
      id: 'p-shallot',
      externalErpId: 'ERP-SKU-1009',
      name: 'Shallot - Iran, 500g',
      nameCkb: 'شەلۆت (پیازی بچووکی ئێرانی)، ٥٠٠ گم',
      nameAr: 'بصل شالوت إيراني، ٥٠٠ غرام',
      brand: 'Al Rahma',
      unit: '500 g',
      priceIqd: 1350,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 70,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1009',
      barcode: '628100123009',
      category: 'Fruit & Veg',
      imageUrl: 'assets/products/shallot.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 10: Grapefruit Yellow - Turkey, 750g
    const ProductModel(
      id: 'p-grapefruit',
      externalErpId: 'ERP-SKU-1010',
      name: 'Grapefruit Yellow - Turkey, 750g',
      nameCkb: 'گریپ فرووتی زەرد، ٧٥٠ گم',
      nameAr: 'جريب فروت أصفر، ٧٥٠ غرام',
      brand: 'Al Rahma',
      unit: '750 g',
      priceIqd: 4250,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 55,
      storageTemp: 'Fresh Room',
      sku: 'ERP-SKU-1010',
      barcode: '628100123010',
      category: 'Fruit & Veg',
      imageUrl: 'assets/products/grapefruit.png',
      badgeLabel: null,
      countryOriginId: 'c-eu',
    ),
    // 11: Pepper Long Color - Local
    const ProductModel(
      id: 'p-pepper-color',
      externalErpId: 'ERP-SKU-1011',
      name: 'Pepper Long Color - Local',
      nameCkb: 'بیبەری ڕەنگاوڕەنگی ناوخۆیی، ٥٠٠ گم',
      nameAr: 'فلفل ملون بلدي، ٥٠٠ غرام',
      brand: 'Al Rahma',
      unit: '500 g',
      priceIqd: 2000,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 60,
      storageTemp: 'Fresh Room',
      sku: 'ERP-SKU-1011',
      barcode: '628100123011',
      category: 'Fruit & Veg',
      imageUrl: 'assets/products/pepper.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 12: Indomie Instant Noodles Tabasco Chicken Flavor, 75g
    const ProductModel(
      id: 'p-tabasco-chicken',
      externalErpId: 'ERP-SKU-1012',
      name: 'Indomie Instant Noodles Tabasco Chicken Flavor, 75g',
      nameCkb: 'نۆدڵسی ئیندۆمی تاباسکۆ بە تامی مریشک، ٧٥ گم',
      nameAr: 'إندومي نودلز تاباسكو بنكهة الدجاج، ٧٥ غرام',
      brand: 'Maggi',
      unit: '75 g',
      priceIqd: 1215,
      oldPriceIqd: 1350,
      discountPercent: 10,
      stockQuantity: 110,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1012',
      barcode: '628100123012',
      category: 'Ready To Eat',
      imageUrl: 'assets/products/noodles_chicken.png',
      badgeLabel: 'Save 10%',
      countryOriginId: 'c-kor',
    ),
    // 13: Indomie Instant Noodles Tabasco Beef Flavor, 75g
    const ProductModel(
      id: 'p-tabasco-beef',
      externalErpId: 'ERP-SKU-1013',
      name: 'Indomie Instant Noodles Tabasco Beef Flavor, 75g',
      nameCkb: 'نۆدڵسی ئیندۆمی تاباسکۆ بە تامی گۆشت، ٧٥ گم',
      nameAr: 'إندومي نودلز تاباسكو بنكهة اللحم، ٧٥ غرام',
      brand: 'Maggi',
      unit: '75 g',
      priceIqd: 1215,
      oldPriceIqd: 1350,
      discountPercent: 10,
      stockQuantity: 105,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1013',
      barcode: '628100123013',
      category: 'Ready To Eat',
      imageUrl: 'assets/products/noodles_beef.png',
      badgeLabel: 'Save 10%',
      countryOriginId: 'c-kor',
    ),
    // 14: Indomie Instant Noodles Tabasco Curry Flavor, 75g
    const ProductModel(
      id: 'p-tabasco-curry',
      externalErpId: 'ERP-SKU-1014',
      name: 'Indomie Instant Noodles Tabasco Curry Flavor, 75g',
      nameCkb: 'نۆدڵسی ئیندۆمی تاباسکۆ بە تامی کاری، ٧٥ گم',
      nameAr: 'إندومي نودلز تاباسكو بنكهة الكاري، ٧٥ غرام',
      brand: 'Maggi',
      unit: '75 g',
      priceIqd: 1215,
      oldPriceIqd: 1350,
      discountPercent: 10,
      stockQuantity: 115,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1014',
      barcode: '628100123014',
      category: 'Ready To Eat',
      imageUrl: 'assets/products/noodles_curry.png',
      badgeLabel: 'Save 10%',
      countryOriginId: 'c-kor',
    ),
    // 15: Nescafé Latte Chilled Cup, 190ml
    const ProductModel(
      id: 'p-nescafe-latte',
      externalErpId: 'ERP-SKU-1015',
      name: 'Nescafé Latte Chilled Cup, 190ml',
      nameCkb: 'نیسکافێ لاتی سارد، ١٩٠ مل',
      nameAr: 'نسكافيه لاتيه مثلج، ١٩٠ مل',
      brand: 'Nescafe',
      unit: '190 ml',
      priceIqd: 1850,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 90,
      storageTemp: 'Chilled',
      sku: 'ERP-SKU-1015',
      barcode: '628100123015',
      category: 'Coffee & Tea',
      imageUrl: 'assets/products/nescafe_latte.png',
      badgeLabel: null,
      countryOriginId: 'c-eu',
    ),
    // 16: Nescafé Cappuccino Chilled Cup, 190ml
    const ProductModel(
      id: 'p-nescafe-cappuccino',
      externalErpId: 'ERP-SKU-1016',
      name: 'Nescafé Cappuccino Chilled Cup, 190ml',
      nameCkb: 'نیسکافێ کاپوچینۆی سارد، ١٩٠ مل',
      nameAr: 'نسكافيه كابتشينو مثلج، ١٩٠ مل',
      brand: 'Nescafe',
      unit: '190 ml',
      priceIqd: 1850,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 85,
      storageTemp: 'Chilled',
      sku: 'ERP-SKU-1016',
      barcode: '628100123016',
      category: 'Coffee & Tea',
      imageUrl: 'assets/products/nescafe_cappuccino.png',
      badgeLabel: null,
      countryOriginId: 'c-eu',
    ),
    // 17: Nescafé Spanish Latte Chilled Cup, 190ml
    const ProductModel(
      id: 'p-nescafe-spanish',
      externalErpId: 'ERP-SKU-1017',
      name: 'Nescafé Spanish Latte Chilled Cup, 190ml',
      nameCkb: 'نیسکافێ سپانیش لاتی سارد، ١٩٠ مل',
      nameAr: 'نسكافيه سبانش لاتيه، ١٩٠ مل',
      brand: 'Nescafe',
      unit: '190 ml',
      priceIqd: 1950,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 80,
      storageTemp: 'Chilled',
      sku: 'ERP-SKU-1017',
      barcode: '628100123017',
      category: 'Coffee & Tea',
      imageUrl: 'assets/products/nescafe_spanish.png',
      badgeLabel: null,
      countryOriginId: 'c-eu',
    ),
    // 18: Kara Coconut Milk Beverage, 250ml
    const ProductModel(
      id: 'p-coconut-milk',
      externalErpId: 'ERP-SKU-1018',
      name: 'Kara Coconut Milk Beverage, 250ml',
      nameCkb: 'شیری گوێزی هیندی کارا، ٢٥٠ مل',
      nameAr: 'حليب جوز الهند كارا، ٢٥٠ مل',
      brand: 'Al Rahma',
      unit: '250 ml',
      priceIqd: 1350,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 75,
      storageTemp: 'Chilled',
      sku: 'ERP-SKU-1018',
      barcode: '628100123018',
      category: 'Beverages',
      imageUrl: 'assets/products/coconut_milk.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 19: Rabbit Jelly Fruit Lollipop, 35g
    const ProductModel(
      id: 'p-lollipop',
      externalErpId: 'ERP-SKU-1019',
      name: 'Rabbit Jelly Fruit Lollipop, 35g',
      nameCkb: 'شیرینی مژمژەی جەلی میوەیی ڕابیت، ٣٥ گم',
      nameAr: 'مصاصة حلوى رابيت فواكه، ٣٥ غرام',
      brand: 'Kinder',
      unit: '35 g',
      priceIqd: 500,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 180,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1019',
      barcode: '628100123019',
      category: 'Snacks & Chocolate',
      imageUrl: 'assets/products/lollipop.png',
      badgeLabel: null,
      countryOriginId: 'c-kor',
    ),
    // 20: My Chewy Coconut Candy
    const ProductModel(
      id: 'p-my-chewy',
      externalErpId: 'ERP-SKU-1020',
      name: 'My Chewy Coconut Candy',
      nameCkb: 'شیرینی نەرمی گوێزی هیندی مای چوی',
      nameAr: 'حلوى ماي تشوي بنكهة جوز الهند',
      brand: 'Kinder',
      unit: '1 Pack',
      priceIqd: 6000,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 120,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1020',
      barcode: '628100123020',
      category: 'Snacks & Chocolate',
      imageUrl: 'assets/products/chewy_candy.png',
      badgeLabel: null,
      countryOriginId: 'c-kor',
    ),
    // 20: Kurdistan Chicken Breast Fillet
    const ProductModel(
      id: 'p-chicken',
      externalErpId: 'ERP-SKU-1021',
      name: 'Kurdistan Chicken Breast Fillet, 500g',
      nameCkb: 'مریشکی کوردستان فیلێی سنگی فرێش، ٥٠٠ گم',
      nameAr: 'دجاج كوردستان فيليه صدور طازج، ٥٠٠ غرام',
      brand: 'Kurdistan Poultry',
      unit: '500 g',
      priceIqd: 4500,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 100,
      storageTemp: 'Fresh Room',
      sku: 'ERP-SKU-1021',
      barcode: '628100123021',
      category: 'Poultry, Meat & Seafood',
      imageUrl: 'assets/products/chicken.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 21: Fresh Kurdish Samoon Bread, 8 Pcs
    const ProductModel(
      id: 'p-bread',
      externalErpId: 'ERP-SKU-1022',
      name: 'Fresh Kurdish Samoon Bread, 8 Pcs',
      nameCkb: 'نانی سەموونی کوردی گەرم، ٨ دانە',
      nameAr: 'صمون كوردستاني طازج، ٨ حبات',
      brand: 'Local Bakery',
      unit: '8 pcs',
      priceIqd: 1000,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 150,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1022',
      barcode: '628100123022',
      category: 'Bakery',
      imageUrl: 'assets/products/bread.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 22: Al Waha Natural Mineral Water, 12x500ml
    const ProductModel(
      id: 'p-water',
      externalErpId: 'ERP-SKU-1023',
      name: 'Al Waha Natural Mineral Water, 12x500ml',
      nameCkb: 'ئاوی کانزایی سروشتی ئەلوەحە، ١٢ دانەی ٥٠٠ مل',
      nameAr: 'مياه معدنية الواحة، ١٢ × ٥٠٠ مل',
      brand: 'Al Waha',
      unit: '12 pcs',
      priceIqd: 2000,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 200,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1023',
      barcode: '628100123023',
      category: 'Water',
      imageUrl: 'assets/products/water.png',
      badgeLabel: null,
      countryOriginId: 'c-krd',
    ),
    // 20: My Chewy Milk Candy Taro Flavor, 67g
    const ProductModel(
      id: 'p-my-chewy',
      externalErpId: 'ERP-SKU-1020',
      name: 'My Chewy Milk Candy Taro Flavor, 67g',
      brand: 'Kinder',
      unit: '67 g',
      priceIqd: 1250,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 130,
      storageTemp: 'Ambient',
      sku: 'ERP-SKU-1020',
      barcode: '628100123020',
      category: 'Snacks & Chocolate',
      imageUrl: 'assets/products/candy_taro.png',
      badgeLabel: null,
      countryOriginId: 'c-kor',
    ),
  ];

  // Master Catalog: 400 SKUs (exactly 20 per category across 20 categories)
  static final List<ProductModel> allProducts = _initMasterCatalog();

  static List<ProductModel> _initMasterCatalog() {
    final List<ProductModel> list = [];
    final Map<String, List<ProductModel>> categoryItems = {};
    for (final cat in categories) {
      categoryItems[cat.nameEn] = [];
    }

    // Add canonical reference products first
    for (final item in canonicalProducts) {
      if (categoryItems.containsKey(item.category)) {
        categoryItems[item.category]!.add(item);
      }
    }

    // Fill each category to exactly 20 items (400 total)
    int globalSkuIndex = 1100;
    for (int c = 0; c < categories.length; c++) {
      final cat = categories[c];
      final currentList = categoryItems[cat.nameEn]!;
      int seq = currentList.length + 1;
      while (currentList.length < 20) {
        final id = 'p-${cat.slug}-$seq';
        final sku = 'ERP-SKU-$globalSkuIndex';
        final brand = brands[seq % brands.length].name;
        final price = 1000 + ((c * 20 + seq) % 15) * 250;
        final hasDiscount = seq % 4 == 0;
        final oldPrice = hasDiscount ? (price * 1.2).toInt() : null;
        final discPercent = hasDiscount ? 20 : null;

        currentList.add(ProductModel(
          id: id,
          externalErpId: sku,
          name: '${cat.nameEn} Selection $seq - $brand',
          nameCkb: '${cat.nameCkb} هەڵبژێردراو $seq - $brand',
          nameAr: '${cat.nameAr} تشكيلة $seq - $brand',
          brand: brand,
          unit: seq % 2 == 0 ? '500g' : '1 pc',
          priceIqd: price,
          oldPriceIqd: oldPrice,
          discountPercent: discPercent,
          stockQuantity: 50 + (seq * 5),
          storageTemp: c < 5 ? 'Stored at 5°' : 'Ambient',
          sku: sku,
          barcode: '628${c.toString().padLeft(2, '0')}${seq.toString().padLeft(4, '0')}',
          category: cat.nameEn,
          imageUrl: 'assets/categories/${cat.iconAsset?.split('/').last ?? "generic.png"}',
          badgeLabel: hasDiscount ? 'Save 20%' : null,
          countryOriginId: countryOrigins[seq % countryOrigins.length].id,
        ));
        globalSkuIndex++;
        seq++;
      }
      list.addAll(currentList);
    }
    return list;
  }

  // Curated Subsections for Home Screen Display
  static List<ProductModel> get buyAgainProducts => [
    findProductById('p-alrahma')!,
    findProductById('p-ramak')!,
    findProductById('p-eggs')!,
    findProductById('p-almarai')!,
  ];

  static List<ProductModel> get grabYourUsuals => [
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

  static List<ProductModel> get topSavers => [
    findProductById('p-cucumber')!,
    findProductById('p-pen')!,
    findProductById('p-mountain-dew')!,
    findProductById('p-schauma')!,
    findProductById('p-tabasco-chicken')!,
    ...allProducts.where((p) => p.isOnSale && !['p-cucumber', 'p-pen', 'p-mountain-dew', 'p-schauma', 'p-tabasco-chicken'].contains(p.id)).take(6),
  ];

  static List<ProductModel> get freshPicks => [
    findProductById('p-shallot')!,
    findProductById('p-grapefruit')!,
    findProductById('p-pepper-color')!,
    ...allProducts.where((p) => p.category == 'Fruit & Veg' && !['p-shallot', 'p-grapefruit', 'p-pepper-color'].contains(p.id)).take(5),
  ];

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
