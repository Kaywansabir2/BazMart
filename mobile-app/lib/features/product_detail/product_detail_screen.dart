import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/talabat_painters.dart';
import '../../core/models/product_model.dart';
import '../../core/models/brand_model.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../../core/state/cart_state.dart';
import '../../core/state/auth_state.dart';
import '../../core/localization/app_locale.dart';
import '../../core/network/api_client.dart';
import '../../core/widgets/product_packaging_visual.dart';
import '../home/widgets/product_card.dart';
import '../brand/brand_store_screen.dart';
import '../cart/cart_screen.dart';

class ProductDetailScreen extends StatelessWidget {
  final ProductModel product;
  final CartState cartState;
  final LocaleProvider localeProvider;
  final bool initialOpenZoom;
  final bool initialOpenColdTooltip;

  const ProductDetailScreen({
    super.key,
    required this.product,
    required this.cartState,
    required this.localeProvider,
    this.initialOpenZoom = false,
    this.initialOpenColdTooltip = false,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = localeProvider.isRtl;
    final lang = localeProvider.currentLanguage;
    final auth = AuthState();

    return AnimatedBuilder(
      animation: Listenable.merge([cartState, auth]),
      builder: (context, _) {
        final quantity = cartState.getQuantity(product.id);
        final isFav = auth.isFavorite(product.id);
        final displayName = (lang == 'ckb' && product.nameCkb != null && product.nameCkb!.isNotEmpty)
            ? product.nameCkb!
            : (lang == 'ar' && product.nameAr != null && product.nameAr!.isNotEmpty
                ? product.nameAr!
                : product.name);
        final priceStr = product.getLocalizedPrice(lang);
        final oldPriceStr = product.getLocalizedOldPrice(lang);

        if (initialOpenZoom) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _showZoomablePhotoDialog(context, product, displayName);
          });
        } else if (initialOpenColdTooltip) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _showColdStorageDialog(context, isRtl, lang);
          });
        }

        return Scaffold(
          backgroundColor: AppColors.scaffoldBackground,
          appBar: AppBar(
            automaticallyImplyLeading: false,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: InkWell(
                onTap: () => Navigator.pop(context),
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFE0E0E0), width: 1.2),
                    color: Colors.white,
                  ),
                  child: Center(
                    child: Icon(
                      isRtl
                          ? Icons.arrow_forward_ios_rounded
                          : Icons.arrow_back_ios_new_rounded,
                      color: AppColors.textPrimary,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share_outlined, color: AppColors.textPrimary),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isRtl ? 'بەستەری بەرهەم لەبەرگیراوە: bazmart.app/p/${product.id}' : 'Product link copied: bazmart.app/p/${product.id}',
                      ),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
              ),
              IconButton(
                icon: Icon(
                  isFav ? Icons.favorite : Icons.favorite_border,
                  color: isFav ? Colors.red : AppColors.textPrimary,
                ),
                onPressed: () {
                  auth.toggleFavorite(product.id);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isFav
                            ? (isRtl ? 'لە دڵخوازەکان لادرا' : 'Removed from favorites')
                            : (isRtl ? 'زیادکرا بۆ دڵخوازەکان ❤️' : 'Added to favorites ❤️'),
                      ),
                      duration: const Duration(seconds: 1),
                    ),
                  );
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Large Centered Product Image Container (height: 260px)
                Container(
                  width: double.infinity,
                  height: 260,
                  color: AppColors.productBoxSurface,
                  child: Stack(
                    children: [
                      Center(
                        child: GestureDetector(
                          onTap: () => _showZoomablePhotoDialog(context, product, displayName),
                          child: Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.06),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Stack(
                              children: [
                                Center(
                                  child: ProductPackagingVisual(product: product, size: 124),
                                ),
                                Positioned(
                                  bottom: 6,
                                  right: 6,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.85),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.zoom_in_rounded, size: 16, color: AppColors.primaryOrange),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // Out of stock overlay badge
                      if (product.stockQuantity <= 0)
                        Positioned(
                          top: 16,
                          left: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.85),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              isRtl ? 'تەواو بووە (Out of Stock)' : 'Out of Stock',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),

                      // Discount Badge if present
                      if (product.isOnSale && product.discountBadgeText.isNotEmpty && product.stockQuantity > 0)
                        Positioned(
                          top: 16,
                          left: 16,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.discountBadge,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              product.discountBadgeText,
                              style: const TextStyle(
                                color: Colors.black,
                                fontSize: 12,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // White Details Body with Rounded Top Corners (24px) & Upward Shadow
                Container(
                  transform: Matrix4.translationValues(0.0, -20.0, 0.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 10,
                        offset: const Offset(0, -3),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Underlined Clickable Brand Name
                      InkWell(
                        onTap: () {
                          final brandModel = MockErpCatalog.allBrands.firstWhere(
                            (b) => b.name.toLowerCase() == product.brand.toLowerCase(),
                            orElse: () => BrandModel(
                              id: 'b-custom',
                              name: product.brand,
                              backgroundColor: const Color(0xFF2196F3),
                              textColor: Colors.white,
                            ),
                          );
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BrandStoreScreen(
                                brand: brandModel,
                                localeProvider: localeProvider,
                                cartState: cartState,
                              ),
                            ),
                          );
                        },
                        child: Text(
                          product.brand,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryOrange,
                            decoration: TextDecoration.underline,
                            decorationColor: AppColors.primaryOrange,
                          ),
                        ),
                      ),

                      const SizedBox(height: 6),

                      // Bold 20px Product Title (Localized)
                      Text(
                        displayName,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          height: 1.25,
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Metadata Row: "1 L  •  Stored at 5° ⓘ" with Interactive Info Dialog
                      Row(
                        children: [
                          Text(
                            product.unit,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textMuted,
                            ),
                          ),
                          if (product.storageTemp != null) ...[
                            const SizedBox(width: 8),
                            const Text(
                              '•',
                              style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                            ),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: () => _showColdStorageDialog(context, isRtl, lang),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    product.storageTemp!,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.info_outline, size: 14, color: AppColors.textMuted),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),

                      // 3 Informative Grocery Metadata Pills
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.verified_rounded, size: 16, color: Color(0xFF10B981)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    isRtl
                                        ? '✓ ١٠٠٪ هەمان نرخی سەر ڕەفەی سووپەرمارکێت (بێ هیچ زیادکردنێک)'
                                        : '✓ 100% Supermarket Shelf Price Guarantee (0 IQD markup)',
                                    style: const TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF0F172A),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 14, color: Color(0xFFE2E8F0)),
                            Row(
                              children: [
                                const Icon(Icons.storefront_rounded, size: 16, color: AppColors.primaryOrange),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    '${product.displayAisleLocation} • ${product.sku}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF334155),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 14, color: Color(0xFFE2E8F0)),
                            Row(
                              children: [
                                const Icon(Icons.eco_rounded, size: 16, color: Color(0xFF16A34A)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    isRtl
                                        ? '🌿 گەرەنتی تازەیی و حەڵاڵ • لە پلەی گونجاوی ساردکەرەوە پارێزراوە'
                                        : '🌿 Freshness & 100% Halal Guaranteed • Stored at optimal temp',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 16),

                      // "Frequently bought together" section
                      Text(
                        localeProvider.translate('frequently_bought_together'),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),

                      SizedBox(
                        height: 225,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: MockErpCatalog.frequentlyBoughtTogether.length,
                          itemBuilder: (context, index) {
                            final item = MockErpCatalog.frequentlyBoughtTogether[index];
                            return ProductCard(
                              product: item,
                              cartState: cartState,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (ctx) => ProductDetailScreen(
                                      product: item,
                                      cartState: cartState,
                                      localeProvider: localeProvider,
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Sticky Bottom Bar: Left: Price, Right: Add to Cart / Quantity Stepper
          bottomNavigationBar: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 10,
                  offset: const Offset(0, -3),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  // Price on the left
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (product.isOnSale) ...[
                        PriceHighlighterWidget(
                          priceText: priceStr,
                          textStyle: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          oldPriceStr,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ] else
                        Text(
                          priceStr,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                          ),
                        ),
                    ],
                  ),

                  const Spacer(),

                  // Add to Cart Button or Stepper + Direct View Cart Button
                  _buildActionButton(context, isRtl, quantity),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildActionButton(BuildContext context, bool isRtl, int quantity) {
    if (product.stockQuantity <= 0) {
      return Container(
        height: 50,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: ElevatedButton.icon(
          key: const ValueKey('notify_me_btn'),
          onPressed: () async {
            final phone = AuthState().phone ?? '+9647701234567';
            final messenger = ScaffoldMessenger.of(context);
            await ApiClient().subscribeStockAlert(phone: phone, productId: product.id);
            messenger.showSnackBar(
              SnackBar(
                content: Text(
                  isRtl
                      ? '✓ ئاگادارکردنەوە چالاک کرا بۆ ئەم بەرهەمە!'
                      : '✓ Alert set! We will notify you when back in stock.',
                ),
                backgroundColor: const Color(0xFF10B981),
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryOrange,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            elevation: 0,
          ),
          icon: const Icon(Icons.notifications_active_outlined, size: 18),
          label: Text(
            isRtl ? 'ئاگادارم بکەرەوە 🔔' : 'Notify Me 🔔',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
          ),
        ),
      );
    }

    if (quantity == 0) {
      return SizedBox(
        width: MediaQuery.of(context).size.width * 0.58,
        height: 50,
        child: ElevatedButton(
          onPressed: () {
            cartState.addToCart(product);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(isRtl ? '✓ زیادکرا بۆ سەبەتەکەت!' : '✓ Added to cart!'),
                duration: const Duration(seconds: 1),
                backgroundColor: const Color(0xFF16A34A),
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryOrange,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(25),
            ),
            elevation: 0,
          ),
          child: Text(
            localeProvider.translate('add_to_cart'),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          height: 48,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFE5E5E5), width: 1.2),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.remove, color: AppColors.primaryOrange, size: 18),
                onPressed: () => cartState.decrementQuantity(product.id),
              ),
              Text(
                '$quantity',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add, color: AppColors.primaryOrange, size: 18),
                onPressed: () => cartState.addToCart(product),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),
        InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => CartScreen(
                  cartState: cartState,
                  localeProvider: localeProvider,
                ),
              ),
            );
          },
          borderRadius: BorderRadius.circular(24),
          child: Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.primaryOrange,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.shopping_bag_outlined, color: Colors.white, size: 16),
                const SizedBox(width: 4),
                Text(
                  isRtl ? 'سەبەتە' : 'Cart',
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showColdStorageDialog(BuildContext context, bool isRtl, String lang) {
    final coldTitle = isRtl
        ? (lang == 'ckb' ? 'ساردکەرەوەی دارک ستۆر' : 'تبريد المتجر المظلم')
        : 'Dark Store Cold Storage';
    final coldBody = isRtl
        ? (lang == 'ckb'
            ? 'کۆگاکانی دارکستۆری بازمارت سیستەمی زنجیرەی ساردی توند (٢ تا ٥ پلەی سەدی) لە وەرگرتنی کێڵگە تا بەردەرگا پەیڕەو دەکەن بۆ پاراستنی تەواوی تازەیی بەرهەم.'
            : 'تحافظ متاجر بازمارت المظلمة على تبريد صارم لسلسلة التبريد بين ٢ إلى ٥ درجات مئوية من المزرعة حتى التوصيل لضمان قمة النضارة.')
        : 'BazMart dark stores maintain strict cold-chain refrigeration between 2°C and 5°C from local farm intake to delivery, ensuring peak freshness.';
    final coldOk = isRtl ? (lang == 'ckb' ? 'باشە' : 'حسناً') : 'Got it';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.ac_unit, color: AppColors.primaryOrange, size: 24),
            const SizedBox(width: 8),
            Expanded(child: Text(coldTitle, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800))),
          ],
        ),
        content: Text(
          coldBody,
          style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.textPrimary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(coldOk, style: const TextStyle(color: AppColors.primaryOrange, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _showZoomablePhotoDialog(BuildContext context, ProductModel product, String displayName) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: const [
                  BoxShadow(color: Colors.black26, blurRadius: 20, spreadRadius: 4),
                ],
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    displayName,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: 280,
                    height: 280,
                    child: InteractiveViewer(
                      minScale: 0.8,
                      maxScale: 4.0,
                      child: ProductPackagingVisual(product: product, size: 260),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    '🔍 پەنجە بنێ بە وێنەکەدا بۆ نزیککردنەوە (Pinch to zoom)',
                    style: TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                ],
              ),
            ),
            Positioned(
              top: 8,
              right: 8,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.black87),
                onPressed: () => Navigator.of(ctx).pop(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
