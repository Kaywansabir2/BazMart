import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/state/cart_state.dart';
import '../../core/models/product_model.dart';
import '../../core/models/category_model.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../home/widgets/product_card.dart';
import '../home/widgets/sticky_bottom_cart_bar.dart';
import '../product_detail/product_detail_screen.dart';
import '../search/search_screen.dart';
import '../cart/cart_screen.dart';

class CategoryProductsScreen extends StatefulWidget {
  final CategoryModel category;
  final LocaleProvider localeProvider;
  final CartState cartState;
  final List<ProductModel>? customProducts;
  final String? customTitle;

  const CategoryProductsScreen({
    super.key,
    required this.category,
    required this.localeProvider,
    required this.cartState,
    this.customProducts,
    this.customTitle,
  });

  @override
  State<CategoryProductsScreen> createState() => _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  String _selectedSubcategory = 'All';
  String _selectedSort = 'Popular';

  late List<ProductModel> _allCategoryProducts;

  final List<String> _subcategories = [
    'All',
    'Fresh Milk',
    'Long Life Milk',
    'Yogurt',
    'Cheese & Butter',
    'Eggs',
  ];

  String _getSortLabel(String sort) {
    switch (sort) {
      case 'Price: Low to High':
        return widget.localeProvider.translate('price_low_high');
      case 'Discounts only':
        return widget.localeProvider.translate('discounts_only');
      default:
        return widget.localeProvider.translate('popular');
    }
  }

  String _getSubcategoryLabel(String sub, String lang) {
    if (sub == 'All') return widget.localeProvider.translate('all');
    if (lang == 'ckb') {
      switch (sub) {
        case 'Fresh Milk': return 'شیری فرێش';
        case 'Long Life Milk': return 'شیری ماوەدرێژ';
        case 'Yogurt': return 'ماست و لۆبیا';
        case 'Cheese & Butter': return 'پەنیر و کەرە';
        case 'Eggs': return 'هێلکە';
      }
    } else if (lang == 'ar') {
      switch (sub) {
        case 'Fresh Milk': return 'حليب طازج';
        case 'Long Life Milk': return 'حليب طويل الأجل';
        case 'Yogurt': return 'زبادي ولبن';
        case 'Cheese & Butter': return 'جبن وزبدة';
        case 'Eggs': return 'بيض';
      }
    }
    return sub;
  }

  @override
  void initState() {
    super.initState();
    if (widget.customProducts != null && widget.customProducts!.isNotEmpty) {
      _allCategoryProducts = widget.customProducts!;
    } else {
      // Filter by category name
      final matches = MockErpCatalog.allProducts
          .where((p) => p.category.toLowerCase().contains(widget.category.nameEn.toLowerCase()))
          .toList();

      _allCategoryProducts = matches.isNotEmpty ? matches : MockErpCatalog.allProducts.take(8).toList();
    }
  }

  List<ProductModel> get _displayedProducts {
    List<ProductModel> list = List.from(_allCategoryProducts);

    if (_selectedSort == 'Price: Low to High') {
      list.sort((a, b) => a.priceIqd.compareTo(b.priceIqd));
    } else if (_selectedSort == 'Discounts only') {
      list = list.where((p) => p.isOnSale).toList();
      if (list.isEmpty) list = List.from(_allCategoryProducts);
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = widget.localeProvider.isRtl;
    final title = widget.customTitle ??
        (isRtl && widget.localeProvider.currentLanguage == 'ckb'
            ? widget.category.nameCkb
            : (isRtl ? widget.category.nameAr : widget.category.nameEn));

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
                        isRtl
                            ? Icons.arrow_forward_ios_rounded
                            : Icons.arrow_back_ios_new_rounded,
                        color: AppColors.textPrimary,
                        size: 22,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => SearchScreen(
                          localeProvider: widget.localeProvider,
                          cartState: widget.cartState,
                        ),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.productBoxSurface,
                    ),
                    child: const Center(
                      child: Icon(Icons.search, size: 20, color: AppColors.textPrimary),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),

      body: AnimatedBuilder(
        animation: widget.cartState,
        builder: (context, _) {
          return Stack(
            children: [
              Column(
                children: [
                  // Horizontal Sub-category Filter Pills
                  Container(
                    height: 48,
                    color: Colors.white,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      scrollDirection: Axis.horizontal,
                      itemCount: _subcategories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final sub = _subcategories[index];
                        final isSelected = _selectedSubcategory == sub;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedSubcategory = sub),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primaryOrange : AppColors.productBoxSurface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected ? AppColors.primaryOrange : AppColors.dividerColor,
                              ),
                            ),
                            child: Text(
                              _getSubcategoryLabel(sub, widget.localeProvider.currentLanguage),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? Colors.white : AppColors.textPrimary,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  // Sort & Filter Bar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      border: Border(bottom: BorderSide(color: AppColors.dividerColor)),
                    ),
                    child: Row(
                      children: [
                        Text(
                          '${_displayedProducts.length} ${widget.localeProvider.translate('items')}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const Spacer(),
                        PopupMenuButton<String>(
                          onSelected: (val) => setState(() => _selectedSort = val),
                          child: Row(
                            children: [
                              const Icon(Icons.sort, size: 16, color: AppColors.primaryOrange),
                              const SizedBox(width: 4),
                              Text(
                                _getSortLabel(_selectedSort),
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primaryOrange,
                                ),
                              ),
                              const Icon(Icons.arrow_drop_down, size: 16, color: AppColors.primaryOrange),
                            ],
                          ),
                          itemBuilder: (context) => [
                            PopupMenuItem(
                              value: 'Popular',
                              child: Text(widget.localeProvider.translate('popular')),
                            ),
                            PopupMenuItem(
                              value: 'Price: Low to High',
                              child: Text(widget.localeProvider.translate('price_low_high')),
                            ),
                            PopupMenuItem(
                              value: 'Discounts only',
                              child: Text(widget.localeProvider.translate('discounts_only')),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // 2-Column Product Grid
                  Expanded(
                    child: GridView.builder(
                      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 120),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 14,
                        childAspectRatio: 0.64,
                      ),
                      itemCount: _displayedProducts.length,
                      itemBuilder: (context, index) {
                        final product = _displayedProducts[index];

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
                    ),
                  ),
                ],
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
                    activeTabIndex: 1,
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
}
