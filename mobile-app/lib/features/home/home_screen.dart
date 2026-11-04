import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/state/cart_state.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../../core/models/product_model.dart';
import '../../core/models/category_model.dart';
import '../../core/models/brand_model.dart';
import '../../core/models/country_origin_model.dart';
import 'widgets/sticky_top_bar.dart';
import 'widgets/vertical_promo_card.dart';
import 'widgets/product_card.dart';
import 'widgets/category_grid.dart';
import 'widgets/brand_tile.dart';
import 'widgets/country_flag_avatar.dart';
import 'widgets/promo_banner_card.dart';
import 'widgets/sticky_bottom_cart_bar.dart';
import '../product_detail/product_detail_screen.dart';
import '../cart/cart_screen.dart';
import '../search/search_screen.dart';
import '../category/category_products_screen.dart';
import '../brand/brand_store_screen.dart';
import '../country/country_products_screen.dart';
import '../profile/profile_screen.dart';
import '../notifications/notifications_screen.dart';
import '../order_tracking/order_tracking_screen.dart';

class HomeScreen extends StatefulWidget {
  final CartState cartState;
  final LocaleProvider localeProvider;

  const HomeScreen({
    super.key,
    required this.cartState,
    required this.localeProvider,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final PageController _bannerController = PageController(viewportFraction: 0.90);
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final uri = Uri.base;
      final scrollParam = uri.queryParameters['scroll'];
      if (scrollParam != null && _scrollController.hasClients) {
        if (scrollParam == 'category') {
          _scrollController.jumpTo(300);
        } else if (scrollParam == 'pepsi') {
          _scrollController.jumpTo(780);
        } else if (scrollParam == 'top_savers') {
          _scrollController.jumpTo(1780);
        } else if (scrollParam == 'fresh_picks') {
          _scrollController.jumpTo(2080);
        } else if (scrollParam == 'tabasco') {
          _scrollController.jumpTo(2460);
        }
      }

      final modalParam = uri.queryParameters['modal'];
      if (modalParam == 'address') {
        StickyTopBar.showAddressSelector(context, widget.localeProvider);
      } else if (modalParam == 'add_address') {
        StickyTopBar.showAddAddressSheet(context, widget.localeProvider);
      }
    });
  }

  @override
  void dispose() {
    _bannerController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _navigateToDetail(ProductModel product) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => ProductDetailScreen(
          product: product,
          cartState: widget.cartState,
          localeProvider: widget.localeProvider,
        ),
      ),
    );
  }

  void _navigateToCart() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => CartScreen(
          cartState: widget.cartState,
          localeProvider: widget.localeProvider,
        ),
      ),
    );
  }

  void _navigateToSearch() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => SearchScreen(
          localeProvider: widget.localeProvider,
          cartState: widget.cartState,
        ),
      ),
    );
  }

  void _navigateToCategory(CategoryModel category, {List<ProductModel>? customProducts, String? customTitle}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => CategoryProductsScreen(
          category: category,
          localeProvider: widget.localeProvider,
          cartState: widget.cartState,
          customProducts: customProducts,
          customTitle: customTitle,
        ),
      ),
    );
  }

  void _navigateToBrand(BrandModel brand) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => BrandStoreScreen(
          brand: brand,
          localeProvider: widget.localeProvider,
          cartState: widget.cartState,
        ),
      ),
    );
  }

  void _navigateToCountry(CountryOriginModel country) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => CountryProductsScreen(
          country: country,
          localeProvider: widget.localeProvider,
          cartState: widget.cartState,
        ),
      ),
    );
  }

  void _navigateToProfile() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => const ProfileScreen(),
      ),
    ).then((_) {
      setState(() {});
    });
  }

  void _navigateToNotifications() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => const NotificationsScreen(),
      ),
    ).then((_) {
      setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = widget.localeProvider;
    final cartState = widget.cartState;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: SafeArea(
        child: Column(
          children: [
            // Sticky Top Bar
            StickyTopBar(
              localeProvider: localeProvider,
              onSearchTap: _navigateToSearch,
              onBackTap: () {},
              onProfileTap: _navigateToProfile,
              onNotificationsTap: _navigateToNotifications,
              unreadNotificationsCount: 2,
            ),

            // Scrollable Body (Strictly in the exact 11-step order specified)
            Expanded(
              child: SingleChildScrollView(
                controller: _scrollController,
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 10),

                    // 1. Vertical Promo Cards Carousel (Up to 30% off, Kiri, Kurdistan Chicken, etc.)
                    SizedBox(
                      height: 175,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: MockErpCatalog.promoCards.length,
                        itemBuilder: (context, index) {
                          final card = MockErpCatalog.promoCards[index];
                          return VerticalPromoCard(
                            card: card,
                            localeProvider: localeProvider,
                            onTap: () {
                              _navigateToCategory(
                                MockErpCatalog.allCategories[0],
                                customTitle: card.getTitle(localeProvider.currentLanguage),
                                customProducts: MockErpCatalog.topSavers,
                              );
                            },
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 22),

                    // 2. "Buy again" section header with underlined "View all" + horizontal product cards
                    _buildSectionHeader(
                      title: localeProvider.translate('buy_again'),
                      actionText: localeProvider.translate('view_all'),
                      onActionTap: () {
                        _navigateToCategory(
                          MockErpCatalog.allCategories[4], // Dairy & Eggs
                          customTitle: localeProvider.translate('buy_again'),
                          customProducts: MockErpCatalog.buyAgainProducts,
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildProductCarousel(MockErpCatalog.buyAgainProducts),

                    const SizedBox(height: 24),

                    // 3. "Shop by category" 3x4 paginated grid with bottom progress indicator
                    _buildSectionHeader(title: localeProvider.translate('shop_by_category')),
                    const SizedBox(height: 12),
                    CategoryGrid(
                      localeProvider: localeProvider,
                      onCategoryTap: (cat) => _navigateToCategory(cat),
                    ),

                    const SizedBox(height: 24),

                    // 4. "Best sellers near you 🔥" horizontal product carousel
                    _buildSectionHeader(
                      title: localeProvider.translate('best_sellers_near_you'),
                      actionText: localeProvider.translate('view_all'),
                      onActionTap: () {
                        _navigateToCategory(
                          MockErpCatalog.allCategories[0],
                          customTitle: localeProvider.translate('best_sellers_near_you'),
                          customProducts: MockErpCatalog.bestSellers,
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildProductCarousel(MockErpCatalog.bestSellers),

                    const SizedBox(height: 22),

                    // 5. Full-width rounded promotional banner: Pepsi Carousel with viewportFraction 0.90
                    SizedBox(
                      height: 112,
                      child: PageView(
                        controller: _bannerController,
                        children: [
                          PromoBannerCard(
                            themeType: 'pepsi',
                            margin: const EdgeInsets.symmetric(horizontal: 6),
                            localeProvider: localeProvider,
                            onTap: () {
                              _navigateToCategory(
                                MockErpCatalog.allCategories[5], // Beverages
                                customTitle: localeProvider.isKurdish
                                    ? 'عەرزی فرێشکەرەوەی پیپسی'
                                    : (localeProvider.isArabic ? 'عروض بيبسي المنعشة' : 'Pepsi Refreshment Deals'),
                                customProducts: MockErpCatalog.bestSellers,
                              );
                            },
                          ),
                          PromoBannerCard(
                            themeType: 'nescafe',
                            margin: const EdgeInsets.symmetric(horizontal: 6),
                            localeProvider: localeProvider,
                            onTap: () {
                              _navigateToCategory(
                                MockErpCatalog.allCategories[7], // Coffee & Tea
                                customTitle: localeProvider.isKurdish
                                    ? 'کۆکراوەی قاوەی ساردی نیسکافێ'
                                    : (localeProvider.isArabic ? 'تشكيلة نسكافيه الباردة' : 'Nescafé Cold Coffee Collection'),
                                customProducts: MockErpCatalog.nescafeIced,
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 175,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: 3,
                        itemBuilder: (context, index) {
                          final card = MockErpCatalog.promoCards[index + 3];
                          return VerticalPromoCard(
                            card: card,
                            localeProvider: localeProvider,
                            onTap: () {
                              _navigateToCategory(
                                MockErpCatalog.allCategories[index],
                                customTitle: card.getTitle(localeProvider.currentLanguage),
                              );
                            },
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 24),

                    // 6. "Shop by Brand" 2-row horizontal grid
                    _buildSectionHeader(title: localeProvider.translate('shop_by_brand')),
                    const SizedBox(height: 12),
                    ShopByBrandWidget(
                      onBrandTap: (brand) => _navigateToBrand(brand),
                    ),

                    const SizedBox(height: 24),

                    // 7. "Around the world" circular flag carousel
                    _buildSectionHeader(title: localeProvider.translate('around_the_world')),
                    const SizedBox(height: 12),
                    AroundTheWorldWidget(
                      localeProvider: localeProvider,
                      onCountryTap: (country) => _navigateToCountry(country),
                    ),

                    const SizedBox(height: 24),

                    // 8. "Top savers" horizontal product carousel
                    _buildSectionHeader(
                      title: localeProvider.translate('top_savers'),
                      actionText: localeProvider.translate('view_all'),
                      onActionTap: () {
                        _navigateToCategory(
                          MockErpCatalog.allCategories[0],
                          customTitle: localeProvider.translate('top_savers'),
                          customProducts: MockErpCatalog.topSavers,
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildProductCarousel(MockErpCatalog.topSavers),

                    const SizedBox(height: 22),

                    // 9. Split promotional banner: "Fresh picks every day" + fresh produce carousel
                    PromoBannerCard(
                      themeType: 'fresh_picks',
                      localeProvider: localeProvider,
                      onTap: () {
                        _navigateToCategory(
                          MockErpCatalog.allCategories[0], // Fruit & Veg
                          customTitle: localeProvider.translate('fresh_picks_every_day'),
                          customProducts: MockErpCatalog.freshPicks,
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildProductCarousel(MockErpCatalog.freshPicks),

                    const SizedBox(height: 24),

                    // 10. "Tabasco noodle flavors" horizontal product carousel
                    _buildSectionHeader(
                      title: localeProvider.translate('tabasco_noodle_flavors'),
                      actionText: localeProvider.translate('view_all'),
                      onActionTap: () {
                        _navigateToCategory(
                          MockErpCatalog.allCategories[10], // Ready to Eat
                          customTitle: localeProvider.translate('tabasco_noodle_flavors'),
                          customProducts: MockErpCatalog.tabascoNoodles,
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    _buildProductCarousel(MockErpCatalog.tabascoNoodles),

                    const SizedBox(height: 22),

                    // 11. Full-width promotional banner: Nescafé + canned iced coffee carousel
                    PromoBannerCard(
                      themeType: 'nescafe',
                      localeProvider: localeProvider,
                      onTap: () {
                        _navigateToCategory(
                          MockErpCatalog.allCategories[7], // Coffee & Tea
                          customTitle: localeProvider.isKurdish
                              ? 'کۆکراوەی قاوەی ساردی نیسکافێ'
                              : (localeProvider.isArabic ? 'تشكيلة نسكافيه الباردة' : 'Nescafé Cold Coffee Collection'),
                          customProducts: MockErpCatalog.nescafeIced,
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildProductCarousel(MockErpCatalog.nescafeIced),

                    const SizedBox(height: 120),
                  ],
                ),
              ),
            ),

            // Sticky Active Order Tracking Pill
            if (cartState.activeOrderNumber != null)
              InkWell(
                key: const ValueKey('sticky_active_order_pill'),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (ctx) => OrderTrackingScreen(
                        orderNumber: cartState.activeOrderNumber!,
                        totalIqd: cartState.activeOrderTotalIqd ?? 11250,
                        deliveryAddress: 'Erbil Central / Sulaymaniyah',
                        driverName: 'Karwan Ahmed',
                        driverPhone: '+964 750 491 8822',
                        estimatedMinutes: '12-15 mins',
                        localeProvider: localeProvider,
                      ),
                    ),
                  );
                },
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF2E7D32), Color(0xFF1B5E20)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [
                      BoxShadow(color: Color(0x20000000), blurRadius: 8, offset: Offset(0, 2)),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.two_wheeler_rounded, color: Colors.white, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Live Order #${cartState.activeOrderNumber} • ${cartState.activeOrderStatus ?? "Packing"} -> Track',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 12),
                    ],
                  ),
                ),
              ),

            // Sticky Bottom Bar (Minimum Order & View Cart)
            StickyBottomCartBar(
              cartState: cartState,
              localeProvider: localeProvider,
              activeTabIndex: 0,
              onViewCart: _navigateToCart,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader({
    required String title,
    String? actionText,
    VoidCallback? onActionTap,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
                letterSpacing: -0.2,
              ),
            ),
          ),
          if (actionText != null)
            Padding(
              padding: const EdgeInsets.only(left: 8.0),
              child: InkWell(
                onTap: onActionTap,
                child: Text(
                  actionText,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryOrange,
                    decoration: TextDecoration.underline,
                    decorationColor: AppColors.primaryOrange,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProductCarousel(List<ProductModel> products) {
    return SizedBox(
      height: 260,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: products.length,
        itemBuilder: (context, index) {
          final prod = products[index];
          return ProductCard(
            product: prod,
            cartState: widget.cartState,
            onTap: () => _navigateToDetail(prod),
          );
        },
      ),
    );
  }
}
