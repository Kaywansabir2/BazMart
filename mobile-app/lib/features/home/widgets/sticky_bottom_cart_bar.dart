import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/state/cart_state.dart';
import '../../../core/localization/app_locale.dart';
import '../../../core/utils/linguistic_normalizer.dart';
import '../../../core/data/mock_erp_catalog.dart';
import '../../category/category_products_screen.dart';
import '../../search/search_screen.dart';
import '../../profile/profile_screen.dart';
import '../../order_tracking/order_tracking_screen.dart';
import '../home_screen.dart';

/// BazMart Integrated Docked Bottom Bar + Cart Hub
/// High-precision quick-commerce navigation combining:
/// 1. Upper Tier: Live Cart Threshold / Minimum Order / Active Cart Bar
/// 2. Lower Tier: Persistent 5-Tab Docked Pages Navigator (Home, Categories, Search, Orders, Profile)
class StickyBottomCartBar extends StatelessWidget {
  final CartState cartState;
  final LocaleProvider localeProvider;
  final VoidCallback onViewCart;
  final int activeTabIndex;
  final ValueChanged<int>? onTabSelected;
  final bool showNavTabs;

  const StickyBottomCartBar({
    super.key,
    required this.cartState,
    required this.localeProvider,
    required this.onViewCart,
    this.activeTabIndex = 0,
    this.onTabSelected,
    this.showNavTabs = true,
  });

  void _handleTabTap(BuildContext context, int index) {
    if (onTabSelected != null) {
      onTabSelected!(index);
      return;
    }

    if (index == activeTabIndex) {
      // Already on current tab
      return;
    }

    switch (index) {
      case 0:
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => HomeScreen(
              cartState: cartState,
              localeProvider: localeProvider,
            ),
          ),
          (route) => false,
        );
        break;
      case 1:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => CategoryProductsScreen(
              category: MockErpCatalog.allCategories.length > 4
                  ? MockErpCatalog.allCategories[4]
                  : MockErpCatalog.allCategories.first,
              localeProvider: localeProvider,
              cartState: cartState,
            ),
          ),
        );
        break;
      case 2:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => SearchScreen(
              cartState: cartState,
              localeProvider: localeProvider,
            ),
          ),
        );
        break;
      case 3:
        if (cartState.activeOrderNumber != null) {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => OrderTrackingScreen(
                orderNumber: cartState.activeOrderNumber!,
                orderId: cartState.activeOrderNumber!,
                totalIqd: cartState.activeOrderTotalIqd ?? 18500,
                deliveryAddress: 'Sulaymaniyah Central Hub',
                driverName: 'Karwan Sleman',
                driverPhone: '+964 770 491 8822',
                estimatedMinutes: '14 mins',
                localeProvider: localeProvider,
              ),
            ),
          );
        } else {
          onViewCart();
        }
        break;
      case 4:
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => const ProfileScreen(),
          ),
        );
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalAmount = cartState.totalAmountIqd;
    final totalCount = cartState.totalItemCount;
    final remaining = cartState.remainingForMinOrder;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          top: BorderSide(color: Color(0xFFE5E7EB), width: 1.0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ==============================================================
            // UPPER TIER: CART HUB / THRESHOLD TRACKER
            // ==============================================================
            if (totalCount == 0)
              // -------------------------------------------------------------
              // State A: Empty Cart (Threshold Progress Bar)
              // -------------------------------------------------------------
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.shopping_bag_outlined,
                          size: 18,
                          color: Color(0xFF8E8E93),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            localeProvider.translate(
                              'min_order_threshold_msg',
                              params: {
                                'remaining': LinguisticNormalizer.formatWithSeparators(
                                  remaining,
                                  localeProvider.currentLanguage,
                                ),
                              },
                            ),
                            style: const TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 7),
                    Container(
                      width: double.infinity,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE5E7EB),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ],
                ),
              )
            else
              // -------------------------------------------------------------
              // State B: Active Cart (Full-width rounded #FF5A00 orange pill)
              // -------------------------------------------------------------
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: onViewCart,
                  child: Container(
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppColors.primaryOrange,
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryOrange.withOpacity(0.35),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        // Left: Item count inside darker circle badge
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFE64A00).withOpacity(0.55),
                          ),
                          child: Center(
                            child: Text(
                              '$totalCount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),

                        // Center: Bold white "View cart" / "بینینی سەبەتە"
                        Expanded(
                          child: Center(
                            child: Text(
                              localeProvider.translate('view_cart'),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.2,
                              ),
                            ),
                          ),
                        ),

                        // Right: Bold white total price
                        Text(
                          localeProvider.isKurdish
                              ? '$totalAmount دینار'
                              : (localeProvider.isArabic ? '$totalAmount د.ع' : 'IQD $totalAmount'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // ==============================================================
            // LOWER TIER: PERSISTENT DOCKED PAGES NAVIGATION BAR (5 TABS)
            // ==============================================================
            if (showNavTabs) ...[
              const Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
              Container(
                height: 54,
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavTab(
                      context,
                      index: 0,
                      iconActive: Icons.home_rounded,
                      iconInactive: Icons.home_outlined,
                      labelKey: 'nav_home',
                      fallbackLabel: 'ماڵەوە',
                    ),
                    _buildNavTab(
                      context,
                      index: 1,
                      iconActive: Icons.grid_view_rounded,
                      iconInactive: Icons.grid_view_outlined,
                      labelKey: 'nav_categories',
                      fallbackLabel: 'پۆلەکان',
                    ),
                    _buildNavTab(
                      context,
                      index: 2,
                      iconActive: Icons.search_rounded,
                      iconInactive: Icons.search_outlined,
                      labelKey: 'nav_search',
                      fallbackLabel: 'گەڕان',
                    ),
                    _buildNavTab(
                      context,
                      index: 3,
                      iconActive: Icons.receipt_long_rounded,
                      iconInactive: Icons.receipt_long_outlined,
                      labelKey: 'nav_orders',
                      fallbackLabel: 'داواکاری',
                      showActiveDot: cartState.activeOrderNumber != null,
                    ),
                    _buildNavTab(
                      context,
                      index: 4,
                      iconActive: Icons.person_rounded,
                      iconInactive: Icons.person_outline_rounded,
                      labelKey: 'nav_profile',
                      fallbackLabel: 'هەژمار',
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildNavTab(
    BuildContext context, {
    required int index,
    required IconData iconActive,
    required IconData iconInactive,
    required String labelKey,
    required String fallbackLabel,
    bool showActiveDot = false,
  }) {
    final isSelected = activeTabIndex == index;
    final label = localeProvider.translate(labelKey);
    final displayLabel = label.isNotEmpty ? label : fallbackLabel;

    return Expanded(
      child: InkWell(
        onTap: () => _handleTabTap(context, index),
        borderRadius: BorderRadius.circular(12),
        splashColor: AppColors.primaryOrangeLight,
        highlightColor: AppColors.primaryOrangeLight.withOpacity(0.5),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon with optional live badge
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    isSelected ? iconActive : iconInactive,
                    size: isSelected ? 22 : 21,
                    color: isSelected ? AppColors.primaryOrange : const Color(0xFF64748B),
                  ),
                  if (showActiveDot)
                    Positioned(
                      top: -1,
                      right: -3,
                      child: Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 1.2),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 2),
              // Label
              Text(
                displayLabel,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? AppColors.primaryOrange : const Color(0xFF64748B),
                  fontFamily: 'Vazirmatn',
                  letterSpacing: -0.1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
