import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/category_model.dart';
import '../../../core/data/mock_erp_catalog.dart';
import '../../../core/localization/app_locale.dart';

class CategoryGrid extends StatefulWidget {
  final LocaleProvider localeProvider;
  final void Function(CategoryModel)? onCategoryTap;

  const CategoryGrid({
    super.key,
    required this.localeProvider,
    this.onCategoryTap,
  });

  @override
  State<CategoryGrid> createState() => _CategoryGridState();
}

class _CategoryGridState extends State<CategoryGrid> {
  final PageController _pageController = PageController(viewportFraction: 0.88);
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 3-Row x 4-Column Paginated PageView with 0.88 viewportFraction showing peek of 5th column
        SizedBox(
          height: 275, // 3 rows of ~80px + spacing
          child: PageView(
            padEnds: false,
            controller: _pageController,
            onPageChanged: (page) {
              setState(() {
                _currentPage = page;
              });
            },
            children: [
              _buildCategoryPage(MockErpCatalog.categoriesPage1, isFirstPage: true),
              _buildCategoryPage(MockErpCatalog.categoriesPage2, isFirstPage: false),
            ],
          ),
        ),

        const SizedBox(height: 10),

        // Exact 2-Segment Horizontal Pill Progress Bar (Dark Grey Active + Light Grey Inactive)
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildIndicatorSegment(0),
            const SizedBox(width: 4),
            _buildIndicatorSegment(1),
          ],
        ),
      ],
    );
  }

  Widget _buildCategoryPage(List<CategoryModel> categories, {required bool isFirstPage}) {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.only(
        left: isFirstPage ? 16 : 8,
        right: isFirstPage ? 8 : 16,
      ),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.82,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: categories.length,
      itemBuilder: (context, index) {
        final cat = categories[index];
        final name = cat.localizedName(widget.localeProvider.currentLanguage);
        final catColor = _getCategoryColor(cat);
        final catIcon = _getCategoryIcon(cat);

        return GestureDetector(
          onTap: () => widget.onCategoryTap?.call(cat),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Category Icon Tile
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: catColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: catColor.withOpacity(0.18),
                    width: 1,
                  ),
                ),
                child: Center(
                  child: Icon(
                    catIcon,
                    color: catColor,
                    size: 28,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              // Category Label
              Text(
                name,
                maxLines: 2,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                  height: 1.15,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  IconData _getCategoryIcon(CategoryModel cat) {
    if (cat.icon != null) return cat.icon!;
    final id = cat.id.toLowerCase();
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
    if (id.contains('ready')) return Icons.ramen_dining;
    if (id.contains('cooking')) return Icons.soup_kitchen;
    if (id.contains('icecream') || id.contains('ice-cream')) return Icons.icecream;
    if (id.contains('spice')) return Icons.grain;
    if (id.contains('personal')) return Icons.sanitizer;
    if (id.contains('household')) return Icons.cleaning_services;
    if (id.contains('baby')) return Icons.child_care;
    if (id.contains('pet')) return Icons.pets;
    if (id.contains('water')) return Icons.water;
    if (id.contains('stationery')) return Icons.edit;
    return Icons.category;
  }

  Color _getCategoryColor(CategoryModel cat) {
    final id = cat.id.toLowerCase();
    if (id.contains('fruit')) return const Color(0xFF4CAF50);
    if (id.contains('bakery')) return const Color(0xFF8D6E63);
    if (id.contains('meat')) return const Color(0xFFE53935);
    if (id.contains('frozen')) return const Color(0xFF00ACC1);
    if (id.contains('dairy')) return const Color(0xFFFB8C00);
    if (id.contains('beverage')) return const Color(0xFF1E88E5);
    if (id.contains('snack')) return const Color(0xFF8E24AA);
    if (id.contains('coffee')) return const Color(0xFF6D4C41);
    if (id.contains('milk')) return const Color(0xFF039BE5);
    if (id.contains('breakfast')) return const Color(0xFFFDD835);
    if (id.contains('ready')) return const Color(0xFFFF5722);
    if (id.contains('cooking')) return const Color(0xFF43A047);
    if (id.contains('icecream') || id.contains('ice-cream')) return const Color(0xFFE91E63);
    if (id.contains('spice')) return const Color(0xFFFFB300);
    if (id.contains('personal')) return const Color(0xFF00897B);
    if (id.contains('household')) return const Color(0xFF3949AB);
    if (id.contains('baby')) return const Color(0xFFF06292);
    if (id.contains('pet')) return const Color(0xFF795548);
    if (id.contains('water')) return const Color(0xFF0288D1);
    if (id.contains('stationery')) return const Color(0xFF5E35B1);
    return AppColors.primaryOrange;
  }

  Widget _buildIndicatorSegment(int pageIndex) {
    final isActive = _currentPage == pageIndex;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      width: isActive ? 22 : 14,
      height: 4,
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF2D2D2D) : const Color(0xFFE0E0E0),
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }
}
