// Kurdish Sorani & Arabic Numeral and Text Normalization Utilities

String normalizeEasternNumerals(String input) {
  if (input.isEmpty) return '';
  return input
      .replaceAll('٠', '0')
      .replaceAll('۰', '0')
      .replaceAll('١', '1')
      .replaceAll('۱', '1')
      .replaceAll('٢', '2')
      .replaceAll('۲', '2')
      .replaceAll('٣', '3')
      .replaceAll('۳', '3')
      .replaceAll('٤', '4')
      .replaceAll('۴', '4')
      .replaceAll('٥', '5')
      .replaceAll('۵', '5')
      .replaceAll('٦', '6')
      .replaceAll('۶', '6')
      .replaceAll('٧', '7')
      .replaceAll('۷', '7')
      .replaceAll('٨', '8')
      .replaceAll('۸', '8')
      .replaceAll('٩', '9')
      .replaceAll('۹', '9');
}

String normalizeKurdishArabicText(String input) {
  if (input.isEmpty) return '';
  String text = normalizeEasternNumerals(input).toLowerCase();

  // 1. Strip Arabic/Kurdish Tashkeel & Harakat (diacritics: Fathah, Dammah, Kasrah, Sukun, Shaddah, etc.)
  text = text.replaceAll(RegExp(r'[\u064B-\u065F\u0670\u06D6-\u06ED]'), '');

  // 2. Normalize Alifs (أ, إ, آ, ٱ, ٲ, ٳ -> ا)
  text = text.replaceAll(RegExp(r'[\u0622\u0623\u0625\u0671\u0672\u0673]'), 'ا');

  // 3. Normalize Kafs (ك Arabic U+0643 -> ک Kurdish/Farsi U+06A9)
  text = text.replaceAll('ك', 'ک');

  // 4. Normalize Yaas (ي Arabic with 2 dots U+064A, ى Alef maksura U+0649, ێ Kurdish E U+06CE -> ی dotless Farsi/Kurdish U+06CC)
  text = text.replaceAll(RegExp(r'[\u064A\u0649\u06CE]'), 'ی');

  // 5. Normalize Hehs & Ta Marbuta (ھ Do-chashmi U+06BE, ة Ta Marbuta U+0629 -> ه Heh U+0647)
  text = text.replaceAll(RegExp(r'[\u06BE\u0629]'), 'ه');

  // 6. Strip zero-width non-joiners & control marks
  text = text.replaceAll(RegExp(r'[\u200B-\u200F\uFEFF]'), '');

  // 7. Collapse spaces
  text = text.replaceAll(RegExp(r'\s+'), ' ').trim();

  return text;
}

class LinguisticNormalizer {
  static String toEasternNumerals(dynamic input) {
    final str = input.toString();
    return str
        .replaceAll('0', '٠')
        .replaceAll('1', '١')
        .replaceAll('2', '٢')
        .replaceAll('3', '٣')
        .replaceAll('4', '٤')
        .replaceAll('5', '٥')
        .replaceAll('6', '٦')
        .replaceAll('7', '٧')
        .replaceAll('8', '٨')
        .replaceAll('9', '٩');
  }

  static String formatWithSeparators(int amount, String lang) {
    final s = amount.toString();
    final buffer = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) {
        buffer.write(lang == 'ckb' ? '،' : ',');
      }
      buffer.write(s[i]);
    }
    final formatted = buffer.toString();
    if (lang == 'ckb' || lang == 'ar') {
      return toEasternNumerals(formatted);
    }
    return formatted;
  }

  static String formatIqd(int amount, String lang) {
    final formatted = formatWithSeparators(amount, lang);
    if (lang == 'ckb') {
      return '$formatted دینار';
    } else if (lang == 'ar') {
      return '$formatted د.ع';
    }
    return 'IQD $formatted';
  }

  static String normalizeEasternNumerals(String input) {
    if (input.isEmpty) return '';
    return input
        .replaceAll('٠', '0')
        .replaceAll('۰', '0')
        .replaceAll('١', '1')
        .replaceAll('۱', '1')
        .replaceAll('٢', '2')
        .replaceAll('۲', '2')
        .replaceAll('٣', '3')
        .replaceAll('۳', '3')
        .replaceAll('٤', '4')
        .replaceAll('۴', '4')
        .replaceAll('٥', '5')
        .replaceAll('۵', '5')
        .replaceAll('٦', '6')
        .replaceAll('۶', '6')
        .replaceAll('٧', '7')
        .replaceAll('۷', '7')
        .replaceAll('٨', '8')
        .replaceAll('۸', '8')
        .replaceAll('٩', '9')
        .replaceAll('۹', '9');
  }
}

