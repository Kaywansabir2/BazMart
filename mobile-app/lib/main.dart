import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/app_locale.dart';
import 'core/state/cart_state.dart';
import 'core/data/mock_erp_catalog.dart';
import 'core/models/category_model.dart';
import 'core/models/brand_model.dart';
import 'core/models/country_origin_model.dart';
import 'core/models/product_model.dart';
import 'features/home/home_screen.dart';
import 'features/category/category_products_screen.dart';
import 'features/brand/brand_store_screen.dart';
import 'features/country/country_products_screen.dart';
import 'features/product_detail/product_detail_screen.dart';
import 'features/cart/cart_screen.dart';
import 'features/checkout/checkout_screen.dart';
import 'features/order_tracking/order_tracking_screen.dart';
import 'features/search/search_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/barcode/barcode_scanner_parity_modal.dart';
import 'features/auth/auth_sheet.dart';
import 'features/notifications/notifications_screen.dart';
import 'features/ratings/order_rating_modal.dart';
import 'core/state/auth_state.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BazMartApp());
}

class BazMartApp extends StatefulWidget {
  const BazMartApp({super.key});

  @override
  State<BazMartApp> createState() => _BazMartAppState();
}

class _BazMartAppState extends State<BazMartApp> {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();
  final LocaleProvider _localeProvider = LocaleProvider();
  final CartState _cartState = CartState();
  bool _isWidescreen = false;

