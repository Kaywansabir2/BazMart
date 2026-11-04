import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bazmart/core/localization/app_locale.dart';
import 'package:bazmart/core/localization/app_translations.dart';

void main() {
  group('BazMart Localization & RTL Directionality Tests', () {
    late LocaleProvider localeProvider;

    setUp(() {
      localeProvider = LocaleProvider();
    });

    test('Default locale is English (LTR)', () {
      expect(localeProvider.currentLanguage, 'en');
      expect(localeProvider.isRtl, isFalse);
      expect(localeProvider.textDirection, TextDirection.ltr);
      expect(localeProvider.flutterLocale, const Locale('en'));
    });

    test('Switching to Kurdish Sorani (ckb) enables RTL directionality', () {
      localeProvider.setLanguage('ckb');

      expect(localeProvider.currentLanguage, 'ckb');
      expect(localeProvider.isRtl, isTrue);
      expect(localeProvider.textDirection, TextDirection.rtl);
      expect(localeProvider.flutterLocale, const Locale('ckb'));
    });

    test('Switching to Arabic (ar) enables RTL directionality', () {
      localeProvider.setLanguage('ar');

      expect(localeProvider.currentLanguage, 'ar');
      expect(localeProvider.isRtl, isTrue);
      expect(localeProvider.textDirection, TextDirection.rtl);
      expect(localeProvider.flutterLocale, const Locale('ar'));
    });

    test('Switching back to English restores LTR layout', () {
      localeProvider.setLanguage('ckb');
      expect(localeProvider.isRtl, isTrue);

      localeProvider.setLanguage('en');
      expect(localeProvider.isRtl, isFalse);
      expect(localeProvider.textDirection, TextDirection.ltr);
    });

    test('Trilingual Dictionary completeness for core user journey strings', () {
      final testKeys = [
        'bazmart',
        'search_bazmart',
        'shop_by_category',
        'shop_by_brand',
        'around_the_world',
        'cart',
        'checkout',
        'min_order_threshold_msg',
        'cod',
        'order_tracking',
      ];

      for (final key in testKeys) {
        final enText = AppTranslations.get(key, 'en');
        final ckbText = AppTranslations.get(key, 'ckb');
        final arText = AppTranslations.get(key, 'ar');

        expect(enText.isNotEmpty, isTrue, reason: 'Key "$key" must have EN translation');
        expect(ckbText.isNotEmpty, isTrue, reason: 'Key "$key" must have CKB translation');
        expect(arText.isNotEmpty, isTrue, reason: 'Key "$key" must have AR translation');

        // Verify Kurdish uses Sorani Arabic-based characters
        expect(ckbText, isNot(equals(enText)), reason: 'CKB text should differ from English');
      }
    });

    test('Minimum order translation interpolates remaining IQD amount', () {
      final msgEn = AppTranslations.get('min_order_threshold_msg', 'en', params: {'remaining': '1250'});
      expect(msgEn, contains('1250'));
      expect(msgEn, contains('IQD'));

      final msgCkb = AppTranslations.get('min_order_threshold_msg', 'ckb', params: {'remaining': '1250'});
      expect(msgCkb, contains('1250'));

      final msgAr = AppTranslations.get('min_order_threshold_msg', 'ar', params: {'remaining': '1250'});
      expect(msgAr, contains('1250'));
    });
  });
}
