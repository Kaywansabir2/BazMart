import 'package:flutter/material.dart';

class BrandModel {
  final String id;
  final String name;
  final Color backgroundColor;
  final Color textColor;
  final String? badgeText;
  final IconData? icon;

  const BrandModel({
    required this.id,
    required this.name,
    required this.backgroundColor,
    required this.textColor,
    this.badgeText,
    this.icon,
  });
}
