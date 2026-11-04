import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/talabat_painters.dart';
import '../../../core/models/product_model.dart';
import '../../../core/state/cart_state.dart';
import '../../../core/state/auth_state.dart';
import '../../../core/network/api_client.dart';
import '../../../core/widgets/product_packaging_visual.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;
  final CartState cartState;
  final VoidCallback? onTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.cartState,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final lang = isRtl ? 'ckb' : 'en';
    final quantity = cartState.getQuantity(product.id);
    final hasDiscount = product.isOnSale;
    final discountBadge = product.getLocalizedDiscountBadge(lang);
    final priceStr = product.getLocalizedPrice(lang);
    final oldPriceStr = product.getLocalizedOldPrice(lang);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 148,
        margin: const EdgeInsetsDirectional.only(end: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image container box (148x148px, #F8FAFC surface, borderRadius: 14px)
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 148,
                  height: 148,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF1F5F9), width: 1),
                  ),
                  child: Center(
                    child: ProductPackagingVisual(product: product, size: 124),
                  ),
                ),

                // Out of stock overlay
                if (product.stockQuantity <= 0)
                  Container(
                    width: 148,
                    height: 148,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.75),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          isRtl ? 'تەواو بووە' : 'Out of Stock',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                  ),

                // Neon Green Discount Badge (#B8FF01)
                if (hasDiscount && discountBadge.isNotEmpty && product.stockQuantity > 0)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFB8FF01),
                        borderRadius: BorderRadius.circular(6),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 4,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                      child: Text(
                        discountBadge,
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ),
                  ),

                // Favorite Heart Button (Top Right)
                Positioned(
                  top: 6,
                  right: 6,
                  child: AnimatedBuilder(
                    animation: AuthState(),
                    builder: (context, _) {
                      final isFav = AuthState().isFavorite(product.id);
                      return GestureDetector(
                        onTap: () {
                          AuthState().toggleFavorite(product.id);
                          final phone = AuthState().phone;
                          if (phone != null) {
                            ApiClient().toggleFavorite(phone: phone, productId: product.id);
                          }
                        },
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 4),
                            ],
                          ),
                          child: Icon(
                            isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                            size: 16,
                            color: isFav ? Colors.redAccent : Colors.grey.shade400,
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Floating Add Button or Morphing Stepper (- 1 +)
                Positioned(
                  right: 6,
                  bottom: 6,
                  child: product.stockQuantity <= 0
                      ? GestureDetector(
                          onTap: () async {
                            final phone = AuthState().phone ?? '+9647701234567';
                            await ApiClient().subscribeStockAlert(phone: phone, productId: product.id);
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isRtl
                                        ? '🔔 کاتێک ئەم بەرهەمە بەردەست دەبێت، ئاگادارت دەکەینەوە!'
                                        : '🔔 We will notify you as soon as this item is back in stock!',
                                  ),
                                  duration: const Duration(seconds: 2),
                                  backgroundColor: AppColors.primaryOrange,
                                ),
                              );
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primaryOrange,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(color: Colors.orange.withOpacity(0.3), blurRadius: 4),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.notifications_active_outlined, color: Colors.white, size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  isRtl ? 'ئاگادارم بکەوە' : 'Notify',
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                                ),
                              ],
                            ),
                          ),
                        )
                      : (quantity > 0
                          ? Container(
                              height: 32,
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              decoration: BoxDecoration(
                                color: AppColors.primaryOrange,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.orange.withOpacity(0.4),
                                    blurRadius: 6,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  GestureDetector(
                                    behavior: HitTestBehavior.opaque,
                                    onTap: () {
                                      cartState.decrementQuantity(product.id);
                                    },
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 4),
                                      child: Icon(Icons.remove, size: 16, color: Colors.white),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 4),
                                    child: Text(
                                      '$quantity',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                  GestureDetector(
                                    behavior: HitTestBehavior.opaque,
                                    onTap: () {
                                      cartState.addToCart(product);
                                    },
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 4),
                                      child: Icon(Icons.add, size: 16, color: Colors.white),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : GestureDetector(
                              onTap: () {
                                cartState.addToCart(product);
                              },
                              child: Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.12),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: const Center(
                                  child: Icon(
                                    Icons.add,
                                    color: AppColors.primaryOrange,
                                    size: 20,
                                  ),
                                ),
                              ),
                            )),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Price Section with Yellow Highlighter Marker Strip for sale items
            if (hasDiscount)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  PriceHighlighterWidget(
                    priceText: priceStr,
                    textStyle: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    oldPriceStr,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textMuted,
                      decoration: TextDecoration.lineThrough,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              )
            else
              Text(
                priceStr,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),

            const SizedBox(height: 4),

            // Product Name (2 lines max, overflow ellipsis)
            Builder(
              builder: (ctx) {
                final isRtl = Directionality.of(ctx) == TextDirection.rtl;
                final displayName = isRtl && product.nameCkb != null && product.nameCkb!.isNotEmpty
                    ? product.nameCkb!
                    : product.name;
                return Text(
                  displayName,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                    height: 1.25,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
