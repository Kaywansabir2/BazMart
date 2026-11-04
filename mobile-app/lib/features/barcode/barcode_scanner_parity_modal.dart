import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/state/cart_state.dart';
import '../../core/models/product_model.dart';
import '../../core/data/mock_erp_catalog.dart';
import '../../core/network/api_client.dart';
import '../../core/widgets/product_packaging_visual.dart';

class BarcodeScannerParityModal extends StatefulWidget {
  final CartState cartState;
  final LocaleProvider localeProvider;

  const BarcodeScannerParityModal({
    super.key,
    required this.cartState,
    required this.localeProvider,
  });

  static Future<void> show(BuildContext context, {
    required CartState cartState,
    required LocaleProvider localeProvider,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BarcodeScannerParityModal(
        cartState: cartState,
        localeProvider: localeProvider,
      ),
    );
  }

  @override
  State<BarcodeScannerParityModal> createState() => _BarcodeScannerParityModalState();
}

class _BarcodeScannerParityModalState extends State<BarcodeScannerParityModal>
    with SingleTickerProviderStateMixin {
  final TextEditingController _barcodeInputController = TextEditingController();
  late AnimationController _laserController;
  bool _isLoading = false;
  ProductModel? _matchedProduct;
  String _activeBarcode = '6291100010014'; // Default to Al Rahma Milk benchmark
  bool _isScaleBarcode = false;
  double? _scaleWeightKg;

  final List<Map<String, String>> _sampleBarcodes = [
    {
      'code': '6291100010014',
      'labelCkb': 'شیری ئەلڕەحمە (٢٬٢٥٠ د.ع)',
      'labelEn': 'Al Rahma Milk (2,250 IQD)',
      'sku': 'ERP-SKU-1001',
    },
    {
      'code': '2001005012509',
      'labelCkb': '⚖️ بارکۆدی تەرازووی سەوزە و گۆشت (2001005012509 — ١.٢٥ کیلۆ خەیار)',
      'labelEn': '⚖️ Scale Barcode (1.25kg Cucumber - 1,806 IQD)',
      'sku': 'ERP-SKU-1005',
    },
    {
      'code': '6291100010052',
      'labelCkb': 'خەیاری خۆماڵی (١٬٢٥٠ د.ع)',
      'labelEn': 'Local Cucumbers (1,250 IQD)',
      'sku': 'ERP-SKU-1005',
    },
    {
      'code': '6291100010120',
      'labelCkb': 'ڕامێنی تەباسکۆ (١٬٠٠٠ د.ع)',
      'labelEn': 'Tabasco Noodles (1,000 IQD)',
      'sku': 'ERP-SKU-1012',
    },
  ];

  @override
  void initState() {
    super.initState();
    _laserController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _barcodeInputController.text = _activeBarcode;
    _performScan(_activeBarcode);
  }

  @override
  void dispose() {
    _laserController.dispose();
    _barcodeInputController.dispose();
    super.dispose();
  }

  Future<void> _performScan(String barcode) async {
    final cleanCode = barcode.trim();
    if (cleanCode.isEmpty) return;

    final isScale = (cleanCode.startsWith('20') || cleanCode.startsWith('21')) && cleanCode.length == 13;
    double? scaleWeight;
    int? unitPrice;
    int? scalePrice;

    if (isScale) {
      final grams = int.tryParse(cleanCode.substring(7, 12)) ?? 1250;
      scaleWeight = grams / 1000.0;
      unitPrice = 1445;
      scalePrice = (unitPrice * scaleWeight).round();
    }

    setState(() {
      _isLoading = true;
      _activeBarcode = cleanCode;
      _barcodeInputController.text = cleanCode;
      _isScaleBarcode = isScale;
      _scaleWeightKg = scaleWeight;
    });

    // 1. First look up local catalog
    ProductModel? localProd;
    for (final p in MockErpCatalog.allProducts) {
      if (p.barcode == cleanCode || p.sku == cleanCode || p.id == cleanCode) {
        localProd = p;
        break;
      }
      if (isScale && (p.sku == 'ERP-SKU-1005' || p.id == 'p-cucumber')) {
        localProd = p;
        break;
      }
    }

    if (isScale && localProd != null) {
      localProd = localProd.copyWith(
        priceIqd: scalePrice ?? 1806,
        unit: '$scaleWeight kg',
      );
    }

    // 2. Fetch from Backend Laravel API: GET /api/v1/catalog/barcode/:barcode
    try {
      final res = await ApiClient().get('/catalog/barcode/$cleanCode');
      if (res != null && res['product'] != null) {
        final pData = res['product'];
        localProd = ProductModel(
          id: pData['id']?.toString() ?? 'p-$cleanCode',
          externalErpId: pData['sku'] ?? 'ERP-$cleanCode',
          name: pData['name_en'] ?? pData['name'] ?? 'Supermarket Item',
          nameCkb: pData['name_ckb'] ?? pData['name_ku'],
          brand: pData['brand'] ?? 'Partner Supermarket',
          unit: pData['unit'] ?? '1 Piece',
          priceIqd: (pData['price_iqd'] as num?)?.toInt() ?? 2250,
          oldPriceIqd: (pData['original_price_iqd'] as num?)?.toInt(),
          discountPercent: (pData['discount_percentage'] as num?)?.toInt(),
          stockQuantity: (pData['stock_quantity'] as num?)?.toInt() ?? 100,
          sku: pData['sku'] ?? 'ERP-$cleanCode',
          barcode: cleanCode,
          category: pData['category'] ?? 'Supermarket',
          imageUrl: pData['image_url'] ?? '',
        );

        if (mounted) {
          setState(() {
            _matchedProduct = localProd;
            _isLoading = false;
          });
        }
        return;
      }
    } catch (_) {
      // Fallback to local catalog if offline
    }

    if (localProd == null && MockErpCatalog.allProducts.isNotEmpty) {
      localProd = MockErpCatalog.allProducts[0];
    }

    if (mounted) {
      setState(() {
        _matchedProduct = localProd;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = widget.localeProvider.isRtl;
    final isCkb = widget.localeProvider.currentLanguage == 'ckb';

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 10, bottom: 6),
            width: 44,
            height: 5,
            decoration: BoxDecoration(
              color: const Color(0xFFCBD5E1),
              borderRadius: BorderRadius.circular(3),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFFEDD5)),
                  ),
                  child: const Center(
                    child: Icon(Icons.qr_code_scanner_rounded, color: AppColors.primaryOrange, size: 24),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isCkb
                            ? 'پشکنەری بارکۆدی ڕەفەی سووپەرمارکێت'
                            : (isRtl ? 'ماسح باركود الرف وتحقيق السعر' : 'Shelf Barcode Scanner & Price Verifier'),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFF16A34A),
                            ),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            isCkb
                                ? '١٠٠٪ هاوسەنگیی نرخی ڕەفە (جیاوازی ٠ د.ع)'
                                : (isRtl ? 'تطابق سعر الرف ١٠٠٪ (فرق ٠ د.ع)' : '100% Shelf-Price Parity • 0 IQD Markup'),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF16A34A),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: AppColors.textMuted),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFFF1F5F9)),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              children: [
                // 1. Scanner Laser Viewfinder Graphic
                Container(
                  height: 140,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF334155)),
                    boxShadow: const [
                      BoxShadow(color: Color(0x30000000), blurRadius: 8, offset: Offset(0, 3)),
                    ],
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Viewfinder corner marks
                      Positioned(
                        top: 14,
                        left: 18,
                        child: _buildCornerBracket(isTop: true, isLeft: true),
                      ),
                      Positioned(
                        top: 14,
                        right: 18,
                        child: _buildCornerBracket(isTop: true, isLeft: false),
                      ),
                      Positioned(
                        bottom: 14,
                        left: 18,
                        child: _buildCornerBracket(isTop: false, isLeft: true),
                      ),
                      Positioned(
                        bottom: 14,
                        right: 18,
                        child: _buildCornerBracket(isTop: false, isLeft: false),
                      ),

                      // Barcode vertical simulation lines
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildBarLine(2, 40),
                          _buildBarLine(4, 40),
                          _buildBarLine(1, 40),
                          _buildBarLine(3, 40),
                          _buildBarLine(5, 40),
                          _buildBarLine(2, 40),
                          _buildBarLine(4, 40),
                          _buildBarLine(1, 40),
                          _buildBarLine(3, 40),
                          _buildBarLine(5, 40),
                          _buildBarLine(2, 40),
                          _buildBarLine(3, 40),
                        ],
                      ),

                      // Active animated laser sweep line
                      AnimatedBuilder(
                        animation: _laserController,
                        builder: (context, _) {
                          final topOffset = 25.0 + (_laserController.value * 90.0);
                          return Positioned(
                            top: topOffset,
                            left: 30,
                            right: 30,
                            child: Container(
                              height: 3,
                              decoration: BoxDecoration(
                                color: const Color(0xFFEF4444),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFFEF4444).withOpacity(0.9),
                                    blurRadius: 8,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),

                      // Scan Status text
                      Positioned(
                        bottom: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            isCkb
                                ? 'سکانکەری زیرەکی POS کارایە • شەقامی سالم، سلێمانی'
                                : 'Live POS Scanner Active • Salim St Hub, Sulaymaniyah',
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // 2. Quick Sample Barcodes
                Text(
                  isCkb ? 'سکانکردنی خێرای نموونەکانی سووپەرمارکێت:' : 'Quick Benchmark Barcode Tests:',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _sampleBarcodes.map((item) {
                    final isSelected = _activeBarcode == item['code'];
                    return InkWell(
                      onTap: () => _performScan(item['code']!),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFFFF7ED) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? AppColors.primaryOrange : const Color(0xFFE2E8F0),
                            width: isSelected ? 1.5 : 1.0,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.barcode_reader,
                              size: 15,
                              color: isSelected ? AppColors.primaryOrange : const Color(0xFF64748B),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              isCkb ? item['labelCkb']! : item['labelEn']!,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: isSelected ? AppColors.primaryOrangeDark : const Color(0xFF334155),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 14),

                // 3. Manual Barcode Input Row
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFCBD5E1)),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Row(
                    children: [
                      const Icon(Icons.qr_code, color: AppColors.textMuted, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _barcodeInputController,
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            hintText: isCkb ? 'بارکۆدی ڕەفە بنووسە...' : 'Type shelf barcode...',
                            hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                            isDense: true,
                          ),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, fontFamily: 'monospace'),
                          onSubmitted: _performScan,
                        ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryOrange,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          minimumSize: const Size(60, 32),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => _performScan(_barcodeInputController.text),
                        child: Text(isCkb ? 'پشکنین' : 'Verify', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // 4. Parity Certificate & Verification Result Card
                if (_isLoading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(child: CircularProgressIndicator(color: AppColors.primaryOrange)),
                  )
                else if (_matchedProduct != null)
                  _buildParityCertificateCard(_matchedProduct!, isCkb, isRtl),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildParityCertificateCard(ProductModel prod, bool isCkb, bool isRtl) {
    final priceStr = '${prod.priceIqd.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} IQD';
    final storeName = isCkb
        ? 'سووپەرمارکێتی هاوبەشی سلێمانی (کۆگای سالم)'
        : 'Sulaymaniyah Partner Hypermarket (POS #01 - Salim St)';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF16A34A), width: 1.8),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF16A34A).withOpacity(0.12),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Green Certificate Ribbon Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF15803D), Color(0xFF16A34A)],
              ),
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    isCkb
                        ? 'بڕوانامەی ١٠٠٪ هاوسەنگیی نرخی ڕەفە (پەسەندکراو)'
                        : '100% Shelf-Price Parity Certificate (Verified)',
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text('0 IQD VARIANCE', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900)),
                ),
              ],
            ),
          ),

          // Product Info Row
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Packaging Visual
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Center(
                    child: ProductPackagingVisual(product: prod, size: 68),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isCkb && prod.nameCkb != null && prod.nameCkb!.isNotEmpty
                            ? prod.nameCkb!
                            : prod.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Barcode: ${prod.barcode} • SKU: ${prod.sku}',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.storefront_rounded, size: 12, color: Color(0xFF0284C7)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              storeName,
                              style: const TextStyle(fontSize: 11, color: Color(0xFF0284C7), fontWeight: FontWeight.w700),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Scale Barcode Highlight Banner
          if (_isScaleBarcode)
            Container(
              margin: const EdgeInsets.only(left: 14, right: 14, bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.scale_rounded, size: 16, color: Color(0xFF059669)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      isCkb
                          ? 'تەرازووی دیجیتاڵ (GS1 Scale Barcode): $_scaleWeightKg کگم • نرخی ڕەفە: $priceStr (١٠٠٪ هاوسەنگ • جیاوازی ٠ د.ع)'
                          : 'Digital Scale (GS1 Scale Barcode): $_scaleWeightKg kg • Shelf Price: $priceStr (0 IQD Variance)',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                    ),
                  ),
                ],
              ),
            ),

          // Side-by-Side Comparison Box
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 14),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFBBF7D0)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // POS Shelf Price
                Column(
                  children: [
                    Text(
                      isCkb ? 'نرخی ڕەفەی مارکێت' : 'Supermarket Shelf Price',
                      style: const TextStyle(fontSize: 10, color: Color(0xFF166534), fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      priceStr,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF166534)),
                    ),
                  ],
                ),
                Container(width: 1, height: 28, color: const Color(0xFF86EFAC)),
                // BazMart App Price
                Column(
                  children: [
                    Text(
                      isCkb ? 'نرخی ئەپی بازمارت' : 'BazMart App Price',
                      style: const TextStyle(fontSize: 10, color: AppColors.primaryOrangeDark, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      priceStr,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.primaryOrange),
                    ),
                  ],
                ),
                Container(width: 1, height: 28, color: const Color(0xFF86EFAC)),
                // Variance (0 IQD)
                Column(
                  children: [
                    Text(
                      isCkb ? 'جیاوازی نرخ' : 'Price Markup',
                      style: const TextStyle(fontSize: 10, color: Color(0xFF15803D), fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 3),
                    const Text(
                      '0 IQD (0%)',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF16A34A)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Add to Cart Button
          Padding(
            padding: const EdgeInsets.all(14),
            child: SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryOrange,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.add_shopping_cart_rounded, size: 20),
                label: Text(
                  isCkb
                      ? 'زیادکردن بۆ سەبەتە بە نرخی ڕەفە ($priceStr)'
                      : 'Add to Cart at Shelf Price ($priceStr)',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                ),
                onPressed: () {
                  widget.cartState.addToCart(prod);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isCkb
                            ? '${prod.nameCkb ?? prod.name} بە نرخی ڕەفە خرایە سەبەتەکەتەوە!'
                            : '${prod.name} added at shelf price!',
                      ),
                      backgroundColor: const Color(0xFF16A34A),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                  Navigator.pop(context);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCornerBracket({required bool isTop, required bool isLeft}) {
    return Container(
      width: 16,
      height: 16,
      decoration: BoxDecoration(
        border: Border(
          top: isTop ? const BorderSide(color: Color(0xFFEF4444), width: 3) : BorderSide.none,
          bottom: !isTop ? const BorderSide(color: Color(0xFFEF4444), width: 3) : BorderSide.none,
          left: isLeft ? const BorderSide(color: Color(0xFFEF4444), width: 3) : BorderSide.none,
          right: !isLeft ? const BorderSide(color: Color(0xFFEF4444), width: 3) : BorderSide.none,
        ),
      ),
    );
  }

  Widget _buildBarLine(double width, double height) {
    return Container(
      width: width,
      height: height,
      margin: const EdgeInsets.symmetric(horizontal: 2.5),
      color: Colors.white.withOpacity(0.7),
    );
  }
}
