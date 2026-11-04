import 'package:flutter/material.dart';
import 'app_translations.dart';

class LocaleProvider extends ChangeNotifier {
  static final LocaleProvider _instance = LocaleProvider._internal();
  factory LocaleProvider() => _instance;
  LocaleProvider._internal();

  String _currentLanguage = 'ckb';

  String get currentLanguage => _currentLanguage;

  bool get isRtl => _currentLanguage == 'ckb' || _currentLanguage == 'ar';
  bool get isKurdish => _currentLanguage == 'ckb';
  bool get isArabic => _currentLanguage == 'ar';
  bool get isEnglish => _currentLanguage == 'en';

  TextDirection get textDirection => isRtl ? TextDirection.rtl : TextDirection.ltr;

  Locale get flutterLocale {
    switch (_currentLanguage) {
      case 'ckb':
        // Flutter SDK's GlobalMaterialLocalizations lacks built-in 'ckb' translations.
        // Falling back internal Flutter MaterialLocalizations to 'ar' guarantees full RTL
        // support, preventing TextField release-mode crash (grey box of death) while
        // maintaining 100% Kurdish Sorani app translations via AppTranslations.
        return const Locale('ar');
      case 'ar':
        return const Locale('ar');
      case 'en':
      default:
        return const Locale('en');
    }
  }

  void setLanguage(String langCode) {
    if (_currentLanguage != langCode && (langCode == 'en' || langCode == 'ckb' || langCode == 'ar')) {
      _currentLanguage = langCode;
      notifyListeners();
    }
  }

  String translate(String key, {Map<String, String>? params}) {
    return AppTranslations.get(key, _currentLanguage, params: params);
  }
}

typedef AppLocale = LocaleProvider;
