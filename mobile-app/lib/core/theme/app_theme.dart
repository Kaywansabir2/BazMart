import 'package:flutter/material.dart';

/// Exact Talabat Mart Visual Design Tokens for BazMart
class AppColors {
  // Page Backgrounds
  static const Color scaffoldBackground = Color(0xFFFFFFFF);
  static const Color webWrapperBackground = Color(0xFFE5E7EB);
  static const Color phoneFrameBorder = Color(0xFFD1D5DB);

  // Brand Colors
  static const Color primaryOrange = Color(0xFFFF5A00);
  static const Color primaryOrangeLight = Color(0xFFFFF3ED);
  static const Color primaryOrangeDark = Color(0xFFE04F00);

  // Surfaces & Containers
  static const Color productBoxSurface = Color(0xFFF5F6F8);
  static const Color promoCardSurface = Color(0xFFF6F1EB);
  static const Color searchFieldBackground = Color(0xFFF3F4F6);

  // Discount & Highlights
  static const Color discountBadge = Color(0xFFA4FF00); // Neon Lime Green
  static const Color highlighterYellow = Color(0xFFFFF176); // Yellow marker strip

  // Typography & Neutrals
  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF4B5563);
  static const Color textMuted = Color(0xFF8E8E93);
  static const Color dividerColor = Color(0xFFE5E7EB);
  static const Color iconColor = Color(0xFF374151);

  // Progress Bar & Threshold
  static const Color progressTrack = Color(0xFFE5E7EB);
  static const Color progressFill = Color(0xFFFF5A00);
  static const Color categoryPillActive = Color(0xFFFF5A00);
  static const Color categoryPillInactive = Color(0xFFD1D5DB);
}

class AppTheme {
  static const Color talabatOrange = AppColors.primaryOrange;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.scaffoldBackground,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primaryOrange,
        primary: AppColors.primaryOrange,
        surface: AppColors.scaffoldBackground,
        brightness: Brightness.light,
      ),
      fontFamily: 'Vazirmatn',
      fontFamilyFallback: const ['Vazirmatn', 'Tahoma', 'Arial', 'Roboto'],
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.scaffoldBackground,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.dividerColor,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
