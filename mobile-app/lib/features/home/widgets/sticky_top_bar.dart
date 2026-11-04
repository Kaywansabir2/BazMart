import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/localization/app_locale.dart';
import '../../../core/state/auth_state.dart';
import '../../../core/state/cart_state.dart';
import '../../barcode/barcode_scanner_parity_modal.dart';

class StickyTopBar extends StatelessWidget {
  final LocaleProvider localeProvider;
  final bool showBackButton;
  final VoidCallback? onBackTap;
  final VoidCallback? onSearchTap;
  final VoidCallback? onProfileTap;
  final VoidCallback? onNotificationsTap;
  final VoidCallback? onBarcodeTap;
  final int unreadNotificationsCount;

  const StickyTopBar({
    super.key,
    required this.localeProvider,
    this.showBackButton = false,
    this.onBackTap,
    this.onSearchTap,
    this.onProfileTap,
    this.onNotificationsTap,
    this.onBarcodeTap,
    this.unreadNotificationsCount = 2,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = localeProvider.isRtl;
    final auth = AuthState();

    return Container(
      color: AppColors.scaffoldBackground,
      padding: const EdgeInsets.only(left: 16, right: 16, top: 10, bottom: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Utility bar with location and language switcher
          Row(
            children: [
              // Sleek Interactive Delivery Location Pill
              Flexible(
                child: GestureDetector(
                  onTap: () => _showAddressSelectorSheet(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.productBoxSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.dividerColor),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_on, size: 14, color: AppColors.primaryOrange),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            auth.selectedAddress != null
                                ? (isRtl
                                    ? 'گەیاندن بۆ: ${auth.selectedAddress!.city} - ${auth.selectedAddress!.neighborhood} (١٥-٢٠ خولەک ⚡)'
                                    : 'Delivering to: ${auth.selectedAddress!.city} - ${auth.selectedAddress!.neighborhood} (15-20 mins ⚡)')
                                : (isRtl
                                    ? 'گەیاندن بۆ: سلێمانی - سەرچنار / ڕاپەڕین (١٥-٢٠ خولەک ⚡)'
                                    : 'Delivering to: Sulaymaniyah - Sarchinar (15-20 mins ⚡)'),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.keyboard_arrow_down, size: 14, color: AppColors.primaryOrange),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Language Switcher Pill: EN | کوردی | عربي
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.searchFieldBackground,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.dividerColor),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildLangButton('EN', 'en'),
                    const Text('|', style: TextStyle(color: AppColors.dividerColor, fontSize: 11)),
                    _buildLangButton('کوردی', 'ckb'),
                    const Text('|', style: TextStyle(color: AppColors.dividerColor, fontSize: 11)),
                    _buildLangButton('عربي', 'ar'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Main navigation and search row
          Row(
            children: [
              // Circular Back Button (only shown if showBackButton is true)
              if (showBackButton) ...[
                InkWell(
                  onTap: onBackTap ?? () {},
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE0E0E0), width: 1.2),
                      color: Colors.white,
                    ),
                    child: Center(
                      child: Icon(
                        isRtl
                            ? Icons.arrow_forward_ios_rounded
                            : Icons.arrow_back_ios_new_rounded,
                        color: AppColors.textPrimary,
                        size: 22,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              // Pill-shaped search bar (#F3F4F6 background)
              Expanded(
                child: InkWell(
                  onTap: onSearchTap,
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.searchFieldBackground,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFECEFF1), width: 1),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Row(
                      children: [
                        const Icon(Icons.search, color: AppColors.textMuted, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            localeProvider.translate('search_bazmart'),
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 14,
                              fontWeight: FontWeight.w400,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        // Barcode Scanner & Price Parity Verifier Button
                        InkWell(
                          key: const ValueKey('barcode_scanner_header_btn'),
                          onTap: onBarcodeTap ?? () {
                            BarcodeScannerParityModal.show(
                              context,
                              cartState: CartState(),
                              localeProvider: localeProvider,
                            );
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFCBD5E1)),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.qr_code_scanner_rounded, size: 16, color: AppColors.primaryOrange),
                                SizedBox(width: 4),
                                Text(
                                  'POS',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.primaryOrange,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Circular Notifications Bell Button (40x40px) with Unread Badge
              InkWell(
                key: const ValueKey('notifications_header_btn'),
                onTap: onNotificationsTap,
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFE0E0E0), width: 1.2),
                    color: Colors.white,
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      const Icon(
                        Icons.notifications_none_rounded,
                        color: AppColors.textPrimary,
                        size: 22,
                      ),
                      if (unreadNotificationsCount > 0)
                        Positioned(
                          top: 6,
                          right: 6,
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(
                              color: AppColors.primaryOrange,
                              shape: BoxShape.circle,
                            ),
                            constraints: const BoxConstraints(minWidth: 15, minHeight: 15),
                            child: Center(
                              child: Text(
                                unreadNotificationsCount > 9 ? '9+' : '$unreadNotificationsCount',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Circular Profile / Sign In Button (40x40px)
              InkWell(
                key: const ValueKey('profile_header_btn'),
                onTap: onProfileTap,
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: auth.isLoggedIn ? AppColors.primaryOrange : const Color(0xFFE0E0E0),
                      width: 1.2,
                    ),
                    color: auth.isLoggedIn ? AppColors.primaryOrange.withOpacity(0.08) : Colors.white,
                  ),
                  child: Center(
                    child: Icon(
                      auth.isLoggedIn ? Icons.person_rounded : Icons.person_outline_rounded,
                      color: auth.isLoggedIn ? AppColors.primaryOrange : AppColors.textPrimary,
                      size: 22,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLangButton(String label, String code) {
    final isSelected = localeProvider.currentLanguage == code;
    return InkWell(
      onTap: () => localeProvider.setLanguage(code),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryOrange : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  void _showAddressSelectorSheet(BuildContext context) {
    final auth = AuthState();
    final isRtl = localeProvider.isRtl;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Directionality(
        textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isRtl ? 'هەڵبژاردنی ناونیشان و دارک ستۆر' : 'Choose Delivery Location & Dark Store',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _buildLocationItem(
                ctx,
                title: isRtl ? (localeProvider.isKurdish ? 'ماڵەوە - سلێمانی' : 'المنزل - السليمانية') : 'Home - Sulaymaniyah',
                address: isRtl ? (localeProvider.isKurdish ? 'بەختیاری، شەقامی ١٤' : 'بختياري، شارع ١٤') : 'Bakhtiari, Street 14',
                city: 'Sulaymaniyah',
                darkStore: isRtl ? (localeProvider.isKurdish ? 'کۆگای سەرەکیی سلێمانی • ١٥-٢٠ خولەک ⚡' : 'المتجر المظلم الرئيسي السليمانية • ١٥-٢٠ دقيقة ⚡') : 'Sulaymaniyah Main Dark Store • 15-20 mins',
                isActive: auth.selectedAddress?.city == 'Sulaymaniyah' || auth.selectedAddress?.city == 'سلێمانی',
                onSelect: () {
                  auth.setAddresses([
                    CustomerAddressModel(
                      id: 'addr-suly-1',
                      title: isRtl ? (localeProvider.isKurdish ? 'ماڵەوە' : 'المنزل') : 'Home',
                      city: isRtl ? (localeProvider.isKurdish ? 'سلێمانی' : 'السليمانية') : 'Sulaymaniyah',
                      neighborhood: isRtl ? (localeProvider.isKurdish ? 'بەختیاری' : 'بختياري') : 'Bakhtiari',
                      street: isRtl ? 'شەقامی ١٤' : 'Street 14',
                      building: isRtl ? 'باڵەخانەی ٥' : 'Building 5',
                      latitude: 35.5669,
                      longitude: 45.4167,
                      isDefault: true,
                    ),
                  ]);
                  Navigator.pop(ctx);
                },
              ),
              const SizedBox(height: 10),
              _buildLocationItem(
                ctx,
                title: isRtl ? (localeProvider.isKurdish ? 'ماڵەوە - هەولێر' : 'المنزل - أربيل') : 'Home - Erbil',
                address: isRtl ? (localeProvider.isKurdish ? 'دریم ستی، ڤێلا ٤٢' : 'دريم سيتي، فيلا ٤٢') : 'Dream City, Villa 42',
                city: 'Erbil',
                darkStore: isRtl ? (localeProvider.isKurdish ? 'کۆگای ناوەندیی هەولێر • ١٥-٢٠ خولەک ⚡' : 'المتجر المظلم المركزي أربيل • ١٥-٢٠ دقيقة ⚡') : 'Erbil Central Dark Store • 15-20 mins',
                isActive: auth.selectedAddress?.city == 'Erbil' || auth.selectedAddress?.city == 'هەولێر' || auth.selectedAddress == null,
                onSelect: () {
                  auth.setAddresses([
                    CustomerAddressModel(
                      id: 'default-erbil',
                      title: isRtl ? (localeProvider.isKurdish ? 'ماڵەوە' : 'المنزل') : 'Home',
                      city: isRtl ? (localeProvider.isKurdish ? 'هەولێر' : 'أربيل') : 'Erbil',
                      neighborhood: isRtl ? (localeProvider.isKurdish ? 'دریم ستی' : 'دريم سيتي') : 'Dream City',
                      street: isRtl ? 'کۆڵانی ١٠' : 'Street 10',
                      building: isRtl ? 'ڤێلا ٤٢' : 'Villa 42',
                      latitude: 36.1901,
                      longitude: 44.0091,
                      isDefault: true,
                    ),
                  ]);
                  Navigator.pop(ctx);
                },
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  key: const ValueKey('add_new_address_btn'),
                  onPressed: () {
                    Navigator.pop(ctx);
                    showAddAddressSheet(context, localeProvider);
                  },
                  icon: const Icon(Icons.add_location_alt_outlined, color: AppColors.primaryOrange),
                  label: Text(
                    isRtl ? '+ زیادکردنی ناونیشانی نوێ' : '+ Add New Address',
                    style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primaryOrange),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.primaryOrange, width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  static void showAddressSelector(BuildContext context, LocaleProvider localeProvider) {
    final bar = StickyTopBar(localeProvider: localeProvider);
    bar._showAddressSelectorSheet(context);
  }

  static void showAddAddressSheet(BuildContext context, LocaleProvider localeProvider) {
    final isRtl = localeProvider.isRtl;
    final cityCtrl = TextEditingController(text: isRtl ? 'سلێمانی' : 'Sulaymaniyah');
    final neighCtrl = TextEditingController(text: isRtl ? 'بەختیاری' : 'Bakhtiari');
    final streetCtrl = TextEditingController(text: isRtl ? 'شەقامی سەرەکی، کۆڵانی ١٤' : 'Main St, Lane 14');
    final bldgCtrl = TextEditingController(text: isRtl ? 'باڵەخانەی ٨' : 'Building 8');
    final landmarkCtrl = TextEditingController(text: isRtl ? 'نزیک نەخۆشخانەی شۆڕش' : 'Near Shorsh Hospital');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Directionality(
        textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
        child: Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isRtl ? 'زیادکردنی ناونیشانی نوێ' : 'Add New Address',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: cityCtrl,
                  decoration: InputDecoration(
                    labelText: isRtl ? 'شار' : 'City',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.location_city, color: AppColors.primaryOrange),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: neighCtrl,
                  decoration: InputDecoration(
                    labelText: isRtl ? 'گەڕەک / تاخ' : 'Neighborhood',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.map, color: AppColors.primaryOrange),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: streetCtrl,
                  decoration: InputDecoration(
                    labelText: isRtl ? 'شەقام / کۆڵان' : 'Street',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.signpost, color: AppColors.primaryOrange),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: bldgCtrl,
                  decoration: InputDecoration(
                    labelText: isRtl ? 'باڵەخانە / خانوو' : 'Building / Villa',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.apartment, color: AppColors.primaryOrange),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: landmarkCtrl,
                  decoration: InputDecoration(
                    labelText: isRtl ? 'شوێنی دیار (نزیک چییە؟)' : 'Landmark',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.pin_drop, color: AppColors.primaryOrange),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryOrange,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () {
                      final auth = AuthState();
                      final newAddr = CustomerAddressModel(
                        id: 'addr-${DateTime.now().millisecondsSinceEpoch}',
                        title: isRtl ? 'ناونیشانی نوێ' : 'New Address',
                        city: cityCtrl.text.trim(),
                        neighborhood: neighCtrl.text.trim(),
                        street: streetCtrl.text.trim(),
                        building: bldgCtrl.text.trim(),
                        landmark: landmarkCtrl.text.trim(),
                        latitude: 35.5669,
                        longitude: 45.4167,
                        isDefault: true,
                      );
                      auth.setAddresses([newAddr, ...auth.addresses]);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(isRtl ? '✓ ناونیشانی نوێ بە سەرکەوتوویی پاشەکەوت کرا' : '✓ New address saved successfully'),
                          backgroundColor: const Color(0xFF10B981),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                    child: Text(
                      isRtl ? 'پاشەکەوتکردنی ناونیشان' : 'Save Address',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLocationItem(
    BuildContext context, {
    required String title,
    required String address,
    required String city,
    required String darkStore,
    required bool isActive,
    required VoidCallback onSelect,
  }) {
    return InkWell(
      onTap: onSelect,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primaryOrangeLight.withOpacity(0.35) : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isActive ? AppColors.primaryOrange : Colors.grey.shade200,
            width: isActive ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: isActive ? AppColors.primaryOrange : Colors.grey.shade200,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.location_on,
                color: isActive ? Colors.white : Colors.grey.shade600,
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                      ),
                      if (isActive) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: AppColors.primaryOrange,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'ACTIVE',
                            style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    address,
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                  ),
                  Text(
                    '⚡ $darkStore',
                    style: const TextStyle(fontSize: 10, color: AppColors.primaryOrangeDark, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            if (isActive)
              const Icon(Icons.check_circle, color: AppColors.primaryOrange, size: 20),
          ],
        ),
      ),
    );
  }
}
