const fs = require('fs');

const seedPath = 'c:/Users/zakar/BazMart/backend/prisma/seed.ts';
let seedContent = fs.readFileSync(seedPath, 'utf8');

const pStart = seedContent.indexOf('const products = [');
const pEnd = seedContent.indexOf('];', pStart);

const productsCode = seedContent.substring(pStart + 'const products = ['.length, pEnd);
const products = eval('[' + productsCode + ']');
console.log('Original products in seed.ts:', products.length);

// 1. Map canonical 20 reference items
const refMap = {
  // 1: Al Rahma Low Fat Milk, 1L
  'ERP-SKU-1001': {
    id: 'p-alrahma',
    externalErpId: 'ERP-SKU-1001',
    barcode: '628100123001',
    titleEn: 'Al Rahma Low Fat Milk, 1L',
    titleCkb: 'شیری کەم چەوری ئەلڕەحمە، ١ لتر',
    titleAr: 'حليب قليل الدسم الرحمة، ١ لتر',
    descriptionEn: 'Al Rahma Low Fat Milk, 1L - Fresh pasteurized cow milk stored at 5°C dark store.',
    descriptionCkb: 'شیری کەم چەوری ئەلڕەحمە، ١ لتر - شیری فرێشی پاكژکراو لە ٥ پلەی سەدی.',
    descriptionAr: 'حليب قليل الدسم الرحمة، ١ لتر - حليب أبقار طازج مبستر محفوظ في ٥ درجات مئوية.',
    unitText: '1 L',
    storageTemp: 'Stored at 5°',
    categoryId: 'cat-milk',
    brandId: 'b-alrahma',
    countryOriginId: 'c-krd',
    originalPriceIqd: 2250,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/milk_alrahma.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: false,
    stock: 120,
  },
  // 2: Ramak Full Fat Milk, 3%Fat
  'ERP-SKU-1002': {
    id: 'p-ramak',
    externalErpId: 'ERP-SKU-1002',
    barcode: '628100123002',
    titleEn: 'Ramak Full Fat Milk, 3%Fat',
    titleCkb: 'شیری پڕ چەوری ڕامەک، ٣٪ چەوری',
    titleAr: 'حليب كامل الدسم رامك، ٣٪ دسم',
    descriptionEn: 'Ramak Full Fat Milk, 3%Fat - Rich and creamy milk from trusted regional dairies.',
    descriptionCkb: 'شیری پڕ چەوری ڕامەک، ٣٪ چەوری - شیری دەوڵەمەند و بەتام.',
    descriptionAr: 'حليب كامل الدسم رامك، ٣٪ دسم - حليب غني ومغذي.',
    unitText: '1 L',
    storageTemp: 'Stored at 5°',
    categoryId: 'cat-milk',
    brandId: 'b-ramak',
    countryOriginId: 'c-krd',
    originalPriceIqd: 2250,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/milk_ramak.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: false,
    stock: 115,
  },
  // 3: White Eggs, 15 Pieces
  'ERP-SKU-1003': {
    id: 'p-eggs',
    externalErpId: 'ERP-SKU-1003',
    barcode: '628100123003',
    titleEn: 'White Eggs, 15 Pieces',
    titleCkb: 'هێلکەی سپی کوردی، ١٥ دانە',
    titleAr: 'بيض أبيض بلدي، ١٥ قطعة',
    descriptionEn: 'White Eggs, 15 Pieces - Farm fresh grade-A large eggs delivered safe in protective carton.',
    descriptionCkb: 'هێلکەی سپی کوردی، ١٥ دانە - هێلکەی قەبارە گەورەی کێڵگە بە پارێزراوی.',
    descriptionAr: 'بيض أبيض بلدي، ١٥ قطعة - بيض طازج من المزرعة بحجم كبير.',
    unitText: '15 Pieces',
    storageTemp: 'Fresh Room',
    categoryId: 'cat-dairy',
    brandId: 'b-alrahma',
    countryOriginId: 'c-krd',
    originalPriceIqd: 3750,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/eggs_white.png',
    isFreshPick: false,
    isBestSeller: true,
    isTopSaver: false,
    stock: 120,
  },
  // 4: Almarai Full Fat Long Life Milk, 1L
  'ERP-SKU-1004': {
    id: 'p-almarai',
    externalErpId: 'ERP-SKU-1004',
    barcode: '628100123004',
    titleEn: 'Almarai Full Fat Long Life Milk, 1L',
    titleCkb: 'شیری درێژخایەنی پڕ چەوری مەراعی، ١ لتر',
    titleAr: 'حليب كامل الدسم طويل الأجل المراعي، ١ لتر',
    descriptionEn: 'Almarai Full Fat Long Life Milk, 1L - 100% pure cow milk with long shelf life.',
    descriptionCkb: 'شیری درێژخایەنی پڕ چەوری مەراعی، ١ لتر - شیری پەتی لە مەراعییەوە.',
    descriptionAr: 'حليب كامل الدسم طويل الأجل المراعي، ١ لتر - حليب بقري نقي ١٠٠٪.',
    unitText: '1 L',
    storageTemp: 'Ambient',
    categoryId: 'cat-milk',
    brandId: 'b-almarai',
    countryOriginId: 'c-eu',
    originalPriceIqd: 2750,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/milk_almarai.png',
    isFreshPick: false,
    isBestSeller: true,
    isTopSaver: false,
    stock: 100,
  },
  // 5: Cucumber - Local, 1kg
  'ERP-SKU-1005': {
    id: 'p-cucumber',
    externalErpId: 'ERP-SKU-1005',
    barcode: '628100123005',
    titleEn: 'Cucumber - Local, 1kg',
    titleCkb: 'خەیاری کوردی تازە، ١ کگم',
    titleAr: 'خيار بلدي طازج، ١ كغم',
    descriptionEn: 'Cucumber - Local, 1kg - Crisp and juicy local cucumbers harvested fresh daily.',
    descriptionCkb: 'خەیاری کوردی تازە، ١ کگم - خەیاری بەتامی ناوخۆیی بە فرێشی.',
    descriptionAr: 'خيار بلدي طازج، ١ كغم - خيار مقرمش وطازج يومياً.',
    unitText: '1 kg',
    storageTemp: 'Fresh Room',
    categoryId: 'cat-fruit-veg',
    brandId: 'b-alrahma',
    countryOriginId: 'c-krd',
    originalPriceIqd: 1700,
    discountedPriceIqd: 1445,
    discountPercentage: 15,
    imageUrl: 'assets/products/cucumber.png',
    isFreshPick: true,
    isBestSeller: true,
    isTopSaver: true,
    stock: 120,
  },
  // 6: Piano Soft Ink Red Pen Valuable, 1 Piece
  'ERP-SKU-1006': {
    id: 'p-pen',
    externalErpId: 'ERP-SKU-1006',
    barcode: '628100123006',
    titleEn: 'Piano Soft Ink Red Pen Valuable, 1 Piece',
    titleCkb: 'قەڵەمی جافی پیانۆ ڕەنگی سوور، ١ دانە',
    titleAr: 'قلم حبر جاف بيانو أحمر ممتاز، ١ قطعة',
    descriptionEn: 'Piano Soft Ink Red Pen Valuable, 1 Piece - Smooth writing 0.7mm fine ballpoint pen.',
    descriptionCkb: 'قەڵەمی جافی پیانۆ ڕەنگی سوور، ١ دانە - نووسینی نەرم و بێ کێشە.',
    descriptionAr: 'قلم حبر جاف بيانو أحمر ممتاز، ١ قطعة - كتابة سلسة بسن ٠.٧ ملم.',
    unitText: '1 Piece',
    storageTemp: 'Ambient',
    categoryId: 'cat-stationery',
    brandId: 'b-parex',
    countryOriginId: 'c-eu',
    originalPriceIqd: 500,
    discountedPriceIqd: 400,
    discountPercentage: 20,
    imageUrl: 'assets/products/pen_piano_red.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: true,
    stock: 150,
  },
  // 7: Mountain Dew Bottle, 300ml
  'ERP-SKU-1007': {
    id: 'p-mountain-dew',
    externalErpId: 'ERP-SKU-1007',
    barcode: '628100123007',
    titleEn: 'Mountain Dew Bottle, 300ml',
    titleCkb: 'ماونتین دیو بتڵ، ٣٠٠ مل',
    titleAr: 'ماونتن ديو قارورة، ٣٠٠ مل',
    descriptionEn: 'Mountain Dew Bottle, 300ml - Refreshing citrus soda for instant energy boost.',
    descriptionCkb: 'ماونتین دیو بتڵ، ٣٠٠ مل - خواردنەوەی گازداری فرێشکەرەوە.',
    descriptionAr: 'ماونتن ديو قارورة، ٣٠٠ مل - مشروب غازي منعش بنكهة الحمضيات.',
    unitText: '300 ml',
    storageTemp: 'Ambient',
    categoryId: 'cat-beverages',
    brandId: 'b-coke',
    countryOriginId: 'c-usa',
    originalPriceIqd: 350,
    discountedPriceIqd: 287,
    discountPercentage: 18,
    imageUrl: 'assets/products/mountain_dew.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: true,
    stock: 200,
  },
  // 8: Schauma Strength & Vitality Shampoo
  'ERP-SKU-1008': {
    id: 'p-schauma',
    externalErpId: 'ERP-SKU-1008',
    barcode: '628100123008',
    titleEn: 'Schauma Strength & Vitality Shampoo',
    titleCkb: 'شامپۆی شاوما بەهێزکەر، ٤٠٠ مل',
    titleAr: 'شامبو شاوما للقوة والحيوية، ٤٠٠ مل',
    descriptionEn: 'Schauma Strength & Vitality Shampoo, 400ml - Strengthening formula with micronutrients.',
    descriptionCkb: 'شامپۆی شاوما بەهێزکەر، ٤٠٠ مل - بەهێزکردنی ڕەگی قژ و پاراستنی.',
    descriptionAr: 'شامبو شاوما للقوة والحيوية، ٤٠٠ مل - تركيبة مغذية لتقوية الشعر.',
    unitText: '400 ml',
    storageTemp: 'Ambient',
    categoryId: 'cat-personal',
    brandId: 'b-vaseline',
    countryOriginId: 'c-eu',
    originalPriceIqd: 8250,
    discountedPriceIqd: 7013,
    discountPercentage: 15,
    imageUrl: 'assets/products/shampoo_schauma.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: true,
    stock: 80,
  },
  // 9: Shallot - Iran, 500g
  'ERP-SKU-1009': {
    id: 'p-shallot',
    externalErpId: 'ERP-SKU-1009',
    barcode: '628100123009',
    titleEn: 'Shallot - Iran, 500g',
    titleCkb: 'شەلۆت (پیازی بچووکی ئێرانی)، ٥٠٠ گم',
    titleAr: 'كراث / بصل شالوت إيراني، ٥٠٠ غرام',
    descriptionEn: 'Shallot - Iran, 500g - Sweet aromatic small pink shallots perfect for gourmet cooking.',
    descriptionCkb: 'شەلۆت (پیازی بچووکی ئێرانی)، ٥٠٠ گم - بۆ تام و بۆنی خۆش لە چێشتلێناندا.',
    descriptionAr: 'بصل شالوت إيراني، ٥٠٠ غرام - بصل صغير حلو النكهة وممتاز للطبخ.',
    unitText: '500 g',
    storageTemp: 'Ambient',
    categoryId: 'cat-fruit-veg',
    brandId: 'b-alrahma',
    countryOriginId: 'c-krd',
    originalPriceIqd: 1350,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/shallot.png',
    isFreshPick: true,
    isBestSeller: false,
    isTopSaver: false,
    stock: 70,
  },
  // 10: Grapefruit Yellow - Turkey, 750g
  'ERP-SKU-1010': {
    id: 'p-grapefruit',
    externalErpId: 'ERP-SKU-1010',
    barcode: '628100123010',
    titleEn: 'Grapefruit Yellow - Turkey, 750g',
    titleCkb: 'گرەیپفروتی زەردی تورکی، ٧٥٠ گم',
    titleAr: 'جريب فروت أصفر تركي، ٧٥٠ غرام',
    descriptionEn: 'Grapefruit Yellow - Turkey, 750g - Tangy and juicy citrus packed with natural Vitamin C.',
    descriptionCkb: 'گرەیپفروتی زەردی تورکی، ٧٥٠ گم - پڕ لە شەربەت و ڤیتامین سی سروشتی.',
    descriptionAr: 'جريب فروت أصفر تركي، ٧٥٠ غرام - حمضيات غنية بالعصير وفيتامين سي الطبيعي.',
    unitText: '750 g',
    storageTemp: 'Fresh Room',
    categoryId: 'cat-fruit-veg',
    brandId: 'b-alrahma',
    countryOriginId: 'c-krd',
    originalPriceIqd: 4250,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/grapefruit.png',
    isFreshPick: true,
    isBestSeller: false,
    isTopSaver: false,
    stock: 55,
  },
  // 11: Pepper Long Color - Local
  'ERP-SKU-1011': {
    id: 'p-pepper-color',
    externalErpId: 'ERP-SKU-1011',
    barcode: '628100123011',
    titleEn: 'Pepper Long Color - Local',
    titleCkb: 'بیبەری ڕەنگاوڕەنگی درێژی خۆماڵی، ٥٠٠ گم',
    titleAr: 'فلفل ألوان طويل بلدي، ٥٠٠ غرام',
    descriptionEn: 'Pepper Long Color - Local, 500g - Vibrant sweet long peppers for salads and grilling.',
    descriptionCkb: 'بیبەری ڕەنگاوڕەنگی درێژی خۆماڵی، ٥٠٠ گم - شیرین و تەندروست بۆ زەڵاتە.',
    descriptionAr: 'فلفل ألوان طويل بلدي، ٥٠٠ غرام - فلفل حلو ملون للسلطات والشواء.',
    unitText: '500 g',
    storageTemp: 'Fresh Room',
    categoryId: 'cat-fruit-veg',
    brandId: 'b-alrahma',
    countryOriginId: 'c-krd',
    originalPriceIqd: 2000,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/pepper_long.png',
    isFreshPick: true,
    isBestSeller: false,
    isTopSaver: false,
    stock: 60,
  },
  // 12: Tabasco Ramen Noodles Hot & Spicy Chicken
  'ERP-SKU-1012': {
    id: 'p-tabasco-chicken',
    externalErpId: 'ERP-SKU-1012',
    barcode: '628100123012',
    titleEn: 'Tabasco Ramen Noodles Hot & Spicy Chicken',
    titleCkb: 'نودڵسی تاباسکۆی تیژ بە تامی مریشک، ٧٠ گم',
    titleAr: 'نودلز تاباسكو الحار بنكهة الدجاج، ٧٠ غرام',
    descriptionEn: 'Tabasco Ramen Noodles Hot & Spicy Chicken, 70g - Fiery instant ramen infused with genuine Tabasco heat.',
    descriptionCkb: 'نودڵسی تاباسکۆی تیژ بە تامی مریشک، ٧٠ گم - تامی تەقێنەری تاباسکۆ و مریشک.',
    descriptionAr: 'نودلز تاباسكو الحار بنكهة الدجاج، ٧٠ غرام - نودلز سريعة التحضير بحرارة تاباسكو الأصلية.',
    unitText: '70 g',
    storageTemp: 'Ambient',
    categoryId: 'cat-ready',
    brandId: 'b-maggi',
    countryOriginId: 'c-kor',
    originalPriceIqd: 1350,
    discountedPriceIqd: 1215,
    discountPercentage: 10,
    imageUrl: 'assets/products/ramen_tabasco_chicken.png',
    isFreshPick: false,
    isBestSeller: true,
    isTopSaver: true,
    stock: 120,
  },
  // 13: Tabasco Ramen Noodles Savory Spiced Beef
  'ERP-SKU-1013': {
    id: 'p-tabasco-beef',
    externalErpId: 'ERP-SKU-1013',
    barcode: '628100123013',
    titleEn: 'Tabasco Ramen Noodles Savory Spiced Beef',
    titleCkb: 'نودڵسی تاباسکۆ بە تامی گۆشتی بەهاراتکراو، ٧٠ گم',
    titleAr: 'نودلز تاباسكو بنكهة اللحم المتبل، ٧٠ غرام',
    descriptionEn: 'Tabasco Ramen Noodles Savory Spiced Beef, 70g - Deep savory broth with spicy kick.',
    descriptionCkb: 'نودڵسی تاباسکۆ بە تامی گۆشتی بەهاراتکراو، ٧٠ گم - شۆربای گۆشتی دەوڵەمەند بە تاباسکۆ.',
    descriptionAr: 'نودلز تاباسكو بنكهة اللحم المتبل، ٧٠ غرام - مرقة لحم لذيذة مع نكهة حارة.',
    unitText: '70 g',
    storageTemp: 'Ambient',
    categoryId: 'cat-ready',
    brandId: 'b-maggi',
    countryOriginId: 'c-kor',
    originalPriceIqd: 1350,
    discountedPriceIqd: 1215,
    discountPercentage: 10,
    imageUrl: 'assets/products/ramen_tabasco_beef.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: true,
    stock: 90,
  },
  // 14: Tabasco Ramen Noodles Spicy Curry Blaze
  'ERP-SKU-1014': {
    id: 'p-tabasco-curry',
    externalErpId: 'ERP-SKU-1014',
    barcode: '628100123014',
    titleEn: 'Tabasco Ramen Noodles Spicy Curry Blaze',
    titleCkb: 'نودڵسی تاباسکۆ بە تامی کێری تیژ، ٧٠ گم',
    titleAr: 'نودلز تاباسكو بنكهة الكاري الحار، ٧٠ غرام',
    descriptionEn: 'Tabasco Ramen Noodles Spicy Curry Blaze, 70g - Rich curry aroma with tangy Tabasco zing.',
    descriptionCkb: 'نودڵسی تاباسکۆ بە تامی کێری تیژ، ٧٠ گم - کێری خۆش و بەهاراتدار.',
    descriptionAr: 'نودلز تاباسكو بنكهة الكاري الحار، ٧٠ غرام - نكهة كاري غنية مع حرارة تاباسكو اللاذعة.',
    unitText: '70 g',
    storageTemp: 'Ambient',
    categoryId: 'cat-ready',
    brandId: 'b-maggi',
    countryOriginId: 'c-kor',
    originalPriceIqd: 1350,
    discountedPriceIqd: 1215,
    discountPercentage: 10,
    imageUrl: 'assets/products/ramen_tabasco_curry.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: true,
    stock: 100,
  },
  // 15: Nescafe Latte Iced Coffee, 220ml
  'ERP-SKU-1015': {
    id: 'p-nescafe-latte',
    externalErpId: 'ERP-SKU-1015',
    barcode: '628100123015',
    titleEn: 'Nescafe Latte Iced Coffee, 220ml',
    titleCkb: 'قاوەی بەستووی نیسکافێ لاتی، ٢٢٠ مل',
    titleAr: 'نسكافيه آيس كوفي لاتيه، ٢٢٠ مل',
    descriptionEn: 'Nescafe Latte Iced Coffee, 220ml - Ready-to-drink chilled creamy milk and coffee in aluminum can.',
    descriptionCkb: 'قاوەی بەستووی نیسکافێ لاتی، ٢٢٠ مل - قاوەی ساردکراوەی ئامادەکراو.',
    descriptionAr: 'نسكافيه آيس كوفي لاتيه، ٢٢٠ مل - قهوة مثلجة مبردة بالحليب في علبة ألمنيوم.',
    unitText: '220 ml',
    storageTemp: 'Stored at 5°',
    categoryId: 'cat-coffee',
    brandId: 'b-nescafe',
    countryOriginId: 'c-eu',
    originalPriceIqd: 1000,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/nescafe_latte_can.png',
    isFreshPick: false,
    isBestSeller: true,
    isTopSaver: false,
    stock: 110,
  },
  // 16: Nescafe Cappuccino Iced Coffee, 220ml
  'ERP-SKU-1016': {
    id: 'p-nescafe-cappuccino',
    externalErpId: 'ERP-SKU-1016',
    barcode: '628100123016',
    titleEn: 'Nescafe Cappuccino Iced Coffee, 220ml',
    titleCkb: 'قاوەی بەستووی نیسکافێ کاپوچینۆ، ٢٢٠ مل',
    titleAr: 'نسكافيه آيس كوفي كابوتشينو، ٢٢٠ مل',
    descriptionEn: 'Nescafe Cappuccino Iced Coffee, 220ml - Velvety cappuccino chilled for refreshing summer sip.',
    descriptionCkb: 'قاوەی بەستووی نیسکافێ کاپوچینۆ، ٢٢٠ مل - تامی کەفدار و ساردی کاپوچینۆ.',
    descriptionAr: 'نسكافيه آيس كوفي كابوتشينو، ٢٢٠ مل - رغوة مخملية ونكهة قهوة مبردة منعشة.',
    unitText: '220 ml',
    storageTemp: 'Stored at 5°',
    categoryId: 'cat-coffee',
    brandId: 'b-nescafe',
    countryOriginId: 'c-eu',
    originalPriceIqd: 1000,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/nescafe_cappuccino_can.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: false,
    stock: 100,
  },
  // 17: Nescafe Iced Spanish Latte, 220ml
  'ERP-SKU-1017': {
    id: 'p-nescafe-spanish',
    externalErpId: 'ERP-SKU-1017',
    barcode: '628100123017',
    titleEn: 'Nescafe Iced Spanish Latte, 220ml',
    titleCkb: 'قاوەی بەستووی نیسکافێ سپانیش لاتی، ٢٢٠ مل',
    titleAr: 'نسكافيه آيس كوفي سبانيش لاتيه، ٢٢٠ مل',
    descriptionEn: 'Nescafe Iced Spanish Latte, 220ml - Sweetened condensed milk and rich roast espresso.',
    descriptionCkb: 'قاوەی بەستووی نیسکافێ سپانیش لاتی، ٢٢٠ مل - شیری خەستکراو و قاوەی بەهێز.',
    descriptionAr: 'نسكافيه آيس كوفي سبانيش لاتيه، ٢٢٠ مل - حليب مكثف محلى مع إسبريسو غني.',
    unitText: '220 ml',
    storageTemp: 'Stored at 5°',
    categoryId: 'cat-coffee',
    brandId: 'b-nescafe',
    countryOriginId: 'c-eu',
    originalPriceIqd: 1000,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/nescafe_spanish_latte_can.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: false,
    stock: 100,
  },
  // 18: Exotic Coconut Milk <All Purpose>, 400ml
  'ERP-SKU-1018': {
    id: 'p-coconut-milk',
    externalErpId: 'ERP-SKU-1018',
    barcode: '628100123018',
    titleEn: 'Exotic Coconut Milk <All Purpose>, 400ml',
    titleCkb: 'شیری گوێزی هیندی ئەگزۆتیک بۆ چێشتلێنان، ٤٠٠ مل',
    titleAr: 'حليب جوز الهند إكزوتيك متعدد الاستخدامات، ٤٠٠ مل',
    descriptionEn: 'Exotic Coconut Milk <All Purpose>, 400ml - Rich creamy base for curries, desserts and smoothies.',
    descriptionCkb: 'شیری گوێزی هیندی ئەگزۆتیک بۆ چێشتلێنان، ٤٠٠ مل - بۆ خواردنی تامدار و شیرینی.',
    descriptionAr: 'حليب جوز الهند إكزوتيك متعدد الاستخدامات، ٤٠٠ مل - قوام كريمي غني للكاري والحلويات.',
    unitText: '400 ml',
    storageTemp: 'Ambient',
    categoryId: 'cat-cooking',
    brandId: 'b-alrahma',
    countryOriginId: 'c-eu',
    originalPriceIqd: 5250,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/coconut_milk.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: false,
    stock: 95,
  },
  // 19: Rabbit Lollipop, 60g
  'ERP-SKU-1019': {
    id: 'p-lollipop',
    externalErpId: 'ERP-SKU-1019',
    barcode: '628100123019',
    titleEn: 'Rabbit Lollipop, 60g',
    titleCkb: 'شیرینی چۆپستیکی ڕابیت، ٦٠ گم',
    titleAr: 'مصاصة رابيت اللذيذة، ٦٠ غرام',
    descriptionEn: 'Rabbit Lollipop, 60g - Colorful fruit lollipop favorite for kids and party bags.',
    descriptionCkb: 'شیرینی چۆپستیکی ڕابیت، ٦٠ گم - شیرینی میوەیی بەتام بۆ منداڵان.',
    descriptionAr: 'مصاصة رابيت اللذيذة، ٦٠ غرام - حلوى مصاص ملونة بنكهات الفواكه.',
    unitText: '60 g',
    storageTemp: 'Ambient',
    categoryId: 'cat-snacks',
    brandId: 'b-alrahma',
    countryOriginId: 'c-krd',
    originalPriceIqd: 1250,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/rabbit_lollipop.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: false,
    stock: 130,
  },
  // 20: My Chewy Coconut Flavor Low Calorie Candy
  'ERP-SKU-1020': {
    id: 'p-my-chewy',
    externalErpId: 'ERP-SKU-1020',
    barcode: '628100123020',
    titleEn: 'My Chewy Coconut Flavor Low Calorie Candy',
    titleCkb: 'شیرینی بنێشتی کەم کالۆری گوێزی هیندی، ٣٦٠ گم',
    titleAr: 'حلوى ماي تشوي بنكهة جوز الهند قليلة السعرات، ٣٦٠ غرام',
    descriptionEn: 'My Chewy Coconut Flavor Low Calorie Candy, 360g - Soft chewy milk candy with coconut center.',
    descriptionCkb: 'شیرینی بنێشتی کەم کالۆری گوێزی هیندی، ٣٦٠ گم - بنێشتی نەرم بە تامی گوێزی هیندی.',
    descriptionAr: 'حلوى ماي تشوي بنكهة جوز الهند قليلة السعرات، ٣٦٠ غرام - حلوى طرية للمضغ بنكهة جوز الهند اللذيذة.',
    unitText: '360 g',
    storageTemp: 'Ambient',
    categoryId: 'cat-snacks',
    brandId: 'b-alrahma',
    countryOriginId: 'c-eu',
    originalPriceIqd: 6000,
    discountedPriceIqd: null,
    discountPercentage: null,
    imageUrl: 'assets/products/my_chewy_coconut.png',
    isFreshPick: false,
    isBestSeller: false,
    isTopSaver: false,
    stock: 90,
  },
};

