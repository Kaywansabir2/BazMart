import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/state/cart_state.dart';
import '../../core/models/country_origin_model.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../home/widgets/product_card.dart';
import '../home/widgets/sticky_bottom_cart_bar.dart';
import '../home/widgets/country_flag_avatar.dart';
import '../product_detail/product_detail_screen.dart';
import '../cart/cart_screen.dart';

class CountryProductsScreen extends StatelessWidget {
  final CountryOriginModel country;
  final LocaleProvider localeProvider;
  final CartState cartState;

  const CountryProductsScreen({
    super.key,
    required this.country,
    required this.localeProvider,
    required this.cartState,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = localeProvider.isRtl;

    final countryName = isRtl && localeProvider.currentLanguage == 'ckb'
        ? country.nameCkb
        : (isRtl ? country.nameAr : country.nameEn);

    // Filter products from this country / region
    final countryProducts = MockErpCatalog.allProducts.where((p) {
      if (p.countryOriginId != null && p.countryOriginId!.isNotEmpty) {
        return p.countryOriginId == country.id;
      }
      if (country.flagType == 'kurdistan') {
        return ['prod_alrahma_milk', 'prod_ramak_milk', 'prod_white_eggs', 'prod_cucumber_local', 'prod_pepper_local'].contains(p.id) ||
            p.brand.toLowerCase().contains('local') ||
            p.brand.toLowerCase().contains('erbil') ||
            p.brand.toLowerCase().contains('rahma') ||
            p.brand.toLowerCase().contains('ramak');
      } else if (country.flagType == 'eu') {
        return p.brand == 'Almarai' || p.id == 'prod_almarai_milk' || p.id.contains('shampoo');
      } else if (country.flagType == 'usa') {
        return p.id.contains('tabasco');
      } else {
        return p.id.contains('tabasco_curry') || p.id.contains('korea');
      }
    }).toList();

    final displayedProducts = countryProducts.isNotEmpty
        ? countryProducts
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
                        countryName,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        localeProvider.translate('around_the_world'),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryOrange,
                        ),
                      ),
                    ],
                  ),
                ),
                CountryFlagAvatar(
                  country: country,
                  localeProvider: localeProvider,
                  size: 40,
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
                  // Country Banner
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primaryOrange.withOpacity(0.08),
                          AppColors.productBoxSurface,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.dividerColor),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.public, color: AppColors.primaryOrange, size: 28),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            '${localeProvider.translate('origin_products')} $countryName (${displayedProducts.length} ${localeProvider.translate('items')})',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
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
