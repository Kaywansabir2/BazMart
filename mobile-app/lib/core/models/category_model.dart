import 'package:flutter/material.dart';

class CategoryModel {
  final String id;
  final String? slug;
  final String nameEn;
  final String nameCkb;
  final String nameAr;
  final IconData? icon;
  final Color backgroundColor;
  final Color iconColor;
  final String? iconAsset;

  const CategoryModel({
    required this.id,
    this.slug,
    required this.nameEn,
    required this.nameCkb,
    required this.nameAr,
    this.icon,
    this.backgroundColor = const Color(0xFFF7F7F7),
    this.iconColor = const Color(0xFFFF5A00),
    this.iconAsset,
  });

  String localizedName(String langCode) {
    switch (langCode) {
      case 'ckb':
        return nameCkb;
      case 'ar':
        return nameAr;
      case 'en':
      default:
        return nameEn;
    }
  }
}