// Now process the 400 products
// For each category, ensure exactly 20 items.
const refSkus = Object.keys(refMap);

// Replace or insert refMap products in their matching category
const updatedProducts = [];
const usedIds = new Set();
const usedSkus = new Set();

// Let's identify the 20 categories
const categories = [
  'cat-fruit-veg', 'cat-bakery', 'cat-meat', 'cat-frozen', 'cat-dairy',
  'cat-beverages', 'cat-snacks', 'cat-coffee', 'cat-milk', 'cat-breakfast',
  'cat-ready', 'cat-cooking', 'cat-icecream', 'cat-spices', 'cat-personal',
  'cat-household', 'cat-baby', 'cat-pet', 'cat-water', 'cat-stationery'
];

// Map of canonical ref items by category
const refsByCat = {};
for (const sku of refSkus) {
  const item = refMap[sku];
  if (!refsByCat[item.categoryId]) refsByCat[item.categoryId] = [];
  refsByCat[item.categoryId].push(item);
}

for (const catId of categories) {
  const catRefs = refsByCat[catId] || [];
  const catItems = [];

  // Add the canonical references first
  for (const ref of catRefs) {
    catItems.push(ref);
    usedIds.add(ref.id);
    usedSkus.add(ref.externalErpId);
  }

  // Find remaining items from original products that belong to this category and are NOT duplicates
  const existingForCat = products.filter(p => p.categoryId === catId);
  for (const p of existingForCat) {
    if (catItems.length >= 20) break;
    // Check if this existing item is one of our ref items (by name or old SKU)
    const isAlmaraiLongLife = p.titleEn.includes('Almarai Full Fat Long Life');
    const isRamakMilk = p.titleEn.includes('Ramak Full Fat Milk');
    const isAlRahmaMilk = p.titleEn.includes('Al Rahma Low Fat Milk');
    const isEggs = p.titleEn.includes('White Eggs');
    const isCucumber = p.titleEn.includes('Cucumber - Local');
    const isPen = p.titleEn.includes('Piano Soft Ink') || p.titleEn.includes('Piano Pen');
    const isMountainDew = p.titleEn.includes('Mountain Dew');
    const isSchauma = p.titleEn.includes('Schauma Strength');
    const isShallot = p.titleEn.includes('Shallot');
    const isGrapefruit = p.titleEn.includes('Grapefruit');
    const isPepperLong = p.titleEn.includes('Pepper Long Color') || p.titleEn.includes('Bell Pepper Tricolor');
    const isTabasco = p.titleEn.includes('Tabasco Ramen');
    const isNescafeIced = p.titleEn.includes('Nescafe') && (p.titleEn.includes('Iced') || p.titleEn.includes('Latte') || p.titleEn.includes('Cappuccino'));
    const isCoconutMilk = p.titleEn.includes('Coconut Milk');
    const isLollipop = p.titleEn.includes('Rabbit Lollipop');
    const isMyChewy = p.titleEn.includes('My Chewy');

    if (isAlmaraiLongLife || isRamakMilk || isAlRahmaMilk || isEggs || isCucumber || isPen || isMountainDew || isSchauma || isShallot || isGrapefruit || isPepperLong || isTabasco || isNescafeIced || isCoconutMilk || isLollipop || isMyChewy) {
      continue; // already handled in catRefs
    }

    // Ensure unique ID and SKU
    let newId = p.id;
    if (usedIds.has(newId)) {
      newId = newId + '-item';
    }
    let newSku = p.externalErpId;
    if (usedSkus.has(newSku) || refSkus.includes(newSku)) {
      newSku = 'ERP-SKU-GEN-' + Math.floor(100000 + Math.random() * 900000);
    }
    usedIds.add(newId);
    usedSkus.add(newSku);

    catItems.push({
      ...p,
      id: newId,
      externalErpId: newSku
    });
  }

  // If still less than 20, fill with generic items
  let counter = 1;
  while (catItems.length < 20) {
    const fillerId = `p-${catId.replace('cat-', '')}-fill-${counter}`;
    const fillerSku = `ERP-SKU-FILL-${catId.replace('cat-', '')}-${counter}`;
    catItems.push({
      id: fillerId,
      externalErpId: fillerSku,
      barcode: `628199${Math.floor(100000 + Math.random() * 900000)}`,
      titleEn: `${catId.replace('cat-', '').toUpperCase()} Selection Item ${counter}`,
      titleCkb: `کاڵای هەڵبژێردراوی ${catId.replace('cat-', '')} ${counter}`,
      titleAr: `منتج مختار ${catId.replace('cat-', '')} ${counter}`,
      descriptionEn: `Quality item ${counter} in category ${catId}.`,
      descriptionCkb: `کاڵای کوالێتی بەرز.`,
      descriptionAr: `منتج عالي الجودة.`,
      unitText: '1 Piece',
      storageTemp: 'Ambient',
      categoryId: catId,
      brandId: 'b-alrahma',
      countryOriginId: 'c-krd',
      originalPriceIqd: 2000,
      discountedPriceIqd: null,
      discountPercentage: null,
      imageUrl: 'assets/products/cucumber.png',
      isFreshPick: false,
      isBestSeller: false,
      isTopSaver: false,
      stock: 100
    });
    counter++;
  }

  console.log(`Category [${catId}] final count: ${catItems.length}`);
  updatedProducts.push(...catItems);
}

