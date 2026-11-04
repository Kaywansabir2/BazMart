import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/localization/app_locale.dart';

class PromoBannerCard extends StatelessWidget {
  final String themeType; // 'pepsi', 'fresh_picks', 'nescafe'
  final LocaleProvider localeProvider;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? margin;

  const PromoBannerCard({
    super.key,
    required this.themeType,
    required this.localeProvider,
    this.onTap,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    Widget banner;
    switch (themeType) {
      case 'pepsi':
        banner = _buildPepsiBanner();
        break;
      case 'fresh_picks':
        banner = _buildFreshPicksBanner();
        break;
      case 'nescafe':
        banner = _buildNescafeBanner();
        break;
      default:
        banner = const SizedBox.shrink();
    }
    return GestureDetector(
      onTap: onTap,
      child: banner,
    );
  }

  // Pepsi Banner: "TASTE REAL REFRESHMENT!" Blue ice theme
  Widget _buildPepsiBanner() {
    return Container(
      margin: margin ?? const EdgeInsets.symmetric(horizontal: 16),
      height: 110,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [Color(0xFF003882), Color(0xFF0066CC), Color(0xFF0088FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF003882).withOpacity(0.25),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background decorative ice/sparkle circles
          Positioned(
            right: -20,
            bottom: -20,
            child: Container(
              width: 130,
              height: 130,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.08),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD50000),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'PEPSI PROMO',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        localeProvider.translate('pepsi_banner_title'),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.2,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        localeProvider.translate('pepsi_banner_subtitle'),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.sports_bar, color: Colors.white, size: 36),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Fresh Picks Split Banner: "Fresh picks every day" with angled orange "Shop now" ribbon & geometric bag
  Widget _buildFreshPicksBanner() {
    return Container(
      margin: margin ?? const EdgeInsets.symmetric(horizontal: 16),
      height: 105,
      decoration: BoxDecoration(
        color: const Color(0xFFFFF9EE),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFE0B2), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFF9800).withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.antiAlias,
        children: [
          // Right-side angled geometric shapes & overflowing grocery bag
          Positioned(
            right: -10,
            top: -15,
            bottom: -15,
            width: 140,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Green angled geometric shape
                Transform.rotate(
                  angle: 0.28,
                  child: Container(
                    width: 85,
                    height: 85,
                    decoration: BoxDecoration(
                      color: const Color(0xFF43A047).withOpacity(0.20),
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                ),
                // Orange angled geometric accent
                Transform.rotate(
                  angle: -0.18,
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF9800).withOpacity(0.18),
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
                // Overflowing Talabat Mart style orange grocery bag with leafy greens
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.10),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      const Icon(Icons.shopping_bag, color: AppColors.primaryOrange, size: 32),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(
                            color: Color(0xFF2E7D32),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.eco, color: Colors.white, size: 10),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Left-side Content: Split Color Title & Angled Ribbon Badge
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // "Fresh picks" (Orange) + " every day" (Dark Brown)
                      RichText(
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        text: const TextSpan(
                          children: [
                            TextSpan(
                              text: 'Fresh picks ',
                              style: TextStyle(
                                color: AppColors.primaryOrange,
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.3,
                              ),
                            ),
                            TextSpan(
                              text: 'every day',
                              style: TextStyle(
                                color: Color(0xFF3E2723),
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        localeProvider.currentLanguage == 'ckb'
                            ? 'هەر ڕۆژ سەوزە و میوەی دەستچین'
                            : (localeProvider.currentLanguage == 'ar'
                                ? 'خضار وفواكه طازجة يومياً'
                                : 'Farm-fresh fruits & vegetables daily'),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFF5D4037),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Angled Orange Ribbon Badge "Shop now"
                      Transform.rotate(
                        angle: -0.05,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppColors.primaryOrange,
                            borderRadius: BorderRadius.circular(6),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryOrange.withOpacity(0.35),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                localeProvider.translate('shop_now'),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(width: 4),
                              const Icon(Icons.arrow_forward_ios, size: 9, color: Colors.white),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 100), // Reserve space for right-side visual
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Nescafe Banner: "A cooler way to enjoy Coffee" Blue splash theme
  Widget _buildNescafeBanner() {
    return Container(
      margin: margin ?? const EdgeInsets.symmetric(horizontal: 16),
      height: 120,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [Color(0xFF01579B), Color(0xFF0288D1), Color(0xFF4FC3F7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF01579B).withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD32F2F),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'NESCAFÉ ICED',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    localeProvider.translate('nescafe_banner_title'),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    localeProvider.translate('nescafe_banner_subtitle'),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Icon(Icons.coffee, color: Colors.white, size: 32),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
