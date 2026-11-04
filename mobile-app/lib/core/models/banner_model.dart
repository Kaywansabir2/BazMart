import 'package:flutter/material.dart';

class PromoCardModel {
  final String id;
  final String title;
  final String? titleCkb;
  final String? titleAr;
  final String? bubbleBadge; // e.g. "Hot Deals"
  final String? bubbleBadgeCkb;
  final String? bubbleBadgeAr;
  final String itemSubtitle;
  final String? itemSubtitleCkb;
  final String? itemSubtitleAr;
  final String imageType; // for custom illustration or asset
  final Color backgroundColor;
  final Color waveColor;

  const PromoCardModel({
    required this.id,
    required this.title,
    this.titleCkb,
    this.titleAr,
    this.bubbleBadge,
    this.bubbleBadgeCkb,
    this.bubbleBadgeAr,
    required this.itemSubtitle,
    this.itemSubtitleCkb,
    this.itemSubtitleAr,
    required this.imageType,
    this.backgroundColor = const Color(0xFFF6F1EB),
    this.waveColor = const Color(0xFFFF5A00),
  });

  String getTitle(String lang) {
    if (lang == 'ckb' && titleCkb != null && titleCkb!.isNotEmpty) return titleCkb!;
    if (lang == 'ar' && titleAr != null && titleAr!.isNotEmpty) return titleAr!;
    return title;
  }

  String getItemSubtitle(String lang) {
    if (lang == 'ckb' && itemSubtitleCkb != null && itemSubtitleCkb!.isNotEmpty) return itemSubtitleCkb!;
    if (lang == 'ar' && itemSubtitleAr != null && itemSubtitleAr!.isNotEmpty) return itemSubtitleAr!;
    return itemSubtitle;
  }

  String? getBubbleBadge(String lang) {
    if (lang == 'ckb' && bubbleBadgeCkb != null && bubbleBadgeCkb!.isNotEmpty) return bubbleBadgeCkb!;
    if (lang == 'ar' && bubbleBadgeAr != null && bubbleBadgeAr!.isNotEmpty) return bubbleBadgeAr!;
    return bubbleBadge;
  }
}

class BannerModel {
  final String id;
  final String title;
  final String subtitle;
  final String? ctaText;
  final Color backgroundColor;
  final Color accentColor;
  final String themeType; // 'pepsi', 'fresh_picks', 'nescafe'

  const BannerModel({
    required this.id,
    required this.title,
    required this.subtitle,
    this.ctaText,
    required this.backgroundColor,
    required this.accentColor,
    required this.themeType,
  });
}
