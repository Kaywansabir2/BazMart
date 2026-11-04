import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/state/auth_state.dart';
import '../../core/state/cart_state.dart';
import '../../core/localization/app_locale.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../home/widgets/product_card.dart';
import '../product_detail/product_detail_screen.dart';
import '../home/widgets/sticky_bottom_cart_bar.dart';
import '../cart/cart_screen.dart';

class FavoritesScreen extends StatefulWidget {
  final LocaleProvider localeProvider;
  final CartState cartState;

  const FavoritesScreen({
    super.key,
    required this.localeProvider,
    required this.cartState,
  });

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  Widget build(BuildContext context) {
    final auth = AuthState();
    final isRtl = widget.localeProvider.isRtl;
    final lang = widget.localeProvider.currentLanguage;

    final favoriteProducts = MockErpCatalog.allProducts
        .where((p) => auth.isFavorite(p.id))
        .toList();

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBackground,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
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
                    isRtl ? Icons.chevron_right : Icons.chevron_left,
                    color: AppColors.textPrimary,
                    size: 20,
                  ),
                ),
              ),
            ),
          ),
          title: Text(
            isRtl
                ? (lang == 'ckb' ? 'لیستی دڵخوازەکانم ❤️' : 'قائمة المفضلة ❤️')
                : 'My Favorites ❤️',
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          actions: [
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${favoriteProducts.length} ${isRtl ? "کاڵا" : "items"}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Colors.red.shade700,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        body: Stack(
          children: [
            favoriteProducts.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.favorite_border_rounded, size: 40, color: Colors.redAccent),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          isRtl
                              ? (lang == 'ckb' ? 'هیچ کاڵایەکت لە دڵخوازەکان دانەناوە' : 'لا توجد منتجات في المفضلة')
                              : 'No favorite products yet',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          isRtl
                              ? (lang == 'ckb'
                                  ? 'دڵی سەر هەر کاڵایەک دابگرە بۆ ئەوەی بە خێرایی لەم بەشەدا بیاندۆزیتەوە'
                                  : 'اضغط على رمز القلب في أي منتج للوصول إليه بسرعة لاحقاً')
                              : 'Tap the heart icon on any product to easily find it here later',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 120),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          spacing: 12,
                          runSpacing: 14,
                          children: favoriteProducts.map((prod) {
                            return SizedBox(
                              width: 160,
                              child: Stack(
                                children: [
                                  ProductCard(
                                    product: prod,
                                    cartState: widget.cartState,
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => ProductDetailScreen(
                                            product: prod,
                                            cartState: widget.cartState,
                                            localeProvider: widget.localeProvider,
                                          ),
                                        ),
                                      ).then((_) => setState(() {}));
                                    },
                                  ),
                                  Positioned(
                                    top: 6,
                                    right: isRtl ? null : 6,
                                    left: isRtl ? 6 : null,
                                    child: InkWell(
                                      onTap: () {
                                        auth.toggleFavorite(prod.id);
                                        setState(() {});
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(5),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.9),
                                          shape: BoxShape.circle,
                                          boxShadow: const [
                                            BoxShadow(color: Colors.black12, blurRadius: 4),
                                          ],
                                        ),
                                        child: const Icon(
                                          Icons.favorite,
                                          color: Colors.red,
                                          size: 16,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),

            // Persistent Sticky Bottom Cart Bar
            if (!widget.cartState.isEmpty)
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: StickyBottomCartBar(
                  cartState: widget.cartState,
                  localeProvider: widget.localeProvider,
                  activeTabIndex: 4,
                  onViewCart: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CartScreen(
                          cartState: widget.cartState,
                          localeProvider: widget.localeProvider,
                        ),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