console.log('Total updated products:', updatedProducts.length);

// Format updatedProducts as JSON string with 2 spaces
const formattedJson = JSON.stringify(updatedProducts, null, 2);

// Replace in seedContent
const newSeed = seedContent.substring(0, pStart) + 'const products = ' + formattedJson + ';' + seedContent.substring(pEnd + 2);

// Also add Coupons section to seedContent if not present
let finalSeed = newSeed;
if (!finalSeed.includes('prisma.coupon.upsert')) {
  const couponsSeedCode = `
  // 6. DISCOUNT COUPONS SEEDING
  console.log('Seeding discount coupons including FRESHONLY15...');
  const couponsData = [
    {
      code: 'BAZ20',
      titleEn: '20% Mega Mart Discount',
      titleCkb: '٢٠٪ داشکاندنی گەورەی بازماڕت',
      titleAr: 'خصم ٢٠٪ ميجا باز مارت',
      descriptionEn: 'Get 20% off orders over IQD 10,000 (Max discount IQD 5,000).',
      descriptionCkb: '٢٠٪ داشکاندن بۆ داواکاری سەروو ١٠,٠٠٠ دینار.',
      descriptionAr: 'احصل على خصم ٢٠٪ للطلبات فوق ١٠,٠٠٠ دينار.',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscountIqd: 5000,
      minOrderSubtotalIqd: 10000,
      firstOrderOnly: false,
      excludeDiscountedItems: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      usageLimitGlobal: 1000,
      usageLimitPerCustomer: 1,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() + 365 * 86400000),
      isActive: true,
    },
    {
      code: 'SLEMANI2500',
      titleEn: 'IQD 2,500 Off in Sulaymaniyah',
      titleCkb: '٢,٥٠٠ دینار داشکاندن لە سلێمانی',
      titleAr: 'خصم ٢,٥٠٠ دينار في السليمانية',
      descriptionEn: 'Flat IQD 2,500 discount on orders over IQD 8,000.',
      descriptionCkb: 'داشکاندنی ٢,٥٠٠ دینار بۆ داواکاری سەروو ٨,٠٠٠ دینار.',
      descriptionAr: 'خصم ثابت بقيمة ٢,٥٠٠ دينار للطلبات فوق ٨,٠٠٠ دينار.',
      discountType: 'FIXED_IQD',
      discountValue: 2500,
      maxDiscountIqd: null,
      minOrderSubtotalIqd: 8000,
      firstOrderOnly: false,
      excludeDiscountedItems: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      usageLimitGlobal: 1000,
      usageLimitPerCustomer: 1,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() + 365 * 86400000),
      isActive: true,
    },
    {
      code: 'FIRST5000',
      titleEn: 'Welcome Gift: IQD 5,000 Off',
      titleCkb: 'دیاری بەخێرهاتن: ٥,٠٠٠ دینار داشکاندن',
      titleAr: 'هدية الترحيب: خصم ٥,٠٠٠ دينار',
      descriptionEn: 'Special IQD 5,000 off your very first BazMart order over IQD 12,000.',
      descriptionCkb: '٥,٠٠٠ دینار داشکاندن بۆ یەکەم داواکاری سەروو ١٢,٠٠٠ دینار.',
      descriptionAr: 'خصم ٥,٠٠٠ دينار على أول طلب لك في باز مارت فوق ١٢,٠٠٠ دينار.',
      discountType: 'FIXED_IQD',
      discountValue: 5000,
      maxDiscountIqd: null,
      minOrderSubtotalIqd: 12000,
      firstOrderOnly: true,
      excludeDiscountedItems: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      usageLimitGlobal: 5000,
      usageLimitPerCustomer: 1,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() + 365 * 86400000),
      isActive: true,
    },
    {
      code: 'FREEDEL',
      titleEn: 'Free Delivery',
      titleCkb: 'گەیاندنی بێبەرامبەر',
      titleAr: 'توصيل مجاني',
      descriptionEn: 'Zero delivery fee on orders over IQD 7,000.',
      descriptionCkb: 'گەیاندنی بەلاش بۆ داواکاری سەروو ٧,٠٠٠ دینار.',
      descriptionAr: 'توصيل مجاني بالكامل للطلبات فوق ٧,٠٠٠ دينار.',
      discountType: 'FREE_DELIVERY',
      discountValue: 500,
      maxDiscountIqd: null,
      minOrderSubtotalIqd: 7000,
      firstOrderOnly: false,
      excludeDiscountedItems: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      usageLimitGlobal: 10000,
      usageLimitPerCustomer: 5,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() + 365 * 86400000),
      isActive: true,
    },
    {
      code: 'EXPIRED10',
      titleEn: 'Expired 10% Coupon',
      titleCkb: 'کۆدی بەسەرچوو',
      titleAr: 'كوبون منتهي الصلاحية',
      descriptionEn: 'Expired promotion for QA edge case testing.',
      descriptionCkb: 'کۆدی تاقیکردنەوە.',
      descriptionAr: 'كوبون منتهي لاختبار النظام.',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscountIqd: 3000,
      minOrderSubtotalIqd: 7000,
      firstOrderOnly: false,
      excludeDiscountedItems: false,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      usageLimitGlobal: 100,
      usageLimitPerCustomer: 1,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 30 * 86400000),
      expiresAt: new Date(Date.now() - 86400000), // expired
      isActive: true,
    },
    {
      code: 'ERBIL1000',
      titleEn: 'IQD 1,000 Off Erbil Express',
      titleCkb: '١,٠٠٠ دینار داشکاندن',
      titleAr: 'خصم ١,٠٠٠ دينار',
      descriptionEn: 'IQD 1,000 off regular items over IQD 7,000.',
      descriptionCkb: '١,٠٠٠ دینار داشکاندن.',
      descriptionAr: 'خصم ١,٠٠٠ دينار.',
      discountType: 'FIXED_IQD',
      discountValue: 1000,
      maxDiscountIqd: null,
      minOrderSubtotalIqd: 7000,
      firstOrderOnly: false,
      excludeDiscountedItems: true,
      applicableCategoryIds: null,
      applicableBrandIds: null,
      usageLimitGlobal: 1000,
      usageLimitPerCustomer: 1,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() + 365 * 86400000),
      isActive: true,
    },
    {
      code: 'FRESHONLY15',
      titleEn: '15% Off Fresh Dairy & Produce',
      titleCkb: '١٥٪ داشکاندن بۆ بەرهەمی فرێش',
      titleAr: 'خصم ١٥٪ على الألبان والخضروات الطازجة',
      descriptionEn: 'Save 15% on fresh produce and dairy up to IQD 4000. Excludes already discounted items.',
      descriptionCkb: '١٥٪ داشکاندن بۆ سەوزە و میوە و شیرەمەنی.',
      descriptionAr: 'وفر ١٥٪ على الخضروات والألبان الطازجة حتى ٤٠٠٠ دينار.',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscountIqd: 4000,
      minOrderSubtotalIqd: 7000,
      firstOrderOnly: false,
      excludeDiscountedItems: true,
      applicableCategoryIds: JSON.stringify(['fruit-veg', 'dairy-eggs', 'milk', 'cat-fruit-veg', 'cat-dairy', 'cat-milk']),
      applicableBrandIds: null,
      usageLimitGlobal: 1000,
      usageLimitPerCustomer: 1,
      currentUsageCount: 0,
      startsAt: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() + 365 * 86400000),
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
`;
  const insertBefore = finalSeed.lastIndexOf('console.log(\'Database Seeding Completed Successfully!');
  finalSeed = finalSeed.substring(0, insertBefore) + couponsSeedCode + '\n  ' + finalSeed.substring(insertBefore);
}

fs.writeFileSync(seedPath, finalSeed, 'utf8');
console.log('Successfully wrote updated backend/prisma/seed.ts!');
