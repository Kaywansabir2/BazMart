import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/talabat_painters.dart';
import '../../../core/data/mock_erp_catalog.dart';
import '../../../core/models/country_origin_model.dart';
import '../../../core/localization/app_locale.dart';

class AroundTheWorldWidget extends StatelessWidget {
  final LocaleProvider localeProvider;
  final void Function(CountryOriginModel)? onCountryTap;

  const AroundTheWorldWidget({
    super.key,
    required this.localeProvider,
    this.onCountryTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 92,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: MockErpCatalog.countries.length,
        itemBuilder: (context, index) {
          final country = MockErpCatalog.countries[index];
          final name = country.localizedName(localeProvider.currentLanguage);

          return GestureDetector(
            onTap: () => onCountryTap?.call(country),
            child: Container(
              margin: const EdgeInsets.only(right: 18),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Circular Flag Container with Drop Shadow
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.dividerColor, width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: _buildFlag(country.flagType),
                  ),
                  const SizedBox(height: 6),
                  // Country Name
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFlag(String flagType) {
    switch (flagType) {
      case 'kurdistan':
        return CustomPaint(
          size: const Size(58, 58),
          painter: KurdistanFlagPainter(),
        );

      case 'eu':
        return Container(
          color: const Color(0xFF003399),
          child: const Center(
            child: Icon(Icons.stars, color: Color(0xFFFFCC00), size: 28),
          ),
        );

      case 'usa':
        return Container(
          color: const Color(0xFFB22234),
          child: Stack(
            children: [
              Column(
                children: List.generate(
                  5,
                  (i) => Expanded(
                    child: Container(
                      color: i % 2 == 0 ? const Color(0xFFB22234) : Colors.white,
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 0,
                top: 0,
                child: Container(
                  width: 28,
                  height: 28,
                  color: const Color(0xFF3C3B6E),
                  child: const Center(
                    child: Icon(Icons.star, color: Colors.white, size: 14),
                  ),
                ),
              ),
            ],
          ),
        );

      case 'south_korea':
        return Container(
          color: Colors.white,
          child: Center(
            child: Container(
              width: 26,
              height: 26,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFFCD2E3A), Color(0xFF0047A0)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),
        );

      default:
        return const Icon(Icons.flag, color: AppColors.primaryOrange);
    }
  }
}

class CountryFlagAvatar extends StatelessWidget {
  final CountryOriginModel country;
  final LocaleProvider localeProvider;
  final double size;

  const CountryFlagAvatar({
    super.key,
    required this.country,
    required this.localeProvider,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.dividerColor, width: 1.2),
      ),
      clipBehavior: Clip.antiAlias,
      child: country.flagType == 'kurdistan'
          ? CustomPaint(size: Size(size, size), painter: KurdistanFlagPainter())
          : Container(
              color: AppColors.productBoxSurface,
              child: const Icon(Icons.flag, size: 18, color: AppColors.primaryOrange),
            ),
    );
  }
}
