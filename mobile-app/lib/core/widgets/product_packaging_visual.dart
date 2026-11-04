import 'package:flutter/material.dart';
import '../models/product_model.dart';
import '../theme/app_theme.dart';

/// Ultra-Premium Packaging Visual Engine for BazMart
/// 
/// Renders bespoke, high-definition packaging artwork for all 20 benchmark products
/// (ERP-SKU-1001 through ERP-SKU-1020) and deterministic, category-aware packaging
/// for all other 380 SKUs across all 20 catalog categories.
/// Completely eliminates generic fallback icons (zero blue cups).
class ProductPackagingVisual extends StatelessWidget {
  final ProductModel product;
  final double size;

  const ProductPackagingVisual({
    super.key,
    required this.product,
    this.size = 148,
  });

  static String getPhotoAssetKey(ProductModel prod) {
    final id = prod.id.toLowerCase();
    const benchmarkMap = {
      'p-alrahma': 'milk_alrahma',
      'p-ramak': 'milk_ramak',
      'p-eggs': 'eggs',
      'p-almarai': 'milk_almarai',
      'p-cucumber': 'cucumber',
      'p-pen': 'pen',
      'p-mountain-dew': 'mountain_dew',
      'p-schauma': 'shampoo',
      'p-shallot': 'shallot',
      'p-grapefruit': 'grapefruit',
      'p-pepper-color': 'pepper_color',
      'p-tabasco-chicken': 'tabasco_chicken',
      'p-tabasco-curry': 'tabasco_curry',
      'p-tabasco-beef': 'tabasco_chicken',
      'p-nescafe-latte': 'nescafe_latte',
      'p-nescafe-cappuccino': 'nescafe_cappuccino',
      'p-nescafe-spanish': 'nescafe_spanish',
      'p-canned-coconut': 'canned_coconut',
      'p-lollipop-fruit': 'lollipop_fruit',
      'p-my-chewy': 'my_chewy',
      'p-pepsi-can': 'pepsi_can',
    };
    if (benchmarkMap.containsKey(id)) return benchmarkMap[id]!;
    final cat = prod.category.toLowerCase();
    if (cat.contains('dairy') || cat.contains('milk')) return 'milk';
    if (cat.contains('fruit') || cat.contains('veg')) return 'produce';
    if (cat.contains('meat') || cat.contains('poultry')) return 'meat';
    if (cat.contains('frozen') || cat.contains('ice')) return 'frozen';
    if (cat.contains('bakery') || cat.contains('bread')) return 'bakery';
    if (cat.contains('beverage') || cat.contains('water')) return 'beverage';
    if (cat.contains('coffee') || cat.contains('tea')) return 'coffee';
    if (cat.contains('snack') || cat.contains('chips')) return 'snack';
    if (cat.contains('ready') || cat.contains('noodle')) return 'noodles';
    if (cat.contains('cooking') || cat.contains('pantry') || cat.contains('spices')) return 'pantry';
    if (cat.contains('personal') || cat.contains('baby')) return 'personal_care';
    if (cat.contains('clean') || cat.contains('household')) return 'cleaning';
    if (cat.contains('stationery') || cat.contains('pen')) return 'stationery';
    return 'grocery_generic';
  }

