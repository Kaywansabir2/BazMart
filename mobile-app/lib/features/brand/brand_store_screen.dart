import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/state/cart_state.dart';
import '../../core/models/brand_model.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../home/widgets/product_card.dart';
import '../home/widgets/sticky_bottom_cart_bar.dart';
import '../product_detail/product_detail_screen.dart';
import '../cart/cart_screen.dart';

class BrandStoreScreen extends StatelessWidget {
  final BrandModel brand;
  final LocaleProvider localeProvider;
  final CartState cartState;

  const BrandStoreScreen({
    super.key,
    required this.brand,
    required this.localeProvider,
    required this.cartState,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = localeProvider.isRtl;

    // Filter products from this brand or match related
    final brandProducts = MockErpCatalog.allProducts
        .where((p) => p.brand.toLowerCase().contains(brand.name.toLowerCase()))
        .toList();

    final displayedProducts = brandProducts.isNotEmpty
        ? brandProducts
        : MockErpCatalog.allProducts.take(6).toList();

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(64),
        child: Container(
          color: Colors.white,
          padding: const EdgeInsets.only(left: 16, right: 16, top: 10, bottom: 8),
          child: SafeArea(
            bottom: false,
            child: Row(
              children: [
                InkWell(
                  onTap: () => Navigator.pop(context),
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE0E0E0), width: 1.2),
                      color: Colors.white,
                    ),
                    child: Center(
                      child: Icon(
                        isRtl ? Icons.chevron_right : Icons.chevron_left,
                        color: AppColors.textPrimary,
                        size: 22,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        brand.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        localeProvider.translate('brand_store'),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryOrange,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),

      body: AnimatedBuilder(
        animation: cartState,
        builder: (context, _) {
          return Stack(
            children: [
              ListView(
                children: [
                  // Branded Top Hero Tile
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: brand.backgroundColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.dividerColor),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: brand.backgroundColor,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: Text(
                              brand.name.substring(0, 1).toUpperCase(),
                              style: TextStyle(
                                color: brand.textColor,
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                brand.name,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${displayedProducts.length} ${localeProvider.translate('items')} • 100% Authentic ERP Verified',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // 2-Column Product Grid
                  GridView.builder(
                    padding: const EdgeInsets.only(left: 16, right: 16, bottom: 120),
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 14,
                      childAspectRatio: 0.64,
                    ),
                    itemCount: displayedProducts.length,
                    itemBuilder: (context, index) {
                      final product = displayedProducts[index];

                      return ProductCard(
                        product: product,
                        cartState: cartState,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProductDetailScreen(
                                product: product,
                                cartState: cartState,
                                localeProvider: localeProvider,
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ],
              ),

              // Persistent Bottom Cart Bar
              if (!cartState.isEmpty)
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: StickyBottomCartBar(
                    cartState: cartState,
                    localeProvider: localeProvider,
                    onViewCart: () {
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
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
