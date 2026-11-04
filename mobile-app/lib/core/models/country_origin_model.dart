class CountryOriginModel {
  final String id;
  final String nameEn;
  final String nameCkb;
  final String nameAr;
  final String flagType; // 'kurdistan', 'eu', 'usa', 'korea'

  const CountryOriginModel({
    required this.id,
    required this.nameEn,
    required this.nameCkb,
    required this.nameAr,
    required this.flagType,
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