  @override
  Widget build(BuildContext context) {
    final key = getPhotoAssetKey(product);
    final photoPath = 'assets/products/$key.png';

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.asset(
          photoPath,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (ctx, err, stack) => Image.network(
            'assets/products/$key.png',
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (ctx2, err2, stack2) => Transform.scale(
              scale: size / 148.0,
              child: _renderVisual(product),
            ),
          ),
        ),
      ),
    );
  }

  Widget _renderVisual(ProductModel prod) {
    final id = prod.id.toLowerCase();
    final sku = prod.sku.toUpperCase();
    final erpId = prod.externalErpId.toUpperCase();
    final name = '${prod.name} ${prod.nameCkb ?? ''} ${prod.category}'.toLowerCase();

    bool matchItem(String targetId, String targetSku, [List<String> aliases = const []]) {
      if (id == targetId || sku == targetSku || erpId == targetSku) return true;
      for (final a in aliases) {
        if (id == a || sku == a.toUpperCase() || erpId == a.toUpperCase()) return true;
      }
      return false;
    }

    // =========================================================================
    // 20 BESPOKE BENCHMARK PRODUCTS (ERP-SKU-1001 to ERP-SKU-1020)
    // =========================================================================

    // 1. Al Rahma Fresh Milk 1L (ERP-SKU-1001)
    if (matchItem('p-alrahma', 'ERP-SKU-1001', ['alrahma', 'p-alrahma-milk']) || (name.contains('al rahma') && name.contains('milk'))) {
      return _buildAlRahmaMilk();
    }

    // 2. Ramak Full Fat Milk 3% (ERP-SKU-1002)
    if (matchItem('p-ramak', 'ERP-SKU-1002', ['ramak']) || name.contains('ramak')) {
      return _buildRamakMilk();
    }

    // 3. White Farm Eggs 15 Pcs (ERP-SKU-1003)
    if (matchItem('p-eggs', 'ERP-SKU-1003', ['eggs', 'white-eggs']) || name.contains('egg') || name.contains('هێلکە')) {
      return _buildEggPulpTray();
    }

    // 4. Almarai Full Fat Long Life Milk, 1L (ERP-SKU-1004) - 1L UHT Milk Carton!
    if (matchItem('p-almarai', 'ERP-SKU-1004', ['almarai', 'almarai-milk']) || (name.contains('almarai') && name.contains('milk'))) {
      return _buildAlmarai1LMilkCarton();
    }

    // 5. Local Crisp Cucumbers 1kg (ERP-SKU-1005)
    if (matchItem('p-cucumber', 'ERP-SKU-1005', ['cucumber', 'local-cucumber']) || name.contains('cucumber') || name.contains('خەیار')) {
      return _buildFreshCucumbers();
    }

    // 6. Piano / Schneider Ballpoint Pen (ERP-SKU-1006)
    if (matchItem('p-pen', 'ERP-SKU-1006', ['p-piano-pen', 'piano-pen', 'schneider-pen']) || name.contains('piano') || name.contains('ballpoint') || name.contains('pen')) {
      return _buildPrecisionPen();
    }

    // 7. Mountain Dew Bottle / Can (ERP-SKU-1007)
    if (matchItem('p-mountain-dew', 'ERP-SKU-1007', ['mountain-dew', 'dew']) || name.contains('mountain dew') || name.contains('dew')) {
      return _buildMountainDewCan();
    }

    // 8. Schauma Herbal Shampoo 400ml (ERP-SKU-1008)
    if (matchItem('p-schauma', 'ERP-SKU-1008', ['schauma', 'schauma-shampoo']) || name.contains('schauma') || name.contains('shampoo')) {
      return _buildSchaumaShampooBottle();
    }

    // 9. Premium Kurdish Shallots 500g (ERP-SKU-1009)
    if (matchItem('p-shallot', 'ERP-SKU-1009', ['shallot', 'shallots']) || name.contains('shallot') || name.contains('شەلۆت')) {
      return _buildShallotCluster();
    }

    // 10. Ruby Red Grapefruit 750g (ERP-SKU-1010)
    if (matchItem('p-grapefruit', 'ERP-SKU-1010', ['grapefruit']) || name.contains('grapefruit') || name.contains('گریپ فروت')) {
      return _buildGrapefruitHalves();
    }

    // 11. Color Bell Pepper Trio (ERP-SKU-1011)
    if (matchItem('p-pepper-color', 'ERP-SKU-1011', ['pepper-color', 'bell-pepper']) || name.contains('bell pepper') || name.contains('بیبەر')) {
      return _buildBellPepperTrio();
    }

    // 12. Tabasco Spicy Ramen Chicken (ERP-SKU-1012)
    if (matchItem('p-tabasco-chicken', 'ERP-SKU-1012') || (name.contains('tabasco') && name.contains('chicken'))) {
      return _buildTabascoNoodlePack('Chicken');
    }

    // 13. Tabasco Spicy Ramen Beef (ERP-SKU-1013)
    if (matchItem('p-tabasco-beef', 'ERP-SKU-1013') || (name.contains('tabasco') && name.contains('beef'))) {
      return _buildTabascoNoodlePack('Beef');
    }

    // 14. Tabasco Spicy Ramen Curry Blaze (ERP-SKU-1014) - Golden-Orange Curry Blaze!
    if (matchItem('p-tabasco-curry', 'ERP-SKU-1014') || (name.contains('tabasco') && name.contains('curry'))) {
      return _buildTabascoNoodlePack('Curry');
    }

    // Catch-all for any other Tabasco ramen
    if (id.startsWith('p-tabasco') || name.contains('tabasco')) {
      return _buildTabascoNoodlePack(prod.name);
    }

    // 15. Nescafe Iced Latte Aluminum Can (ERP-SKU-1015)
    if (matchItem('p-nescafe-latte', 'ERP-SKU-1015', ['p-nescafe-iced-caramel', 'nescafe-latte', 'p-nescafe-iced-latte']) || (name.contains('nescafe') && name.contains('latte'))) {
      return _buildIcedCoffeeCan(const Color(0xFFD97706), const Color(0xFF92400E), 'LATTE');
    }

    // 16. Nescafe Iced Cappuccino (ERP-SKU-1016) - Mocha-Brown Can!
    if (matchItem('p-nescafe-cappuccino', 'ERP-SKU-1016', ['nescafe-cappuccino']) || (name.contains('nescafe') && name.contains('cappuccino'))) {
      return _buildIcedCoffeeCan(const Color(0xFF78350F), const Color(0xFF451A03), 'CAPPUCCINO');
    }

    // 17. Nescafe Iced Spanish Latte (ERP-SKU-1017) - Turquoise-Gold Can!
    if (matchItem('p-nescafe-spanish', 'ERP-SKU-1017', ['p-nescafe-iced-vanilla', 'nescafe-spanish', 'spanish-latte']) || (name.contains('nescafe') && name.contains('spanish'))) {
      return _buildIcedCoffeeCan(const Color(0xFF0D9488), const Color(0xFFD97706), 'SPANISH');
    }

    // 18. Chaokoh Tropical Coconut Milk Tin 400ml (ERP-SKU-1018)
    if (matchItem('p-coconut-milk', 'ERP-SKU-1018', ['coconut-milk']) || name.contains('coconut milk') || name.contains('شیری گوێزی هیندی')) {
      return _buildCoconutMilkTin();
    }

    // 19. Sweet Rabbit Rainbow Lollipop 60g (ERP-SKU-1019)
    if (matchItem('p-lollipop', 'ERP-SKU-1019', ['p-rabbit-lollipop', 'rabbit-lollipop', 'lollipop']) || name.contains('rabbit') || name.contains('lollipop') || name.contains('مژمژە')) {
      return _buildRabbitLollipop();
    }

    // 20. My Chewy Coconut Candy (ERP-SKU-1020) - Bespoke My Chewy Coconut Candy!
    if (matchItem('p-my-chewy', 'ERP-SKU-1020', ['p-chewy-candy', 'chewy-candy', 'my-chewy']) || name.contains('chewy') || name.contains('my chewy')) {
      if (id == 'p-chewy-candy' || name.contains('fruit') || name.contains('bites')) {
        return _buildChewyCandyPouch();
      }
      return _buildMyChewyCoconutCandy();
    }

    // Additional Reference Staples
    // Fresh Kurdish Samoon / Bread (ERP-SKU-1024)
    if (matchItem('p-kurdish-bread', 'ERP-SKU-1024', ['p-bread', 'p-samoon']) || name.contains('bread') || name.contains('samoon') || name.contains('نان')) {
      return _buildKurdishBreadLoaf();
    }

    // Fresh Kurdistan Halal Chicken (ERP-SKU-1044)
    if (matchItem('p-kurdistan-chicken', 'ERP-SKU-1044', ['p-chicken', 'p-chicken-breast']) || name.contains('chicken') || name.contains('مریشک')) {
      return _buildKurdistanChickenTray();
    }

    // =========================================================================
    // DETERMINISTIC CATEGORY-AWARE VISUAL GENERATOR FOR ALL OTHER 380 SKUs
    // =========================================================================
    return _buildDeterministicCategoryVisual(prod);
  }

  // ---------------------------------------------------------------------------
  // 1. Al Rahma Fresh Milk 1L
  // ---------------------------------------------------------------------------
  Widget _buildAlRahmaMilk() {
    return Container(
      width: 86,
      height: 114,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFE0F2FE), Color(0xFFBAE6FD)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: const Color(0xFF0284C7).withOpacity(0.18), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Green Screw Cap
          Positioned(
            top: 6,
            child: Container(
              width: 26,
              height: 10,
              decoration: BoxDecoration(
                color: const Color(0xFF16A34A),
                borderRadius: BorderRadius.circular(4),
                boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 2, offset: Offset(0, 1))],
              ),
            ),
          ),
          // White Milk Bottle Body
          Positioned(
            top: 14,
            child: Container(
              width: 58,
              height: 86,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                boxShadow: const [BoxShadow(color: Color(0x15000000), blurRadius: 4, offset: Offset(0, 2))],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.water_drop_rounded, size: 26, color: Color(0xFF0284C7)),
                  const SizedBox(height: 3),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF16A34A),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text('AL RAHMA', style: TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.w900)),
                  ),
                  const SizedBox(height: 2),
                  const Text('100% PURE', style: TextStyle(color: Color(0xFF0284C7), fontSize: 6, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
          // Cold Droplets & 1L Badge
          Positioned(
            bottom: 6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
              decoration: BoxDecoration(
                color: const Color(0xFF0284C7),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('1 LITRE', style: TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.w800)),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Ramak Full Fat Milk 3%
  // ---------------------------------------------------------------------------
  Widget _buildRamakMilk() {
    return Container(
      width: 86,
      height: 114,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
        boxShadow: [
          BoxShadow(color: const Color(0xFFDC2626).withOpacity(0.12), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          // Red Gable Top
          Container(
            height: 26,
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFFDC2626), Color(0xFFB91C1C)]),
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
            ),
            child: const Center(
              child: Text('RAMAK', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
            ),
          ),
          // Emerald Green Wave Stripe
          Container(
            height: 10,
            width: double.infinity,
            color: const Color(0xFF059669),
          ),
          // Center Body with 3% Fat Badge
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFFEF2F2),
                      border: Border.all(color: const Color(0xFFDC2626), width: 1.5),
                    ),
                    child: const Center(
                      child: Text('3%\nFAT', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFFDC2626), fontSize: 8, fontWeight: FontWeight.w900, height: 1.0)),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text('FULL CREAM', style: TextStyle(color: Color(0xFF334155), fontSize: 7, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
          // Bottom Gold Seal
          Container(
            height: 14,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFFD97706),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(12)),
            ),
            child: const Center(
              child: Text('FRESH PASTEURIZED', style: TextStyle(color: Colors.white, fontSize: 6, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Egg Pulp Tray (15 Eggs)
  // ---------------------------------------------------------------------------
  Widget _buildEggPulpTray() {
    return Container(
      width: 104,
      height: 94,
      decoration: BoxDecoration(
        color: const Color(0xFFFBBF24),
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(color: const Color(0xFFD97706).withOpacity(0.18), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Center(
        child: Container(
          width: 88,
          height: 68,
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: const Color(0xFFB45309),
            borderRadius: BorderRadius.circular(10),
            boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2))],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(4, (_) => _buildEggShell()),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(4, (_) => _buildEggShell()),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('15 FARM FRESH EGGS', style: TextStyle(color: Color(0xFFB45309), fontSize: 6, fontWeight: FontWeight.w900)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEggShell() {
    return Container(
      width: 15,
      height: 19,
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFFCD34D), width: 1),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 1, offset: Offset(0, 1))],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Almarai 1L Full Fat Long Life Milk (Tetra Pak Carton)
  // ---------------------------------------------------------------------------
  Widget _buildAlmarai1LMilkCarton() {
    return Container(
      width: 86,
      height: 114,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0047BA), Color(0xFF1E3A8A), Color(0xFF0F172A)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF2563EB), width: 1.2),
        boxShadow: [
          BoxShadow(color: const Color(0xFF0047BA).withOpacity(0.35), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Column(
            children: [
              // White Screw Cap with ridged top
              Container(
                margin: const EdgeInsets.only(top: 5),
                width: 24,
                height: 8,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(3),
                  boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 2, offset: Offset(0, 1))],
                ),
              ),
              const SizedBox(height: 6),
              // Brand Wordmark in Arabic & English
              const Text('المراعي', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, height: 1.0)),
              const Text('Almarai', style: TextStyle(color: Color(0xFF93C5FD), fontSize: 8.5, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              const SizedBox(height: 2),
              // Pure Cow's Milk Tag
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: const Color(0xFF059669), // Emerald Green
                  borderRadius: BorderRadius.circular(3),
                ),
                child: const Text('100% PURE MILK', style: TextStyle(color: Colors.white, fontSize: 5.5, fontWeight: FontWeight.w900)),
              ),
              const Spacer(),
              // Milk Splash Graphic Area
              Container(
                height: 48,
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(bottom: Radius.circular(12)),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.water_drop_rounded, color: Color(0xFF0047BA), size: 14),
                        SizedBox(width: 2),
                        Text('1 LITRE', style: TextStyle(color: Color(0xFF0047BA), fontSize: 8, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0047BA),
                        borderRadius: BorderRadius.circular(3),
                      ),
                      child: const Text('شیری تەواو چەوری', style: TextStyle(color: Colors.white, fontSize: 6.5, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Fresh Local Cucumbers
  // ---------------------------------------------------------------------------
  Widget _buildFreshCucumbers() {
    return Container(
      width: 104,
      height: 94,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFF0FDF4), Color(0xFFDCFCE7)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF86EFAC), width: 1.2),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Primary diagonal cucumber
          Transform.rotate(
            angle: -0.35,
            child: Container(
              width: 24,
              height: 72,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF166534), Color(0xFF15803D), Color(0xFF16A34A)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: const [BoxShadow(color: Color(0x20000000), blurRadius: 4, offset: Offset(2, 2))],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(5, (_) => Container(width: 3, height: 3, decoration: const BoxDecoration(color: Color(0xFFBBF7D0), shape: BoxShape.circle))),
              ),
            ),
          ),
          // Secondary diagonal cucumber
          Transform.rotate(
            angle: 0.45,
            child: Container(
              width: 20,
              height: 64,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF15803D), Color(0xFF22C55E)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: BorderRadius.circular(10),
                boxShadow: const [BoxShadow(color: Color(0x15000000), blurRadius: 3, offset: Offset(1, 1))],
              ),
            ),
          ),
          // Fresh Kurdish Farm Badge
          Positioned(
            bottom: 6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF15803D),
                borderRadius: BorderRadius.circular(6),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 3)],
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.eco, color: Color(0xFF86EFAC), size: 10),
                  SizedBox(width: 3),
                  Text('LOCAL CRISP', style: TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 6. Piano / Schneider Precision Ballpoint Pen
  // ---------------------------------------------------------------------------
  Widget _buildPrecisionPen() {
    return Container(
      width: 90,
      height: 94,
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Center(
        child: Transform.rotate(
          angle: -0.785, // 45 degrees
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Click push button
              Container(width: 8, height: 6, color: const Color(0xFFCBD5E1)),
              // Clip
              Container(width: 14, height: 4, color: const Color(0xFFDC2626)),
              // Main Barrel
              Container(
                width: 12,
                height: 68,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFEF4444), Color(0xFFDC2626), Color(0xFF991B1B)],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(3),
                  boxShadow: const [BoxShadow(color: Color(0x25000000), blurRadius: 3, offset: Offset(1, 1))],
                ),
                child: Center(
                  child: Container(
                    width: 3,
                    height: 48,
                    color: Colors.white.withOpacity(0.35),
                  ),
                ),
              ),
              // Metallic Tip & Ballpoint
              Container(
                width: 6,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFF94A3B8),
                  borderRadius: BorderRadius.vertical(bottom: Radius.circular(3)),
                ),
              ),
              Container(
                width: 2,
                height: 2,
                decoration: const BoxDecoration(color: Color(0xFF1E293B), shape: BoxShape.circle),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 7. Mountain Dew Neon Citrus Can
  // ---------------------------------------------------------------------------
  Widget _buildMountainDewCan() {
    return Container(
      width: 80,
      height: 110,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF84CC16), Color(0xFF65A30D), Color(0xFF15803D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(color: const Color(0xFF84CC16).withOpacity(0.35), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Stack(
        children: [
          // Silver Can Rim Top
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 10,
              decoration: const BoxDecoration(
                color: Color(0xFFE2E8F0),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
            ),
          ),
          // Bold Angled Lightning Slash Graphic
          Positioned.fill(
            child: Center(
              child: Transform.rotate(
                angle: -0.25,
                child: Container(
                  width: 58,
                  height: 38,
                  decoration: BoxDecoration(
                    color: const Color(0xFFDC2626),
                    borderRadius: BorderRadius.circular(6),
                    boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 3)],
                  ),
                  child: const Center(
                    child: Text(
                      'DEW',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                        letterSpacing: -1,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          // Silver Bottom Rim
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 8,
              decoration: const BoxDecoration(
                color: Color(0xFFCBD5E1),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 8. Schauma Herbal Shampoo 400ml
  // ---------------------------------------------------------------------------
  Widget _buildSchaumaShampooBottle() {
    return Container(
      width: 78,
      height: 116,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF7C3AED), Color(0xFF6D28D9), Color(0xFF4C1D95)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: const Color(0xFF6D28D9).withOpacity(0.30), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          // Ergonomic Purple Cap
          Container(
            margin: const EdgeInsets.only(top: 4),
            width: 32,
            height: 12,
            decoration: BoxDecoration(
              color: const Color(0xFFA78BFA),
              borderRadius: BorderRadius.circular(5),
            ),
          ),
          const SizedBox(height: 8),
          const Text('schauma', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
          const Spacer(),
          // Pearlescent Botanical Droplet Motif
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.15),
              border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
            ),
            child: const Icon(Icons.spa_rounded, color: Color(0xFFC4B5FD), size: 26),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text('7 HERBS • 400ML', style: TextStyle(color: Colors.white, fontSize: 6, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 9. Premium Shallot Cluster
  // ---------------------------------------------------------------------------
  Widget _buildShallotCluster() {
    return Container(
      width: 96,
      height: 94,
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFECDD3)),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Shallot Bulb 1
          Positioned(
            left: 20,
            bottom: 22,
            child: _buildShallotBulb(const Color(0xFF9F1239), 32, 42),
          ),
          // Shallot Bulb 2 (Foreground)
          Positioned(
            right: 20,
            bottom: 18,
            child: _buildShallotBulb(const Color(0xFFBE123C), 36, 46),
          ),
          // Top Sprouts
          Positioned(
            top: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
              decoration: BoxDecoration(
                color: const Color(0xFF9F1239),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text('KURDISH SHALLOTS', style: TextStyle(color: Colors.white, fontSize: 6, fontWeight: FontWeight.w900)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShallotBulb(Color color, double width, double height) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color, color.withOpacity(0.75)],
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
        ),
        borderRadius: BorderRadius.vertical(top: Radius.circular(width / 2), bottom: Radius.circular(width / 2.5)),
        boxShadow: const [BoxShadow(color: Color(0x20000000), blurRadius: 3, offset: Offset(0, 2))],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(width: 4, height: 6, color: const Color(0xFF15803D)),
          Container(width: 4, height: 4, color: const Color(0xFF78350F)),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 10. Ruby Red Grapefruit Halves
  // ---------------------------------------------------------------------------
  Widget _buildGrapefruitHalves() {
    return Container(
      width: 96,
      height: 94,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF7ED), Color(0xFFFFEDD5)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDBA74)),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Whole Grapefruit Sphere (Background)
          Positioned(
            left: 16,
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const RadialGradient(
                  colors: [Color(0xFFFB923C), Color(0xFFEA580C)],
                  center: Alignment(-0.2, -0.2),
                ),
                boxShadow: const [BoxShadow(color: Color(0x25000000), blurRadius: 4, offset: Offset(2, 2))],
              ),
            ),
          ),
          // Cut Half Cross-Section (Foreground)
          Positioned(
            right: 14,
            child: Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFF97316),
                border: Border.all(color: const Color(0xFFFED7AA), width: 3),
                boxShadow: const [BoxShadow(color: Color(0x30000000), blurRadius: 5, offset: Offset(1, 2))],
              ),
              child: Center(
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFFE11D48), // Ruby Red
                  ),
                  child: const Center(
                    child: Icon(Icons.wb_sunny_rounded, color: Color(0xFFFECDD3), size: 24),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 11. Color Bell Pepper Trio
  // ---------------------------------------------------------------------------
  Widget _buildBellPepperTrio() {
    return Container(
      width: 96,
      height: 94,
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Yellow Pepper
          Positioned(
            left: 12,
            bottom: 20,
            child: _buildPepperBody(const Color(0xFFEAB308), 28, 44),
          ),
          // Green Pepper
          Positioned(
            right: 12,
            bottom: 20,
            child: _buildPepperBody(const Color(0xFF16A34A), 28, 44),
          ),
          // Red Pepper (Center Hero)
          Positioned(
            bottom: 14,
            child: _buildPepperBody(const Color(0xFFDC2626), 34, 52),
          ),
        ],
      ),
    );
  }

  Widget _buildPepperBody(Color color, double width, double height) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 4, height: 6, decoration: BoxDecoration(color: const Color(0xFF15803D), borderRadius: BorderRadius.circular(2))),
        Container(
          width: width,
          height: height - 6,
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [color, color.withOpacity(0.85)], begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(width / 3),
            boxShadow: const [BoxShadow(color: Color(0x25000000), blurRadius: 3, offset: Offset(0, 2))],
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // 12-14. Tabasco Spicy Ramen / Noodle Pack (Chicken, Beef, Curry)
  // ---------------------------------------------------------------------------
  Widget _buildTabascoNoodlePack(String flavorName) {
    final isCurry = flavorName.toLowerCase().contains('curry');
    final isBeef = flavorName.toLowerCase().contains('beef');

    Color primaryTop = const Color(0xFFDC2626); // Fiery Red
    Color primaryBottom = const Color(0xFF991B1B);
    String flavorLabel = 'CHICKEN RAMEN';
    Color badgeColor = const Color(0xFFFACC15);

    if (isCurry) {
      primaryTop = const Color(0xFFEA580C); // Golden Orange Curry Blaze
      primaryBottom = const Color(0xFFB45309);
      flavorLabel = 'CURRY BLAZE';
      badgeColor = const Color(0xFFFEF08A);
    } else if (isBeef) {
      primaryTop = const Color(0xFF78350F); // Mahogany Beef
      primaryBottom = const Color(0xFF451A03);
      flavorLabel = 'SPICED BEEF';
      badgeColor = const Color(0xFFFED7AA);
    }

    return Container(
      width: 90,
      height: 104,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primaryTop, primaryBottom],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: primaryTop.withOpacity(0.35), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          // Top jagged seal
          Container(
            height: 10,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFF111827),
              borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Center(
              child: Text(
                isCurry ? 'SPICY CURRY BLAZE' : 'HOT & SPICY',
                style: TextStyle(color: badgeColor, fontSize: 5.5, fontWeight: FontWeight.w900),
              ),
            ),
          ),
          const SizedBox(height: 5),
          // Flame / Chili Pepper Badge
          Container(
            padding: const EdgeInsets.all(4),
            decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
            child: Icon(
              isCurry ? Icons.whatshot_rounded : Icons.local_fire_department_rounded,
              color: primaryTop,
              size: 22,
            ),
          ),
          const SizedBox(height: 3),
          const Text('TABASCO', style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
          Text(flavorLabel, style: TextStyle(color: badgeColor, fontSize: 7, fontWeight: FontWeight.bold)),
          const Spacer(),
          // Net Wt 75g
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
            margin: const EdgeInsets.only(bottom: 6),
            decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), borderRadius: BorderRadius.circular(4)),
            child: const Text('75G • SAVE 10%', style: TextStyle(color: Colors.white, fontSize: 5.5, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 13-15. Nescafe Iced Slim Aluminum Can
  // ---------------------------------------------------------------------------
  Widget _buildIcedCoffeeCan(Color colorTop, Color colorBottom, String flavor) {
    return Container(
      width: 76,
      height: 112,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [colorTop, colorBottom],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: colorBottom.withOpacity(0.35), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          // Silver Rim Top
          Container(
            height: 8,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFFE2E8F0),
              borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
            ),
          ),
          const SizedBox(height: 6),
          // Nescafe Logo
          const Text('NESCAFE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
          const Text('ICED', style: TextStyle(color: Color(0xFF67E8F9), fontSize: 8, fontWeight: FontWeight.w800)),
          const Spacer(),
          // Frosted Ice Cube & Coffee Bean
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.18),
              border: Border.all(color: Colors.white.withOpacity(0.3)),
            ),
            child: const Center(
              child: Icon(Icons.ac_unit_rounded, color: Colors.white, size: 20),
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), borderRadius: BorderRadius.circular(4)),
            child: Text(flavor, style: const TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.w900)),
          ),
          // Silver Bottom Rim
          Container(
            height: 6,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFFCBD5E1),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(15)),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 16. Chaokoh Coconut Milk Tin
  // ---------------------------------------------------------------------------
  Widget _buildCoconutMilkTin() {
    return Container(
      width: 82,
      height: 104,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFF1F5F9), Color(0xFFE2E8F0)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFCBD5E1), width: 1.5),
        boxShadow: const [BoxShadow(color: Color(0x15000000), blurRadius: 6, offset: Offset(0, 3))],
      ),
      child: Column(
        children: [
          // Tin Rim
          Container(
            height: 6,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFF94A3B8),
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
            ),
          ),
          const SizedBox(height: 6),
          // Tropical Green Label
          Container(
            width: 68,
            height: 64,
            decoration: BoxDecoration(
              color: const Color(0xFF047857),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.nature_rounded, color: Color(0xFF6EE7B7), size: 22),
                const SizedBox(height: 2),
                const Text('COCONUT', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900)),
                const Text('MILK 400ML', style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 6, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const Spacer(),
          Container(
            height: 6,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFF94A3B8),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 17. Sweet Rabbit Rainbow Lollipop
  // ---------------------------------------------------------------------------
  Widget _buildRabbitLollipop() {
    return Container(
      width: 88,
      height: 104,
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Lollipop Candy Head
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const SweepGradient(
                  colors: [
                    Color(0xFFF43F5E),
                    Color(0xFFFB923C),
                    Color(0xFFFACC15),
                    Color(0xFF4ADE80),
                    Color(0xFF38BDF8),
                    Color(0xFFA855F7),
                    Color(0xFFF43F5E),
                  ],
                ),
                boxShadow: const [BoxShadow(color: Color(0x30000000), blurRadius: 4, offset: Offset(0, 2))],
              ),
              child: Center(
                child: Container(
                  width: 22,
                  height: 22,
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
                  child: const Center(
                    child: Icon(Icons.cruelty_free_rounded, color: Color(0xFFF43F5E), size: 14),
                  ),
                ),
              ),
            ),
            // White Plastic Stick
            Container(
              width: 5,
              height: 38,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(2),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 18. Fruit Chewy Candy Pouch
  // ---------------------------------------------------------------------------
  Widget _buildChewyCandyPouch() {
    return Container(
      width: 86,
      height: 106,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFEC4899), Color(0xFFBE185D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: const Color(0xFFEC4899).withOpacity(0.35), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          Container(
            height: 10,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFFFDE047),
              borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
            ),
            child: const Center(
              child: Text('RESEALABLE POUCH', style: TextStyle(color: Color(0xFF831843), fontSize: 5, fontWeight: FontWeight.w900)),
            ),
          ),
          const SizedBox(height: 10),
          const Text('CHEWY', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
          const Text('FRUIT BITES', style: TextStyle(color: Color(0xFFFDE047), fontSize: 8, fontWeight: FontWeight.bold)),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildCandyDot(const Color(0xFFF43F5E)),
              const SizedBox(width: 4),
              _buildCandyDot(const Color(0xFFFBBF24)),
              const SizedBox(width: 4),
              _buildCandyDot(const Color(0xFF34D399)),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(4)),
            child: const Text('REAL FRUIT JUICE', style: TextStyle(color: Colors.white, fontSize: 6, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  Widget _buildCandyDot(Color color) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 1.5),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 2)],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 20. My Chewy Coconut Candy Pouch
  // ---------------------------------------------------------------------------
  Widget _buildMyChewyCoconutCandy() {
    return Container(
      width: 88,
      height: 108,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF047857), Color(0xFF065F46), Color(0xFF022C22)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF34D399), width: 1.2),
        boxShadow: [
          BoxShadow(color: const Color(0xFF065F46).withOpacity(0.35), blurRadius: 8, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        children: [
          Container(
            height: 10,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFFFDE047), // Yellow Resealable Zip
              borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: const Center(
              child: Text('MY CHEWY • ORIGINAL', style: TextStyle(color: Color(0xFF065F46), fontSize: 5.5, fontWeight: FontWeight.w900)),
            ),
          ),
          const SizedBox(height: 6),
          const Text('My Chewy', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
          const Text('COCONUT', style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 8.5, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
          const Spacer(),
          // Coconut & Candy Emblem
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              border: Border.all(color: const Color(0xFFA7F3D0), width: 2),
            ),
            child: const Center(
              child: Icon(Icons.cookie_rounded, color: Color(0xFF059669), size: 24),
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
            margin: const EdgeInsets.only(bottom: 6),
            decoration: BoxDecoration(color: Colors.black38, borderRadius: BorderRadius.circular(4)),
            child: const Text('LOW CALORIE • ٦٬٠٠٠ IQD', style: TextStyle(color: Colors.white, fontSize: 5.5, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 19. Fresh Kurdish Samoon / Bread
  // ---------------------------------------------------------------------------
  Widget _buildKurdishBreadLoaf() {
    return Container(
      width: 100,
      height: 94,
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Center(
        child: Container(
          width: 82,
          height: 52,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFD97706), Color(0xFFB45309)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: BorderRadius.circular(26),
            boxShadow: const [BoxShadow(color: Color(0x30000000), blurRadius: 6, offset: Offset(0, 3))],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Scoring slash cuts
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(4, (_) => Container(width: 3, height: 28, decoration: BoxDecoration(color: const Color(0xFFFDE68A), borderRadius: BorderRadius.circular(2)))),
              ),
              Positioned(
                bottom: 4,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                  decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), borderRadius: BorderRadius.circular(3)),
                  child: const Text('KURDISH SAMOON', style: TextStyle(color: Colors.white, fontSize: 6, fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // 20. Fresh Kurdistan Halal Chicken
  // ---------------------------------------------------------------------------
  Widget _buildKurdistanChickenTray() {
    return Container(
      width: 100,
      height: 96,
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Center(
        child: Container(
          width: 86,
          height: 72,
          decoration: BoxDecoration(
            color: const Color(0xFF15803D),
            borderRadius: BorderRadius.circular(10),
            boxShadow: const [BoxShadow(color: Color(0x25000000), blurRadius: 5, offset: Offset(0, 3))],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.dinner_dining_rounded, color: Colors.white, size: 28),
              const SizedBox(height: 3),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                decoration: BoxDecoration(
                  color: const Color(0xFFDC2626),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('100% HALAL KURDISTAN', style: TextStyle(color: Colors.white, fontSize: 6, fontWeight: FontWeight.w900)),
              ),
              const SizedBox(height: 2),
              const Text('FRESH POULTRY', style: TextStyle(color: Color(0xFF86EFAC), fontSize: 6, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // DETERMINISTIC CATEGORY-AWARE VISUAL GENERATOR (ZERO FALLBACK / ZERO BLUE CUPS)
  // ===========================================================================
  Widget _buildDeterministicCategoryVisual(ProductModel prod) {
    final cat = prod.category.toLowerCase();

    // Map category to aesthetic color palettes and specific icons
    Color primary;
    Color secondary;
    IconData icon;
    String badgeText = prod.category.toUpperCase();

    if (cat.contains('dairy') || cat.contains('milk') || cat.contains('cheese') || cat.contains('شیر')) {
      primary = const Color(0xFF0284C7);
      secondary = const Color(0xFF38BDF8);
      icon = Icons.local_drink_rounded;
      badgeText = 'DAIRY FRESH';
    } else if (cat.contains('fruit') || cat.contains('veg') || cat.contains('میوە') || cat.contains('سەوزە')) {
      primary = const Color(0xFF16A34A);
      secondary = const Color(0xFF4ADE80);
      icon = Icons.eco_rounded;
      badgeText = 'FARM FRESH';
    } else if (cat.contains('meat') || cat.contains('poultry') || cat.contains('گۆشت') || cat.contains('مریشک')) {
      primary = const Color(0xFFDC2626);
      secondary = const Color(0xFFF87171);
      icon = Icons.restaurant_rounded;
      badgeText = 'FRESH CUT';
    } else if (cat.contains('bakery') || cat.contains('bread') || cat.contains('نان')) {
      primary = const Color(0xFFD97706);
      secondary = const Color(0xFFFBBF24);
      icon = Icons.bakery_dining_rounded;
      badgeText = 'OVEN FRESH';
    } else if (cat.contains('beverage') || cat.contains('drink') || cat.contains('خواردنەوە')) {
      primary = const Color(0xFF2563EB);
      secondary = const Color(0xFF60A5FA);
      icon = Icons.sports_bar_rounded;
      badgeText = 'REFRESHING';
    } else if (cat.contains('snack') || cat.contains('crisp') || cat.contains('چیپس')) {
      primary = const Color(0xFFEA580C);
      secondary = const Color(0xFFFB923C);
      icon = Icons.cookie_rounded;
      badgeText = 'CRISPY SNACK';
    } else if (cat.contains('ready') || cat.contains('noodle') || cat.contains('soup')) {
      primary = const Color(0xFFE11D48);
      secondary = const Color(0xFFFB7185);
      icon = Icons.ramen_dining_rounded;
      badgeText = 'READY TO EAT';
    } else if (cat.contains('coffee') || cat.contains('tea') || cat.contains('قاوە') || cat.contains('چای')) {
      primary = const Color(0xFF78350F);
      secondary = const Color(0xFFB45309);
      icon = Icons.coffee_rounded;
      badgeText = 'AROMATIC';
    } else if (cat.contains('sweet') || cat.contains('candy') || cat.contains('chocolate') || cat.contains('شیرینی')) {
      primary = const Color(0xFFDB2777);
      secondary = const Color(0xFFF472B6);
      icon = Icons.cake_rounded;
      badgeText = 'SWEET TREAT';
    } else if (cat.contains('personal') || cat.contains('care') || cat.contains('beauty')) {
      primary = const Color(0xFF7C3AED);
      secondary = const Color(0xFFA78BFA);
      icon = Icons.spa_rounded;
      badgeText = 'BODY CARE';
    } else if (cat.contains('cleaning') || cat.contains('house')) {
      primary = const Color(0xFF0D9488);
      secondary = const Color(0xFF2DD4BF);
      icon = Icons.cleaning_services_rounded;
      badgeText = 'CLEAN HOME';
    } else if (cat.contains('baby')) {
      primary = const Color(0xFF0284C7);
      secondary = const Color(0xFFBAE6FD);
      icon = Icons.child_care_rounded;
      badgeText = 'GENTLE BABY';
    } else if (cat.contains('pet')) {
      primary = const Color(0xFFD97706);
      secondary = const Color(0xFFFDE68A);
      icon = Icons.pets_rounded;
      badgeText = 'PET ESSENTIAL';
    } else if (cat.contains('water') || cat.contains('ئاو')) {
      primary = const Color(0xFF0284C7);
      secondary = const Color(0xFF7DD3FC);
      icon = Icons.water_drop_rounded;
      badgeText = 'PURE WATER';
    } else {
      // General Grocery / Pantry
      primary = AppColors.primaryOrange;
      secondary = const Color(0xFFFF8A00);
      icon = Icons.shopping_bag_rounded;
      badgeText = 'BAZMART PICK';
    }

    return Container(
      width: 86,
      height: 104,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primary.withOpacity(0.12), secondary.withOpacity(0.20)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: primary.withOpacity(0.35), width: 1.2),
        boxShadow: [
          BoxShadow(color: primary.withOpacity(0.08), blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [primary, secondary], begin: Alignment.topLeft, end: Alignment.bottomRight),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: primary.withOpacity(0.30), blurRadius: 6, offset: const Offset(0, 3)),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: primary,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              badgeText,
              style: const TextStyle(color: Colors.white, fontSize: 6.5, fontWeight: FontWeight.w900, letterSpacing: 0.2),
            ),
          ),
          const SizedBox(height: 3),
          Text(
            prod.brand.isNotEmpty ? prod.brand.toUpperCase() : 'PREMIUM',
            style: TextStyle(color: primary, fontSize: 6, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
