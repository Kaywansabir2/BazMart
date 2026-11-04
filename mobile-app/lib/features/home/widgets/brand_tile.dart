import 'package:flutter/material.dart';
import '../../../core/models/brand_model.dart';
import '../../../core/data/mock_erp_catalog.dart';

class ShopByBrandWidget extends StatelessWidget {
  final void Function(BrandModel)? onBrandTap;

  const ShopByBrandWidget({super.key, this.onBrandTap});

  @override
  Widget build(BuildContext context) {
    final row1 = MockErpCatalog.brands.sublist(0, 4);
    final row2 = MockErpCatalog.brands.sublist(4, 8);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: row1.map((b) => _buildBrandTile(b)).toList(),
          ),
          const SizedBox(height: 10),
          Row(
            children: row2.map((b) => _buildBrandTile(b)).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildBrandTile(BrandModel brand) {
    return GestureDetector(
      onTap: () => onBrandTap?.call(brand),
      child: Container(
        width: 82,
        height: 82,
        margin: const EdgeInsets.only(right: 10),
        decoration: BoxDecoration(
          color: brand.backgroundColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: Colors.black.withOpacity(0.06),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(6.0),
            child: Text(
              brand.badgeText ?? brand.name,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: brand.textColor,
                fontSize: 12,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
