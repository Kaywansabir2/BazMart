import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/state/cart_state.dart';
import '../../core/localization/app_locale.dart';
import '../../core/utils/linguistic_normalizer.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../checkout/checkout_screen.dart';
import '../search/search_screen.dart';
import 'widgets/coupon_voucher_card.dart';
import 'widgets/available_coupons_sheet.dart';
import '../../core/state/auth_state.dart';
import '../auth/auth_sheet.dart';
import '../../core/widgets/product_packaging_visual.dart';

class CartScreen extends StatefulWidget {
  final CartState cartState;
  final LocaleProvider localeProvider;
  final bool showMidCartSyncBanner;
  final bool initialOpenCoupons;

  const CartScreen({
    super.key,
    required this.cartState,
    required this.localeProvider,
    this.showMidCartSyncBanner = false,
    this.initialOpenCoupons = false,
  });

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  @override
  void initState() {
    super.initState();
    if (widget.initialOpenCoupons) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => AvailableCouponsSheet(
            cartState: widget.cartState,
            localeProvider: widget.localeProvider,
            onApplyCoupon: (code) {},
          ),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartState = widget.cartState;
    final localeProvider = widget.localeProvider;
    final isRtl = localeProvider.isRtl;
    final isMet = cartState.isMinimumOrderMet;
    final remaining = cartState.remainingForMinOrder;
    final totalAmount = cartState.totalAmountIqd;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
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
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              localeProvider.translate('cart'),
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              localeProvider.translate('bazmart'),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.primaryOrange,
              ),
            ),
          ],
        ),
        actions: [
          // Pill-shaped "+ Add items" button with grey border opening SearchScreen
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SearchScreen(
                      localeProvider: localeProvider,
                      cartState: cartState,
                    ),
                  ),
                );
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.dividerColor, width: 1.2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                padding: const EdgeInsets.symmetric(horizontal: 14),
              ),
              child: Text(
                localeProvider.translate('add_items'),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.showMidCartSyncBanner)
              Container(
                margin: const EdgeInsets.all(14),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFFB300), width: 1.2),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.sync_problem_rounded, color: Color(0xFFE65100), size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isRtl ? 'نوێکردنەوەی نرخی کۆگای خێرا' : 'Dark Store Inventory Price Sync',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFFE65100)),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            isRtl
                                ? 'نرخ و بڕی بەردەست لە کۆگای بەردەست لەگەڵ سیستەمی ERP نوێکرایەوە.'
                                : 'Prices and stock in your basket were automatically synchronized with Dark Store live ERP inventory.',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF5D4037)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            // "Grab your usuals" horizontal upsell carousel
            Container(
              color: AppColors.productBoxSurface.withOpacity(0.5),
              padding: const EdgeInsets.only(top: 14, bottom: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      localeProvider.translate('grab_your_usuals'),
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 110,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: MockErpCatalog.grabYourUsuals.length,
                      itemBuilder: (context, index) {
                        final product = MockErpCatalog.grabYourUsuals[index];
                        final qty = cartState.getQuantity(product.id);

                        return Container(
                          width: 200,
                          margin: const EdgeInsets.only(right: 12),
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.dividerColor),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: AppColors.productBoxSurface,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Center(
                                  child: ProductPackagingVisual(product: product, size: 44),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      product.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      product.formattedPrice,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              GestureDetector(
                                onTap: () => cartState.addToCart(product),
                                child: Container(
                                  width: 28,
                                  height: 28,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: qty > 0 ? AppColors.primaryOrange : AppColors.productBoxSurface,
                                  ),
                                  child: Center(
                                    child: qty > 0
                                        ? Text(
                                            '$qty',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w800,
                                            ),
                                          )
                                        : const Icon(
                                            Icons.add,
                                            color: AppColors.primaryOrange,
                                            size: 16,
                                          ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Cart Items Vertical List
            if (cartState.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.remove_shopping_cart_outlined, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      Text(
                        localeProvider.currentLanguage == 'ckb'
                            ? 'سەبەتەکەت بەتاڵە'
                            : (localeProvider.currentLanguage == 'ar'
                                ? 'سلتك فارغة حالياً'
                                : 'Your cart is currently empty'),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 14),
                      ElevatedButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.storefront_rounded, size: 18),
                        label: Text(
                          localeProvider.currentLanguage == 'ckb'
                              ? 'گەڕانەوە بۆ بازاڕکردن'
                              : (localeProvider.currentLanguage == 'ar'
                                  ? 'العودة للتسوق'
                                  : 'Start Shopping'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryOrange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          elevation: 0,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.separated(
                physics: const NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: cartState.itemList.length,
                separatorBuilder: (context, index) => const Divider(height: 24),
                itemBuilder: (context, index) {
                  final cartItem = cartState.itemList[index];
                  final product = cartItem.product;

                  return Row(
                    children: [
                      // 64x64px rounded image box
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: AppColors.productBoxSurface,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: ProductPackagingVisual(product: product, size: 56),
                        ),
                      ),

                      const SizedBox(width: 12),

                      // 2-line product title and total item price
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product.name,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              cartItem.formattedTotal,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Pill-shaped quantity stepper (- 1 +)
                      Container(
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppColors.searchFieldBackground,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.dividerColor),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 16, color: AppColors.primaryOrange),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 32, minHeight: 36),
                              onPressed: () {
                                setState(() {
                                  cartState.decrementQuantity(product.id);
                                });
                              },
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 4),
                              child: Text(
                                '${cartItem.quantity}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 16, color: AppColors.primaryOrange),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(minWidth: 32, minHeight: 36),
                              onPressed: () {
                                setState(() {
                                  cartState.addToCart(product);
                                });
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                },
              ),

            const SizedBox(height: 16),
            const Divider(thickness: 4, color: AppColors.productBoxSurface),
            const SizedBox(height: 10),

            // Promotional Coupon & Voucher Card
            if (!cartState.isEmpty)
              CouponVoucherCard(
                cartState: cartState,
                localeProvider: localeProvider,
                onCouponChanged: () => setState(() {}),
              ),

            // Order Summary Breakdown
            if (!cartState.isEmpty)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFAFAFA),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.dividerColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      localeProvider.translate('order_summary'),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Basket Subtotal
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          localeProvider.translate('basket_subtotal'),
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                        ),
                        Text(
                          LinguisticNormalizer.formatIqd(totalAmount, localeProvider.currentLanguage),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        ),
                      ],
                    ),

                    // Applied Coupon Discount (Highlighted in Green)
                    if (cartState.appliedCouponCode != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Text('🎟️', style: TextStyle(fontSize: 12)),
                              const SizedBox(width: 4),
                              Text(
                                '${cartState.appliedCouponCode}:',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF059669),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            '- ${LinguisticNormalizer.formatIqd(cartState.couponDiscountIqd, localeProvider.currentLanguage)}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF059669),
                            ),
                          ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 8),
                    // Delivery Fee
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          localeProvider.translate('delivery_fee'),
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                        ),
                        Text(
                          localeProvider.translate('free_delivery'),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFF059669)),
                        ),
                      ],
                    ),

                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 10),
                      child: Divider(height: 1, color: AppColors.dividerColor),
                    ),

                    // Total to Pay
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          localeProvider.isKurdish
                              ? 'کۆی گشتی (کاش لە کاتی وەرگرتن)'
                              : localeProvider.isArabic
                                  ? 'المجموع للدفع (نقداً عند الاستلام)'
                                  : 'Total to Pay (COD)',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          LinguisticNormalizer.formatIqd(cartState.finalTotalIqd, localeProvider.currentLanguage),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primaryOrange,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 8),
            const Divider(thickness: 4, color: AppColors.productBoxSurface),
            const SizedBox(height: 14),

            // Payment Method Preview
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    localeProvider.translate('payment_method'),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Cash on Delivery (COD) - Active Selected
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primaryOrangeLight.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.primaryOrange, width: 1.5),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.payments_outlined, color: AppColors.primaryOrange, size: 24),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                localeProvider.translate('cod'),
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              Text(
                                localeProvider.translate('cod_subtitle'),
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.check_circle, color: AppColors.primaryOrange, size: 20),
                      ],
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Other Gateways Marked "Gateway Ready"
                  _buildGatewayReadyTile('FastPay Wallet', Icons.account_balance_wallet_outlined),
                  const SizedBox(height: 6),
                  _buildGatewayReadyTile('ZainCash', Icons.phone_android_outlined),
                  const SizedBox(height: 6),
                  _buildGatewayReadyTile('First Iraqi Bank (FIB)', Icons.account_balance_outlined),
                  const SizedBox(height: 6),
                  _buildGatewayReadyTile('Visa / Mastercard', Icons.credit_card_outlined),
                ],
              ),
            ),

            const SizedBox(height: 100),
          ],
        ),
      ),

      // Sticky Bottom Checkout Bar
      bottomNavigationBar: Container(
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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Minimum order message if below IQD 7000
              if (!isMet && !cartState.isEmpty) ...[
                Text(
                  localeProvider.translate('min_order_threshold_msg', params: {'remaining': '$remaining'}),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryOrangeDark,
                  ),
                ),
                const SizedBox(height: 8),
              ],

              // Full-width #FF5A00 Orange Pill Button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: (!isMet || cartState.isEmpty)
                      ? null
                      : () {
                          final auth = AuthState();
                          if (!auth.isLoggedIn) {
                            AuthSheet.show(context, onSuccess: () {
                              if (mounted) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => CheckoutScreen(
                                      cartState: cartState,
                                      localeProvider: localeProvider,
                                    ),
                                  ),
                                );
                              }
                            });
                          } else {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => CheckoutScreen(
                                  cartState: cartState,
                                  localeProvider: localeProvider,
                                ),
                              ),
                            );
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryOrange,
                    disabledBackgroundColor: Colors.grey.shade300,
                    foregroundColor: Colors.white,
                    disabledForegroundColor: Colors.grey.shade600,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(27)),
                    elevation: isMet ? 3 : 0,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        LinguisticNormalizer.formatIqd(cartState.finalTotalIqd, localeProvider.currentLanguage),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      Text(
                        localeProvider.translate('checkout'),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Icon(
                        isRtl
                            ? Icons.arrow_back_ios_new_rounded
                            : Icons.arrow_forward_ios_rounded,
                        size: 20,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGatewayReadyTile(String name, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.productBoxSurface.withOpacity(0.6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.dividerColor),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.textMuted, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              name,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.dividerColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              widget.localeProvider.translate('gateway_ready'),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppColors.textMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
