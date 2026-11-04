import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/state/cart_state.dart';
import '../../core/models/product_model.dart';
import '../../core/network/api_client.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../home/widgets/product_card.dart';
import '../home/widgets/sticky_bottom_cart_bar.dart';
import '../product_detail/product_detail_screen.dart';
import '../category/category_products_screen.dart';
import '../cart/cart_screen.dart';
import '../barcode/barcode_scanner_parity_modal.dart';

class SearchScreen extends StatefulWidget {
  final LocaleProvider localeProvider;
  final CartState cartState;
  final String? initialQuery;

  const SearchScreen({
    super.key,
    required this.localeProvider,
    required this.cartState,
    this.initialQuery,
  });

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  Timer? _debounceTimer;

  List<ProductModel> _searchResults = [];
  bool _isSearching = false;
  String _currentQuery = '';

  final List<Map<String, String>> _popularSearches = [
    {'en': 'Kurdistan Chicken', 'ckb': 'مریشکی کوردستان', 'ar': 'دجاج كوردستان'},
    {'en': 'Bread', 'ckb': 'نان', 'ar': 'خبز'},
    {'en': 'Eggs', 'ckb': 'هێلکە', 'ar': 'بيض'},
    {'en': 'Milk', 'ckb': 'شیر', 'ar': 'حليب'},
    {'en': 'Water', 'ckb': 'ئاو', 'ar': 'ماء'},
    {'en': 'Cucumber', 'ckb': 'خەیار', 'ar': 'خيار'},
    {'en': 'Nescafe', 'ckb': 'نیسکافێ', 'ar': 'نسكافيه'},
  ];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
    if (widget.initialQuery != null && widget.initialQuery!.isNotEmpty) {
      _searchController.text = widget.initialQuery!;
      _currentQuery = widget.initialQuery!;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _performSearch(widget.initialQuery!);
      });
    }
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.trim();
    if (query == _currentQuery) return;
    _currentQuery = query;

    _debounceTimer?.cancel();
    if (query.isEmpty) {
      setState(() {
        _isSearching = false;
        _searchResults = [];
      });
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 250), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    setState(() => _isSearching = true);
    final results = await ApiClient().searchProducts(query);
    if (mounted && _currentQuery == query) {
      setState(() {
        _searchResults = results;
        _isSearching = false;
      });
    }
  }

  void _applySearchChip(String term) {
    _searchController.text = term;
    _searchController.selection = TextSelection.fromPosition(TextPosition(offset: term.length));
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = widget.localeProvider.isRtl;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        toolbarHeight: 68,
        automaticallyImplyLeading: false,
        titleSpacing: 16,
        title: Row(
          children: [
            // Circular back button
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
                    isRtl
                        ? Icons.arrow_forward_ios_rounded
                        : Icons.arrow_back_ios_new_rounded,
                    color: AppColors.textPrimary,
                    size: 22,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),

              // Pill Search Input
              Expanded(
                child: Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: Row(
                    children: [
                      const Icon(Icons.search, color: AppColors.primaryOrange, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          focusNode: _focusNode,
                          textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
                          textAlign: isRtl ? TextAlign.right : TextAlign.left,
                          cursorColor: AppColors.primaryOrange,
                          autocorrect: false,
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                          decoration: InputDecoration(
                            hintText: widget.localeProvider.translate('search_bazmart'),
                            hintStyle: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 13,
                              fontWeight: FontWeight.w400,
                            ),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                      if (_searchController.text.isNotEmpty)
                        GestureDetector(
                          onTap: () {
                            _searchController.clear();
                          },
                          child: const Icon(Icons.cancel, color: AppColors.textMuted, size: 18),
                        ),
                      const SizedBox(width: 6),
                      // Barcode Scanner & Price Parity Verifier Button
                      InkWell(
                        key: const ValueKey('barcode_scanner_search_btn'),
                        onTap: () {
                          BarcodeScannerParityModal.show(
                            context,
                            cartState: widget.cartState,
                            localeProvider: widget.localeProvider,
                          );
                        },
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF7ED),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFFFEDD5)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.qr_code_scanner_rounded, size: 15, color: AppColors.primaryOrange),
                              SizedBox(width: 3),
                              Text(
                                'POS',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primaryOrange,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),

      body: AnimatedBuilder(
        animation: widget.cartState,
        builder: (context, _) {
          return Stack(
            children: [
              _currentQuery.isEmpty
                  ? _buildInitialState()
                  : _buildSearchResultsState(),

              // Persistent Sticky Bottom Cart Bar
              if (!widget.cartState.isEmpty)
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: StickyBottomCartBar(
                    cartState: widget.cartState,
                    localeProvider: widget.localeProvider,
                    activeTabIndex: 2,
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
          );
        },
      ),
    );
  }

  Widget _buildInitialState() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      children: [
        // Popular Searches Header
        Row(
          children: [
            const Icon(Icons.trending_up, color: AppColors.primaryOrange, size: 18),
            const SizedBox(width: 6),
            Text(
              widget.localeProvider.translate('popular_searches'),
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Chips wrap
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _popularSearches.map((item) {
            final lang = widget.localeProvider.currentLanguage;
            final term = item[lang] ?? item['en']!;
            return InkWell(
              onTap: () => _applySearchChip(term),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.productBoxSurface,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.dividerColor),
                ),
                child: Text(
                  term,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            );
          }).toList(),
        ),

        const SizedBox(height: 24),

        // Quick Category Tiles
        Text(
          widget.localeProvider.translate('shop_by_category'),
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.8,
          ),
          itemCount: MockErpCatalog.allCategories.take(8).length,
          itemBuilder: (context, index) {
            final cat = MockErpCatalog.allCategories[index];
            return InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CategoryProductsScreen(
                      category: cat,
                      localeProvider: widget.localeProvider,
                      cartState: widget.cartState,
                    ),
                  ),
                );
              },
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 1)),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: _getCategoryColor(cat.id).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(_getCategoryIcon(cat.id), size: 18, color: _getCategoryColor(cat.id)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        widget.localeProvider.isRtl && widget.localeProvider.currentLanguage == 'ckb'
                            ? cat.nameCkb
                            : (widget.localeProvider.isRtl ? cat.nameAr : cat.nameEn),
                        textAlign: widget.localeProvider.isRtl ? TextAlign.right : TextAlign.left,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),

        const SizedBox(height: 100),
      ],
    );
  }

  Widget _buildSearchResultsState() {
    if (_isSearching) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(color: AppColors.primaryOrange),
            const SizedBox(height: 14),
            Text(
              widget.localeProvider.isRtl ? 'گەڕان لە کەتەلۆکی بازماڕت...' : 'Searching BazMart catalog...',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      );
    }

    if (_searchResults.isEmpty) {
      final isRtl = widget.localeProvider.isRtl;
      final suggestedAisles = isRtl
          ? ['میوە و سەوزە', 'نانەواخانە', 'شیرەمەنی', 'خواردنەوەکان']
          : ['Fruit & Veg', 'Bakery', 'Dairy & Eggs', 'Beverages'];

      return Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 76,
                height: 76,
                decoration: const BoxDecoration(
                  color: Color(0xFFFFF3E0),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.search_off_rounded, size: 40, color: AppColors.primaryOrange),
              ),
              const SizedBox(height: 16),
              Text(
                isRtl
                    ? 'هیچ بەرهەمێک نەدۆزرایەوە بۆ "$_currentQuery"'
                    : 'No products found for "$_currentQuery"',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                isRtl
                    ? 'تکایە دڵنیابە لە دروستی وشەکە یان بەشێکی پەیوەندیدار هەڵبژێرە:'
                    : 'Check spelling, try broader terms, or browse popular aisles:',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 18),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: suggestedAisles.map((aisle) {
                  return ActionChip(
                    label: Text(aisle),
                    onPressed: () {
                      _applySearchChip(aisle);
                    },
                    backgroundColor: AppColors.productBoxSurface,
                    side: const BorderSide(color: AppColors.dividerColor),
                    labelStyle: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryOrangeDark,
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 120),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 14,
        childAspectRatio: 0.64,
      ),
      itemCount: _searchResults.length,
      itemBuilder: (context, index) {
        final product = _searchResults[index];

        return ProductCard(
          product: product,
          cartState: widget.cartState,
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ProductDetailScreen(
                  product: product,
                  cartState: widget.cartState,
                  localeProvider: widget.localeProvider,
                ),
              ),
            );
          },
        );
      },
    );
  }

  IconData _getCategoryIcon(String catId) {
    final id = catId.toLowerCase();
    if (id.contains('fruit')) return Icons.eco;
    if (id.contains('bakery')) return Icons.bakery_dining;
    if (id.contains('meat')) return Icons.kebab_dining;
    if (id.contains('frozen')) return Icons.ac_unit;
    if (id.contains('dairy')) return Icons.egg_outlined;
    if (id.contains('beverage')) return Icons.local_drink;
    if (id.contains('snack')) return Icons.cookie_outlined;
    if (id.contains('coffee')) return Icons.coffee;
    if (id.contains('milk')) return Icons.water_drop;
    if (id.contains('breakfast')) return Icons.breakfast_dining;
    return Icons.category;
  }

  Color _getCategoryColor(String catId) {
    final id = catId.toLowerCase();
    if (id.contains('fruit')) return const Color(0xFF4CAF50);
    if (id.contains('bakery')) return const Color(0xFF8D6E63);
    if (id.contains('meat')) return const Color(0xFFE53935);
    if (id.contains('frozen')) return const Color(0xFF00ACC1);
    if (id.contains('dairy')) return const Color(0xFFFB8C00);
    if (id.contains('beverage')) return const Color(0xFF1E88E5);
    if (id.contains('snack')) return const Color(0xFF8E24AA);
    if (id.contains('coffee')) return const Color(0xFF6D4C41);
    return AppColors.primaryOrange;
  }
}