  @override
  void initState() {
    super.initState();
    _localeProvider.addListener(_onStateChanged);
    _cartState.addListener(_onStateChanged);

    if (kIsWeb) {
      final uri = Uri.base;
      final mode = uri.queryParameters['view_mode'];
      if (mode == 'fullscreen' || mode == 'widescreen') {
        _isWidescreen = true;
      }
      final lang = uri.queryParameters['lang'];
      if (lang == 'ckb' || lang == 'ar' || lang == 'en') {
        _localeProvider.setLanguage(lang!);
      }

      final cartThreshold = uri.queryParameters['cart_threshold'];
      if (cartThreshold == 'reached') {
        _cartState.clearCart();
        if (MockErpCatalog.allProducts.isNotEmpty) {
          _cartState.addToCart(MockErpCatalog.allProducts[0]);
          _cartState.addToCart(MockErpCatalog.allProducts[0]);
          _cartState.addToCart(MockErpCatalog.allProducts[1]);
        }
      } else if (cartThreshold == 'under') {
        _cartState.clearCart();
        if (MockErpCatalog.allProducts.isNotEmpty) {
          _cartState.addToCart(MockErpCatalog.allProducts[0]);
        }
      } else if (cartThreshold == '15000') {
        _cartState.clearCart();
        final pMilk = MockErpCatalog.allProducts.firstWhere(
          (prod) => prod.id == 'p-alrahma',
          orElse: () => MockErpCatalog.allProducts[0],
        );
        final pEggs = MockErpCatalog.allProducts.firstWhere(
          (prod) => prod.id == 'p-eggs',
          orElse: () => MockErpCatalog.allProducts[1],
        );
        for (int i = 0; i < 5; i++) {
          _cartState.addToCart(pMilk); // 5 * 2250 = 11,250 IQD
        }
        _cartState.addToCart(pEggs); // 1 * 3750 = 3,750 IQD -> Subtotal = 15,000 IQD
      } else if (cartThreshold == '7500') {
        _cartState.clearCart();
        final p = MockErpCatalog.allProducts.firstWhere(
          (prod) => prod.id == 'p-cucumber',
          orElse: () => MockErpCatalog.allProducts[0],
        );
        for (int i = 0; i < 5; i++) {
          _cartState.addToCart(p); // 5 * 1445 = 7,225 IQD
        }
      }

      final couponParam = uri.queryParameters['coupon'];
      if (couponParam == 'BAZ20') {
        _cartState.applyCoupon(
          code: 'BAZ20',
          discountIqd: 3000,
          title: '20% off orders above IQD 10,000 (Max IQD 5,000)',
          minSubtotal: 10000,
        );
      } else if (couponParam == 'FIRST5000') {
        _cartState.applyCoupon(
          code: 'FIRST5000',
          discountIqd: 5000,
          title: 'IQD 5,000 off your very first BazMart order!',
          minSubtotal: 12000,
        );
      }

      final authPhone = uri.queryParameters['auth_phone'];
      if (authPhone != null && authPhone.isNotEmpty) {
        AuthState().login(
          accessToken: 'dev-token',
          customer: {
            'id': 'cmvwjzjfm00008piu5uzp0a3u',
            'phone': authPhone,
            'name': 'ئاکۆ محەمەد (Ako Muhamad)',
            'preferredLanguage': 'ckb',
            'orderCount': 3,
            'walletBalanceIqd': 25000,
            'addresses': [
              {
                'id': 'cmvwk0zy8000210cfiufx3a07',
                'title': 'ماڵەوە (Home)',
                'city': 'سلێمانی (Sulaymaniyah)',
                'neighborhood': 'سەرچنار / ڕاپەڕین (Sarchinar)',
                'street': 'شەقامی سەرەکی سەرچنار',
                'building': 'ڤێلا ١٢',
                'landmark': 'نزیک بازاڕی سەرچنار',
                'isDefault': true,
              },
              {
                'id': 'cmvwk0zyj000410cfpi18gnhw',
                'title': 'ئۆفیس (Office)',
                'city': 'سلێمانی (Sulaymaniyah)',
                'neighborhood': 'شەقامی سالم (Salim St)',
                'street': 'تاوەری سالم',
                'building': 'نهۆمی ٤',
                'landmark': 'بەرامبەر باخی گشتی',
                'isDefault': false,
              },
            ],
          },
        );
      }

      final routeParam = uri.queryParameters['route'] ?? uri.queryParameters['modal'];
      if (routeParam == 'pos_scanner' || routeParam == 'barcode_scanner') {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          final navContext = _navigatorKey.currentContext;
          if (navContext != null) {
            BarcodeScannerParityModal.show(
              navContext,
              cartState: _cartState,
              localeProvider: _localeProvider,
            );
          }
        });
      } else if (routeParam == 'search') {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _navigatorKey.currentState?.push(
            MaterialPageRoute(
              builder: (_) => SearchScreen(cartState: _cartState, localeProvider: _localeProvider),
            ),
          );
        });
      }
    }
  }

  void _onStateChanged() {
    setState(() {});
  }

  @override
  void dispose() {
    _localeProvider.removeListener(_onStateChanged);
    _cartState.removeListener(_onStateChanged);
    _localeProvider.dispose();
    _cartState.dispose();
    super.dispose();
  }

  Widget _resolveScreen() {
    if (kIsWeb) {
      final uri = Uri.base;
      final route = uri.queryParameters['route'];
      final id = uri.queryParameters['id'];
      final q = uri.queryParameters['q'];

      if (route == 'category') {
        CategoryModel? targetCat;
        if (id != null) {
          targetCat = MockErpCatalog.categories.cast<CategoryModel?>().firstWhere(
            (c) => c?.id == id || c?.slug == id,
            orElse: () => null,
          );
        }
        targetCat ??= MockErpCatalog.categories.first;
        return CategoryProductsScreen(
          category: targetCat,
          localeProvider: _localeProvider,
          cartState: _cartState,
        );
      }

      if (route == 'brand') {
        BrandModel? targetBrand;
        if (id != null) {
          targetBrand = MockErpCatalog.brands.cast<BrandModel?>().firstWhere(
            (b) => b?.id == id,
            orElse: () => null,
          );
        }
        targetBrand ??= MockErpCatalog.brands.first;
        return BrandStoreScreen(
          brand: targetBrand,
          localeProvider: _localeProvider,
          cartState: _cartState,
        );
      }

      if (route == 'country') {
        CountryOriginModel? targetCountry;
        if (id != null) {
          targetCountry = MockErpCatalog.countryOrigins.cast<CountryOriginModel?>().firstWhere(
            (c) => c?.id == id,
            orElse: () => null,
          );
        }
        targetCountry ??= MockErpCatalog.countryOrigins.first;
        return CountryProductsScreen(
          country: targetCountry,
          localeProvider: _localeProvider,
          cartState: _cartState,
        );
      }

      if (route == 'product') {
        ProductModel? targetProduct;
        if (id != null) {
          targetProduct = MockErpCatalog.allProducts.cast<ProductModel?>().firstWhere(
            (p) => p?.id == id,
            orElse: () => null,
          );
        }
        targetProduct ??= MockErpCatalog.allProducts.first;
        return ProductDetailScreen(
          product: targetProduct,
          cartState: _cartState,
          localeProvider: _localeProvider,
          initialOpenZoom: uri.queryParameters['zoom'] == 'true',
        );
      }

      if (route == 'cart') {
        final midCartSync = uri.queryParameters['mid_cart_sync'] == 'true';
        final openCoupons = uri.queryParameters['coupons'] == 'true';
        return CartScreen(
          cartState: _cartState,
          localeProvider: _localeProvider,
          showMidCartSyncBanner: midCartSync,
          initialOpenCoupons: openCoupons,
        );
      }

      if (route == 'checkout') {
        final showGps = uri.queryParameters['gps'] == 'true';
        final outOfZone = uri.queryParameters['out_of_zone'] == 'true';
        return CheckoutScreen(
          cartState: _cartState,
          localeProvider: _localeProvider,
          openGpsModalOnInit: showGps,
          initialOutOfZone: outOfZone,
        );
      }

      if (route == 'tracking') {
        final orderNum = uri.queryParameters['order_id'] ?? 'BM-2026-9042';
        final stage = uri.queryParameters['stage'];
        final isRated = uri.queryParameters['rated'] == 'true';
        final driver = uri.queryParameters['driver'] ?? 'Karwan Sleman';
        return OrderTrackingScreen(
          orderNumber: orderNum,
          orderId: orderNum,
          totalIqd: 18500,
          deliveryAddress: 'Gulan St, Empire World Tower 4, Erbil',
          driverName: driver,
          driverPhone: '+964 750 491 8822',
          estimatedMinutes: '14 mins',
          localeProvider: _localeProvider,
          initialStage: stage,
          initialRated: isRated,
        );
      }

      if (route == 'notifications') {
        final tab = uri.queryParameters['tab']?.toUpperCase();
        return NotificationsScreen(initialFilter: tab);
      }

      if (route == 'rating') {
        final orderNum = uri.queryParameters['order_id'] ?? 'BM-2026-9042';
        return RatingRouteScreen(
          orderNumber: orderNum,
          orderId: orderNum,
          localeProvider: _localeProvider,
          cartState: _cartState,
        );
      }

      if (route == 'profile') {
        return const ProfileScreen();
      }

      if (route == 'auth') {
        final step = uri.queryParameters['step'];
        final err = uri.queryParameters['error'];
        final initialStep = step == 'otp' ? 2 : 1;
        final errMsg = err != null ? 'Invalid OTP code. Please use 123456.' : null;
        return AuthRouteScreen(
          initialStep: initialStep,
          initialErrorMessage: errMsg,
          cartState: _cartState,
          localeProvider: _localeProvider,
        );
      }

      if (route == 'search') {
        return SearchScreen(
          localeProvider: _localeProvider,
          cartState: _cartState,
          initialQuery: q,
        );
      }

      if (route == 'promo') {
        final promoIndex = int.tryParse(uri.queryParameters['index'] ?? '0') ?? 0;
        final card = MockErpCatalog.promoCards[promoIndex % MockErpCatalog.promoCards.length];
        return CategoryProductsScreen(
          category: MockErpCatalog.categories.first,
          customTitle: card.title,
          customProducts: MockErpCatalog.topSavers,
          localeProvider: _localeProvider,
          cartState: _cartState,
        );
      }

      if (route == 'banner') {
        final bannerTheme = uri.queryParameters['theme'] ?? 'pepsi';
        String title = 'Pepsi Refreshment Deals';
        List<ProductModel> prods = MockErpCatalog.bestSellers;
        CategoryModel cat = MockErpCatalog.categories[5]; // Beverages
        if (bannerTheme == 'fresh_picks') {
          title = 'Fresh Picks Every Day';
          prods = MockErpCatalog.freshPicks;
          cat = MockErpCatalog.categories[0];
        } else if (bannerTheme == 'nescafe_iced') {
          title = 'Nescafe Iced Roast Coffee';
          prods = MockErpCatalog.nescafeIced;
          cat = MockErpCatalog.categories[7];
        }
        return CategoryProductsScreen(
          category: cat,
          customTitle: title,
          customProducts: prods,
          localeProvider: _localeProvider,
          cartState: _cartState,
        );
      }
    }

    return HomeScreen(
      cartState: _cartState,
      localeProvider: _localeProvider,
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigatorKey,
      title: 'BazMart',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      locale: _localeProvider.flutterLocale,
      supportedLocales: const [
        Locale('en', ''),
        Locale('ar', ''),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: (context, child) {
        final directionalChild = Directionality(
          textDirection: _localeProvider.textDirection,
          child: child ?? const SizedBox.shrink(),
        );

        return LayoutBuilder(
          builder: (context, constraints) {
            if (kIsWeb && constraints.maxWidth > 768) {
              return Scaffold(
                backgroundColor: const Color(0xFF0F172A),
                body: Container(
                  width: double.infinity,
                  height: double.infinity,
                  decoration: const BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment(0.0, -0.4),
                      radius: 1.2,
                      colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                    ),
                  ),
                  child: _isWidescreen
                      ? Center(
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(maxWidth: 1200),
                            child: Stack(
                              children: [
                                Container(
                                  color: Colors.white,
                                  child: directionalChild,
                                ),
                                Positioned(
                                  top: 12,
                                  right: 12,
                                  child: _buildModeTogglePill(),
                                ),
                              ],
                            ),
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // iPhone 16 Pro Titanium Bezel Frame
                            Center(
                              child: Container(
                                width: 442,
                                height: (constraints.maxHeight * 0.96).clamp(700.0, 920.0),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(52),
                                  border: Border.all(color: const Color(0xFF334155), width: 3.5),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.45),
                                      blurRadius: 36,
                                      spreadRadius: 8,
                                      offset: const Offset(0, 14),
                                    ),
                                  ],
                                ),
                                padding: const EdgeInsets.all(7),
                                child: Stack(
                                  clipBehavior: Clip.antiAlias,
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(44),
                                      child: Container(
                                        color: Colors.white,
                                        child: directionalChild,
                                      ),
                                    ),
                                    // Dynamic Island Pill
                                    Positioned(
                                      top: 10,
                                      left: 0,
                                      right: 0,
                                      child: Center(
                                        child: Container(
                                          width: 115,
                                          height: 28,
                                          decoration: BoxDecoration(
                                            color: Colors.black,
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: Row(
                                            mainAxisAlignment: MainAxisAlignment.end,
                                            children: [
                                              Container(
                                                width: 10,
                                                height: 10,
                                                margin: const EdgeInsets.only(right: 8),
                                                decoration: const BoxDecoration(
                                                  color: Color(0xFF1E293B),
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            // Floating BazMart Live POS & Quick Jump Card
                            if (constraints.maxWidth > 980) ...[
                              const SizedBox(width: 28),
                              ConstrainedBox(
                                constraints: const BoxConstraints(maxWidth: 320),
                                child: _buildInspectorCard(),
                              ),
                            ],
                          ],
                        ),
                ),
              );
            }
            return directionalChild;
          },
        );
      },
      home: _resolveScreen(),
    );
  }

  Widget _buildModeTogglePill() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.85),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: InkWell(
        onTap: () => setState(() => _isWidescreen = false),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.phone_iphone_rounded, color: AppColors.primaryOrange, size: 16),
            SizedBox(width: 6),
            Text(
              'Switch to iPhone 16 Pro Frame',
              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInspectorCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B).withOpacity(0.95),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primaryOrange,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Icon(Icons.storefront_rounded, color: Colors.white, size: 18),
                ),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'BazMart Live POS',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                  ),
                  Text(
                    'Kurdistan & Iraq Market Engine',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // POS Live Status Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF059669).withOpacity(0.4)),
            ),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF10B981),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    '100% Shelf-Price Parity Active\n(Fixed 3% Partner Commission)',
                    style: TextStyle(color: Color(0xFF34D399), fontSize: 10.5, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // View Mode Switcher
          const Text(
            'VIEW MODE',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _isWidescreen = false),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: !_isWidescreen ? AppColors.primaryOrange : const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        '📱 iPhone 16 Pro',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: !_isWidescreen ? FontWeight.w800 : FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _isWidescreen = true),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: _isWidescreen ? AppColors.primaryOrange : const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        '🖥️ Widescreen',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: _isWidescreen ? FontWeight.w800 : FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Language Switcher
          const Text(
            'LANGUAGE (ZIMAN)',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              _buildLangChip('کوردی', 'ckb'),
              const SizedBox(width: 6),
              _buildLangChip('عربي', 'ar'),
              const SizedBox(width: 6),
              _buildLangChip('English', 'en'),
            ],
          ),
          const SizedBox(height: 14),

          // Quick Jump Navigation
          const Text(
            'QUICK ROUTE JUMP',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _buildJumpBtn('🏠 Home', () {
                _navigatorKey.currentState?.pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => HomeScreen(cartState: _cartState, localeProvider: _localeProvider)),
                  (r) => false,
                );
              }),
              _buildJumpBtn('🔍 Search', () {
                _navigatorKey.currentState?.push(
                  MaterialPageRoute(builder: (_) => SearchScreen(cartState: _cartState, localeProvider: _localeProvider)),
                );
              }),
              _buildJumpBtn('🛒 Cart', () {
                _navigatorKey.currentState?.push(
                  MaterialPageRoute(builder: (_) => CartScreen(cartState: _cartState, localeProvider: _localeProvider)),
                );
              }),
              _buildJumpBtn('💳 Checkout', () {
                _navigatorKey.currentState?.push(
                  MaterialPageRoute(builder: (_) => CheckoutScreen(cartState: _cartState, localeProvider: _localeProvider)),
                );
              }),
              _buildJumpBtn('👤 Profile', () {
                _navigatorKey.currentState?.push(
                  MaterialPageRoute(builder: (_) => const ProfileScreen()),
                );
              }),
              _buildJumpBtn('🛵 Tracking', () {
                _navigatorKey.currentState?.push(
                  MaterialPageRoute(
                    builder: (_) => OrderTrackingScreen(
                      orderNumber: 'BM-2026-9042',
                      orderId: 'BM-2026-9042',
                      totalIqd: 18500,
                      deliveryAddress: 'Bakhtiari, Salim St, Sulaymaniyah',
                      driverName: 'Karwan Sleman',
                      driverPhone: '+964 770 491 8822',
                      estimatedMinutes: '14 mins',
                      localeProvider: _localeProvider,
                    ),
                  ),
                );
              }),
              _buildJumpBtn('🏷️ POS Scanner', () {
                BarcodeScannerParityModal.show(
                  context,
                  cartState: _cartState,
                  localeProvider: _localeProvider,
                );
              }),
            ],
          ),
          const SizedBox(height: 14),

          // Mini POS 3% Commission Calculator
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.calculate_rounded, color: Color(0xFF38BDF8), size: 14),
                    SizedBox(width: 5),
                    Text(
                      '3% COMMISSION ENGINE (SULY HUB)',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 9.5, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Gross POS Basket:', style: TextStyle(color: Colors.white70, fontSize: 10)),
                    Text(
                      '100,000 IQD',
                      style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('BazMart 3% Cut:', style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w700)),
                    Text('3,000 IQD', style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.w800)),
                  ],
                ),
                const SizedBox(height: 2),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Partner 97% Payout:', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.w700)),
                    Text('97,000 IQD', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 10, fontWeight: FontWeight.w800)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Fast Test VIP Sign-In (Sulaymaniyah & Erbil)
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: const Color(0xFF34D399),
                    side: const BorderSide(color: Color(0xFF10B981)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  icon: const Icon(Icons.verified_user_rounded, size: 14),
                  label: const Text('ئاکۆ (سلێمانی)', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                  onPressed: () {
                    AuthState().login(
                      accessToken: 'vip-token-suly-1002',
                      customer: {
                        'id': 'c-1002',
                        'phone': '+9647701234567',
                        'name': 'ئاکۆ محەمەد (سلێمانی)',
                        'preferredLanguage': 'ckb',
                        'email': 'ako@suly.iq',
                        'isOnboarded': true,
                        'walletBalanceIqd': 15000,
                        'addresses': [
                          {
                            'id': 'addr-suly-1',
                            'title': 'ماڵەوە (Home)',
                            'city': 'Sulaymaniyah',
                            'neighborhood': 'بەختیاری - شەقامی سالم',
                            'street': 'Salim Main Street',
                            'building': 'Building 14, Floor 3',
                            'isDefault': true,
                          },
                        ],
                      },
                    );
                    _navigatorKey.currentState?.push(
                      MaterialPageRoute(builder: (_) => const ProfileScreen()),
                    );
                  },
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: const Color(0xFF38BDF8),
                    side: const BorderSide(color: Color(0xFF0284C7)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                  icon: const Icon(Icons.verified_user_rounded, size: 14),
                  label: const Text('ئەحمەد (هەولێر)', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
                  onPressed: () {
                    AuthState().login(
                      accessToken: 'vip-token-123',
                      customer: {
                        'id': 'c-1001',
                        'phone': '+9647501234567',
                        'name': 'Ahmad Erbil (VIP)',
                        'preferredLanguage': 'ckb',
                        'email': 'ahmad@erbil.iq',
                        'isOnboarded': true,
                        'walletBalanceIqd': 15000,
                        'addresses': [
                          {
                            'id': 'addr-1',
                            'title': 'ماڵەوە (Home)',
                            'city': 'Erbil',
                            'neighborhood': 'Empire World Tower 4',
                            'street': 'Gulan Street',
                            'building': 'Tower 4, Apt 802',
                            'isDefault': true,
                          },
                        ],
                      },
                    );
                    _navigatorKey.currentState?.push(
                      MaterialPageRoute(builder: (_) => const ProfileScreen()),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLangChip(String label, String code) {
    final active = _localeProvider.currentLanguage == code;
    return Expanded(
      child: InkWell(
        onTap: () => _localeProvider.setLanguage(code),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: active ? AppColors.primaryOrange : const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: active ? AppColors.primaryOrange : const Color(0xFF334155)),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: active ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildJumpBtn(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Text(
          label,
          style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

class AuthRouteScreen extends StatefulWidget {
  final int initialStep;
  final String? initialErrorMessage;
  final CartState cartState;
  final LocaleProvider localeProvider;

  const AuthRouteScreen({
    super.key,
    this.initialStep = 1,
    this.initialErrorMessage,
    required this.cartState,
    required this.localeProvider,
  });

  @override
  State<AuthRouteScreen> createState() => _AuthRouteScreenState();
}

class _AuthRouteScreenState extends State<AuthRouteScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AuthSheet.show(
        context,
        initialStep: widget.initialStep,
        initialErrorMessage: widget.initialErrorMessage,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return HomeScreen(
      cartState: widget.cartState,
      localeProvider: widget.localeProvider,
    );
  }
}

class RatingRouteScreen extends StatefulWidget {
  final String orderId;
  final String orderNumber;
  final LocaleProvider localeProvider;
  final CartState cartState;

  const RatingRouteScreen({
    super.key,
    required this.orderId,
    required this.orderNumber,
    required this.localeProvider,
    required this.cartState,
  });

  @override
  State<RatingRouteScreen> createState() => _RatingRouteScreenState();
}

class _RatingRouteScreenState extends State<RatingRouteScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      OrderRatingModal.show(
        context,
        orderId: widget.orderId,
        orderNumber: widget.orderNumber,
        driverName: 'Karwan Ahmed',
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return HomeScreen(
      cartState: widget.cartState,
      localeProvider: widget.localeProvider,
    );
  }
}
