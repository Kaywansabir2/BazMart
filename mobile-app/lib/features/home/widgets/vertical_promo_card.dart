import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/talabat_painters.dart';
import '../../../core/models/banner_model.dart';
import '../../../core/localization/app_locale.dart';

class VerticalPromoCard extends StatelessWidget {
  final PromoCardModel card;
  final VoidCallback? onTap;
  final LocaleProvider? localeProvider;

  const VerticalPromoCard({
    super.key,
    required this.card,
    this.onTap,
    this.localeProvider,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final lang = localeProvider?.currentLanguage ?? (isRtl ? 'ckb' : 'en');
    final title = card.getTitle(lang);
    final subtitle = card.getItemSubtitle(lang);
    final bubbleBadge = card.getBubbleBadge(lang);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 106,
        height: 175,
        margin: const EdgeInsetsDirectional.only(end: 10),
        decoration: BoxDecoration(
          color: card.backgroundColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // Bottom curved wave graphic
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              height: 70,
              child: CustomPaint(
                painter: PromoCardWavePainter(waveColor: card.waveColor),
              ),
            ),

            // Sparkle stars (subtle 4-point stars)
            Positioned(
              right: 14,
              top: 28,
              width: 16,
              height: 16,
              child: CustomPaint(
                painter: SparkleStarPainter(color: card.waveColor, sizeFactor: 0.9),
              ),
            ),
            Positioned(
              left: 10,
              bottom: 48,
              width: 12,
              height: 12,
              child: CustomPaint(
                painter: SparkleStarPainter(color: Colors.white, sizeFactor: 0.8),
              ),
            ),

            // Card Content (Title, Speech Bubble, Product Graphic, Subtitle)
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Speech bubble badge if present (e.g. "Hot Deals")
                  if (bubbleBadge != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primaryOrange,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.local_fire_department, size: 10, color: Colors.white),
                          const SizedBox(width: 2),
                          Flexible(
                            child: Text(
                              bubbleBadge,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Main Title
                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      height: 1.15,
                    ),
                  ),

                  const Spacer(),

                  // Product Graphic / Illustration
                  Center(
                    child: _buildPromoGraphic(card.imageType),
                  ),

                  const Spacer(),

                  // Bottom Subtitle text over wave
                  Center(
                    child: Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 2),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPromoGraphic(String type) {
    IconData icon;
    Color color;

    switch (type) {
      case 'hot_deals':
        icon = Icons.percent;
        color = AppColors.primaryOrange;
        break;
      case 'kiri':
        icon = Icons.grid_view;
        color = const Color(0xFF1E88E5);
        break;
      case 'kurdistan_chicken':
        icon = Icons.dinner_dining;
        color = const Color(0xFF2E7D32);
        break;
      case 'nescafe':
        icon = Icons.coffee;
        color = const Color(0xFFD32F2F);
        break;
      case 'nada':
        icon = Icons.local_drink;
        color = const Color(0xFFF57C00);
        break;
      case 'puck':
        icon = Icons.cookie;
        color = const Color(0xFF0288D1);
        break;
      default:
        icon = Icons.shopping_bag;
        color = AppColors.primaryOrange;
    }

    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.92),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Icon(icon, size: 28, color: color),
      ),
    );
  }
}
