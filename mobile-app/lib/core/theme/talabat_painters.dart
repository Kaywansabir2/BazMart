import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'app_theme.dart';

/// Painter for the curved orange wave at the bottom of vertical promo cards
class PromoCardWavePainter extends CustomPainter {
  final Color waveColor;

  const PromoCardWavePainter({this.waveColor = AppColors.primaryOrange});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = waveColor
      ..style = PaintingStyle.fill;

    final path = Path();
    // Start at bottom-left
    path.moveTo(0, size.height);
    // Draw up to wave start
    path.lineTo(0, size.height * 0.45);
    // Smooth Bezier wave
    path.cubicTo(
      size.width * 0.35,
      size.height * 0.15,
      size.width * 0.65,
      size.height * 0.65,
      size.width,
      size.height * 0.30,
    );
    // Down to bottom-right
    path.lineTo(size.width, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Painter for subtle 4-point sparkle stars on promo cards
class SparkleStarPainter extends CustomPainter {
  final Color color;
  final double sizeFactor;

  const SparkleStarPainter({
    this.color = AppColors.primaryOrange,
    this.sizeFactor = 1.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.4)
      ..style = PaintingStyle.fill;

    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = (size.width / 2) * sizeFactor;
    final innerR = r * 0.22;

    final path = Path();
    for (int i = 0; i < 4; i++) {
      double outerAngle = i * (math.pi / 2) - (math.pi / 2);
      double innerAngle = outerAngle + (math.pi / 4);

      if (i == 0) {
        path.moveTo(cx + r * math.cos(outerAngle), cy + r * math.sin(outerAngle));
      } else {
        path.lineTo(cx + r * math.cos(outerAngle), cy + r * math.sin(outerAngle));
      }
      path.lineTo(cx + innerR * math.cos(innerAngle), cy + innerR * math.sin(innerAngle));
    }
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Highlight marker strip widget that places a yellow highlight (#FFF176)
/// across the lower half of the price text, exactly matching Talabat Mart
class PriceHighlighterWidget extends StatelessWidget {
  final String priceText;
  final TextStyle? textStyle;

  const PriceHighlighterWidget({
    super.key,
    required this.priceText,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    final style = textStyle ??
        const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w800,
          color: AppColors.textPrimary,
          height: 1.1,
        );

    return Stack(
      alignment: Alignment.centerLeft,
      children: [
        Positioned(
          left: 0,
          right: 0,
          bottom: 1,
          height: 8,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.highlighterYellow,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
        Text(priceText, style: style),
      ],
    );
  }
}

/// High-Fidelity Kurdistan Region Flag Custom Painter
class KurdistanFlagPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double stripeHeight = size.height / 3;

    // 1. Top Stripe: Red (#ED1B24)
    final redPaint = Paint()..color = const Color(0xFFED1B24);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, stripeHeight), redPaint);

    // 2. Middle Stripe: White (#FFFFFF)
    final whitePaint = Paint()..color = Colors.white;
    canvas.drawRect(Rect.fromLTWH(0, stripeHeight, size.width, stripeHeight), whitePaint);

    // 3. Bottom Stripe: Green (#00A651)
    final greenPaint = Paint()..color = const Color(0xFF00A651);
    canvas.drawRect(Rect.fromLTWH(0, stripeHeight * 2, size.width, stripeHeight), greenPaint);

    // 4. Center Golden Sun with 21 rays (#FFD100)
    final sunCenter = Offset(size.width / 2, size.height / 2);
    final sunRadius = stripeHeight * 0.42;
    final rayOuterRadius = stripeHeight * 0.90;

    final sunPaint = Paint()
      ..color = const Color(0xFFFFD100)
      ..style = PaintingStyle.fill;

    // Draw 21 rays
    final rayPath = Path();
    const int totalRays = 21;
    const double step = (2 * math.pi) / totalRays;
    const double halfRayWidth = step * 0.28;

    for (int i = 0; i < totalRays; i++) {
      final double angle = i * step - (math.pi / 2);
      final double tipX = sunCenter.dx + rayOuterRadius * math.cos(angle);
      final double tipY = sunCenter.dy + rayOuterRadius * math.sin(angle);

      final double b1X = sunCenter.dx + sunRadius * math.cos(angle - halfRayWidth);
      final double b1Y = sunCenter.dy + sunRadius * math.sin(angle - halfRayWidth);

      final double b2X = sunCenter.dx + sunRadius * math.cos(angle + halfRayWidth);
      final double b2Y = sunCenter.dy + sunRadius * math.sin(angle + halfRayWidth);

      if (i == 0) {
        rayPath.moveTo(b1X, b1Y);
      } else {
        rayPath.lineTo(b1X, b1Y);
      }
      rayPath.lineTo(tipX, tipY);
      rayPath.lineTo(b2X, b2Y);
    }
    rayPath.close();
    canvas.drawPath(rayPath, sunPaint);

    // Draw central circular sun disc
    canvas.drawCircle(sunCenter, sunRadius, sunPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
