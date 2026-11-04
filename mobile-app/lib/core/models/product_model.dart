// ERP-Ready Product Model for BazMart
import '../utils/linguistic_normalizer.dart';

class ProductModel {
  final String id;
  final String externalErpId;
  final String name;
  final String? nameCkb;
  final String? nameAr;
  final String brand;
  final String unit;
  final int priceIqd;
  final int? oldPriceIqd;
  final int? discountPercent;
  final int stockQuantity;
  final String? storageTemp;
  final String sku;
  final String barcode;
  final String category;
  final String imageUrl;
  final String? badgeLabel;
  final String? subtitle;
  final String? countryOriginId;
  final String? aisleLocation;

  const ProductModel({
    required this.id,
    required this.externalErpId,
    required this.name,
    this.nameCkb,
    this.nameAr,
    required this.brand,
    required this.unit,
    required this.priceIqd,
    this.oldPriceIqd,
    this.discountPercent,
    required this.stockQuantity,
    this.storageTemp,
    required this.sku,
    required this.barcode,
    required this.category,
    required this.imageUrl,
    this.badgeLabel,
    this.subtitle,
    this.countryOriginId,
    this.aisleLocation,
  });

  String get displayAisleLocation {
    if (aisleLocation != null && aisleLocation!.isNotEmpty) return aisleLocation!;
    final cat = category.toLowerCase();
    if (cat.contains('dairy') || cat.contains('milk')) return 'ڕێڕەوی A1 • ساردکەرەوەی شیرەمەنی (5°C)';
    if (cat.contains('fruit') || cat.contains('veg')) return 'ڕێڕەوی B2 • بەشی میوە و سەوزەی تازە';
    if (cat.contains('poultry') || cat.contains('meat')) return 'ڕێڕەوی A2 • ساردکەرەوەی گۆشت و مریشکی فرێش (0°C)';
    if (cat.contains('frozen') || cat.contains('ice')) return 'ڕێڕەوی A3 • بەفرگری بەستوو (-18°C)';
    if (cat.contains('bakery') || cat.contains('bread')) return 'ڕێڕەوی B1 • بەشی نانەواخانە و هەویرەمەنی';
    if (cat.contains('beverage') || cat.contains('water')) return 'ڕێڕەوی C4 • بەشی خواردنەوە ساردەکان و ئاو';
    if (cat.contains('coffee') || cat.contains('tea')) return 'ڕێڕەوی C2 • بەشی قاوە و چای';
    if (cat.contains('snack') || cat.contains('chocolate')) return 'ڕێڕەوی D1 • بەشی چیپس و چکلێت';
    if (cat.contains('ready') || cat.contains('noodle')) return 'ڕێڕەوی D2 • بەشی نۆدڵز و خواردنی خێرا';
    return 'ڕێڕەوی C1 • پێداویستی گشتی سووپەرمارکێت';
  }

  String getLocalizedName(String lang) {
    if (lang == 'ckb' && nameCkb != null && nameCkb!.isNotEmpty) return nameCkb!;
    if (lang == 'ar' && nameAr != null && nameAr!.isNotEmpty) return nameAr!;
    return name;
  }

  bool get isOnSale => oldPriceIqd != null && oldPriceIqd! > priceIqd;

  String get formattedPrice => 'IQD $priceIqd';

  String get formattedOldPrice => oldPriceIqd != null ? 'IQD $oldPriceIqd' : '';

  String getLocalizedPrice(String lang) {
    return LinguisticNormalizer.formatIqd(priceIqd, lang);
  }

  String getLocalizedOldPrice(String lang) {
    if (oldPriceIqd == null) return '';
    return LinguisticNormalizer.formatIqd(oldPriceIqd!, lang);
  }

  String get discountBadgeText {
    if (badgeLabel != null && badgeLabel!.isNotEmpty) return badgeLabel!;
    if (discountPercent != null && discountPercent! > 0) {
      return 'Save $discountPercent%';
    }
    return '';
  }

  String getLocalizedDiscountBadge(String lang) {
    if (badgeLabel != null && badgeLabel!.isNotEmpty) {
      if (lang == 'ckb') {
        if (badgeLabel == 'Best Seller') return 'پڕفرۆشترین';
        if (badgeLabel == 'Top Saver') return 'باشترین داشکاندن';
        if (badgeLabel == 'Fresh') return 'فرێش';
      } else if (lang == 'ar') {
        if (badgeLabel == 'Best Seller') return 'الأكثر مبيعاً';
        if (badgeLabel == 'Top Saver') return 'توفير أكبر';
        if (badgeLabel == 'Fresh') return 'طازج';
      }
      return badgeLabel!;
    }
    if (discountPercent != null && discountPercent! > 0) {
      if (lang == 'ckb') return 'داشکاندن $discountPercent٪';
      if (lang == 'ar') return 'خصم $discountPercent٪';
      return 'Save $discountPercent%';
    }
    return '';
  }

  ProductModel copyWith({
    String? id,
    String? externalErpId,
    String? name,
    String? nameCkb,
    String? nameAr,
    String? brand,
    String? unit,
    int? priceIqd,
    int? oldPriceIqd,
    int? discountPercent,
    int? stockQuantity,
    String? storageTemp,
    String? sku,
    String? barcode,
    String? category,
    String? imageUrl,
    String? badgeLabel,
    String? subtitle,
  }) {
    return ProductModel(
      id: id ?? this.id,
      externalErpId: externalErpId ?? this.externalErpId,
      name: name ?? this.name,
      nameCkb: nameCkb ?? this.nameCkb,
      nameAr: nameAr ?? this.nameAr,
      brand: brand ?? this.brand,
      unit: unit ?? this.unit,
      priceIqd: priceIqd ?? this.priceIqd,
      oldPriceIqd: oldPriceIqd ?? this.oldPriceIqd,
      discountPercent: discountPercent ?? this.discountPercent,
      stockQuantity: stockQuantity ?? this.stockQuantity,
      storageTemp: storageTemp ?? this.storageTemp,
      sku: sku ?? this.sku,
      barcode: barcode ?? this.barcode,
      category: category ?? this.category,
      imageUrl: imageUrl ?? this.imageUrl,
      badgeLabel: badgeLabel ?? this.badgeLabel,
      subtitle: subtitle ?? this.subtitle,
    );
  }
}
