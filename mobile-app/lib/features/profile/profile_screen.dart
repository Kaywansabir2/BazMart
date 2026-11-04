import 'package:flutter/material.dart';
import '../../core/state/auth_state.dart';
import '../../core/state/cart_state.dart';
import '../../core/localization/app_locale.dart';
import '../../core/localization/app_translations.dart';
import '../../core/theme/app_theme.dart';
import '../../core/network/api_client.dart';
import '../../core/models/product_model.dart';
import '../cart/cart_screen.dart';
import '../auth/auth_sheet.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoadingOrders = false;
  List<dynamic> _pastOrders = [];
  bool _isReordering = false;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    final phone = AuthState().phone;
    if (phone == null) return;

    setState(() => _isLoadingOrders = true);
    final res = await ApiClient().fetchCustomerOrders(phone);
    if (mounted) {
      setState(() {
        _isLoadingOrders = false;
        _pastOrders = res['orders'] ?? [];
      });
    }
  }

  Future<void> _handleReorder(Map<String, dynamic> order) async {
    final phone = AuthState().phone;
    if (phone == null) return;

    setState(() => _isReordering = true);
    final orderId = order['id'];
    final res = await ApiClient().reorderPastOrder(orderId, phone);

    setState(() => _isReordering = false);

    if (res['success'] == true && res['reorderItems'] != null) {
      final items = res['reorderItems'] as List<dynamic>;
      final cart = CartState();
      cart.clearCart();

      for (var item in items) {
        final prod = ProductModel(
          id: item['productId'] ?? '',
          externalErpId: item['externalErpId'] ?? '',
          name: item['titleEn'] ?? '',
          brand: 'Local',
          unit: '1 Piece',
          priceIqd: item['unitPriceIqd'] ?? 2250,
          stockQuantity: item['availableStock'] ?? 50,
          sku: item['externalErpId'] ?? '',
          barcode: '628000000000',
          category: 'Grocery',
          imageUrl: item['imageUrl'] ?? 'milk_alrahma',
        );

        final qty = item['quantityToAdd'] as int? ?? 1;
        for (int i = 0; i < qty; i++) {
          cart.addToCart(prod);
        }
      }

      if (mounted) {
        final lang = LocaleProvider().currentLanguage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppTranslations.get('reorder_success', lang)),
            backgroundColor: AppColors.primaryOrange,
            duration: const Duration(seconds: 2),
            action: SnackBarAction(
              label: AppTranslations.get('view_cart', lang),
              textColor: Colors.white,
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => CartScreen(
                      cartState: cart,
                      localeProvider: LocaleProvider(),
                    ),
                  ),
                );
              },
            ),
          ),
        );

        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => CartScreen(
              cartState: cart,
              localeProvider: LocaleProvider(),
            ),
          ),
        );
      }
    }
  }

  void _showEditNameDialog() {
    final auth = AuthState();
    final controller = TextEditingController(text: auth.name);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppTranslations.get('edit_name', LocaleProvider().currentLanguage)),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: 'Enter full name',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(AppTranslations.get('cancel', LocaleProvider().currentLanguage)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryOrange,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              if (controller.text.trim().isNotEmpty) {
                auth.updateName(controller.text.trim());
              }
              Navigator.of(ctx).pop();
            },
            child: Text(AppTranslations.get('save', LocaleProvider().currentLanguage)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = LocaleProvider().currentLanguage;
    final isRtl = LocaleProvider().isRtl;
    final auth = AuthState();

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: Colors.grey.shade50,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
          automaticallyImplyLeading: false,
          leading: Navigator.canPop(context)
              ? IconButton(
                  icon: Icon(
                    isRtl ? Icons.arrow_forward_ios_rounded : Icons.arrow_back_ios_new_rounded,
                    color: AppColors.textPrimary,
                    size: 20,
                  ),
                  onPressed: () => Navigator.of(context).pop(),
                )
              : null,
          title: Text(
            AppTranslations.get('my_account', lang),
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 18,
              color: AppColors.textPrimary,
            ),
          ),
          actions: [
            if (auth.isLoggedIn)
              IconButton(
                icon: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 22),
                tooltip: AppTranslations.get('logout', lang),
                onPressed: () {
                  auth.logout();
                  setState(() {});
                },
              ),
          ],
        ),
        body: !auth.isLoggedIn
            ? _buildGuestView(lang)
            : SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Profile Card
                    _buildProfileCard(auth, lang),
                    const SizedBox(height: 16),

                    // BazMart Wallet Balance Card
                    _buildWalletCard(auth, lang),
                    const SizedBox(height: 16),

                    // Language Selector
                    _buildLanguageSelector(lang),
                    const SizedBox(height: 16),

                    // Saved Addresses
                    _buildSavedAddressesSection(auth, lang),
                    const SizedBox(height: 20),

                    // Order History & 1-Tap Reorder
                    _buildOrderHistorySection(lang),
                    const SizedBox(height: 24),

                    // Support, Privacy & Delete Account
                    _buildSupportAndAccountActions(auth, lang),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildGuestView(String lang) {
    final isRtl = LocaleProvider().isRtl;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.primaryOrange.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.person_outline_rounded,
                    size: 40,
                    color: AppColors.primaryOrange,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  AppTranslations.get('guest_user', lang),
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  AppTranslations.get('dev_auth_hint', lang),
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600, height: 1.4),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryOrange,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    onPressed: () {
                      AuthSheet.show(context, onSuccess: () {
                        setState(() {});
                        _loadOrders();
                      });
                    },
                    child: Text(
                      AppTranslations.get('sign_in_or_register', lang),
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Quick 1-Tap Test Customer Login (Sulaymaniyah Flagship Hub)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF047857),
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    ),
                    icon: const Icon(Icons.flash_on_rounded, size: 18),
                    label: Text(
                      isRtl
                          ? 'چوونەژوورەوەی ١-کورتە: ئاکۆ محەمەد - سلێمانی (+9647701234567)'
                          : '1-Tap Login: Ako Muhamad - Sulaymaniyah (+9647701234567)',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                    ),
                    onPressed: () {
                      AuthState().login(
                        accessToken: 'vip-token-suly-1002',
                        customer: {
                          'id': 'c-1002',
                          'phone': '+9647701234567',
                          'name': 'ئاکۆ محەمەد (سلێمانی)',
                          'preferredLanguage': 'ckb',
                          'email': 'ako@suly.iq',
                          'isOnboarded': true,
                          'walletBalanceIqd': 15000,
                          'addresses': [
                            {
                              'id': 'addr-suly-1',
                              'title': 'ماڵەوە (Home)',
                              'city': 'Sulaymaniyah',
                              'neighborhood': 'بەختیاری - شەقامی سالم',
                              'street': 'Salim Main Street',
                              'building': 'Building 14, Floor 3',
                              'isDefault': true,
                            },
                          ],
                        },
                      );
                      setState(() {});
                      _loadOrders();
                    },
                  ),
                ),
                const SizedBox(height: 8),

                // Secondary Erbil VIP Login
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primaryOrange,
                      side: const BorderSide(color: AppColors.primaryOrange, width: 1.2),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 16),
                    ),
                    icon: const Icon(Icons.verified_user_rounded, size: 16),
                    label: Text(
                      isRtl
                          ? 'چوونەژوورەوەی تاقیکاری: ئەحمەد - هەولێر (+9647501234567)'
                          : 'Test VIP Login: Ahmad - Erbil (+9647501234567)',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                    ),
                    onPressed: () {
                      AuthState().login(
                        accessToken: 'vip-token-123',
                        customer: {
                          'id': 'c-1001',
                          'phone': '+9647501234567',
                          'name': 'Ahmad Erbil (VIP)',
                          'preferredLanguage': 'ckb',
                          'email': 'ahmad@erbil.iq',
                          'isOnboarded': true,
                          'walletBalanceIqd': 15000,
                          'addresses': [
                            {
                              'id': 'addr-1',
                              'title': 'ماڵەوە (Home)',
                              'city': 'Erbil',
                              'neighborhood': 'Empire World Tower 4',
                              'street': 'Gulan Street',
                              'building': 'Tower 4, Apt 802',
                              'isDefault': true,
                            },
                          ],
                        },
                      );
                      setState(() {});
                      _loadOrders();
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Feature Previews Card for Guests
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isRtl ? 'تایبەتمەندییە بەردەستەکانی هەژمار:' : 'Account Features Preview:',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 12),
                _buildGuestFeatureRow(
                  icon: Icons.account_balance_wallet_outlined,
                  color: const Color(0xFF10B981),
                  title: isRtl ? 'جزدانی نەختینەی بازمارت' : 'BazMart IQD Wallet',
                  subtitle: isRtl ? 'باڵانسی نەختینە بۆ کڕینی خێرا بێ چاوەڕوانی' : 'Instant store credit for 1-tap checkout',
                ),
                const Divider(height: 16),
                _buildGuestFeatureRow(
                  icon: Icons.history_rounded,
                  color: AppColors.primaryOrange,
                  title: isRtl ? 'دووبارەکردنەوەی داواکاری بە ١ کلیک' : '1-Tap Order Reorder',
                  subtitle: isRtl ? 'سەبەتەی پێشوو پڕبکەرەوە لە ١ چرکەدا' : 'Re-populate past basket instantly',
                ),
                const Divider(height: 16),
                _buildGuestFeatureRow(
                  icon: Icons.location_on_outlined,
                  color: Colors.blue,
                  title: isRtl ? 'ناونیشانە هەڵگیراوەکان' : 'Saved Addresses',
                  subtitle: isRtl ? 'گەیاندنی خێرا لە ١٥ خولەک بۆ هەولێر و سلێمانی' : 'Fast 15-min delivery to saved spots',
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Language Selector
          _buildLanguageSelector(lang),
          const SizedBox(height: 16),

          // Guest Help Center & App Info Card
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.support_agent_rounded, color: AppColors.primaryOrange),
                  title: Text(
                    AppTranslations.get('help_and_support', lang),
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                  trailing: Icon(
                    isRtl
                        ? Icons.arrow_back_ios_new_rounded
                        : Icons.arrow_forward_ios_rounded,
                    size: 18,
                  ),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isRtl ? 'ناوەندی هاوکاری بازمارت: ٢٤/٧ لە خزمەتتاندایە.' : 'Support Center: Available 24/7 for order issues and inquiries.'),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.info_outline_rounded, color: Colors.blueGrey),
                  title: Text(
                    isRtl ? 'وەشانی ئەپ' : 'App Version',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                  trailing: const Text(
                    'BazMart v16.0 Enterprise',
                    style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGuestFeatureRow({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
  }) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 20, color: color),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildProfileCard(AuthState auth, String lang) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primaryOrange, Color(0xFFFF8A00)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                auth.name.isNotEmpty ? auth.name.substring(0, 1).toUpperCase() : 'A',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        auth.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: _showEditNameDialog,
                      child: const Icon(Icons.edit_outlined, size: 16, color: Colors.grey),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Text('🇮🇶', style: TextStyle(fontSize: 14)),
                    const SizedBox(width: 4),
                    Text(
                      auth.phone ?? '',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.black54,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        LocaleProvider().isRtl ? 'پشتڕاستکراوە' : 'Verified',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: Colors.green,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLanguageSelector(String lang) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.language_rounded, size: 20, color: AppColors.primaryOrange),
              const SizedBox(width: 8),
              Text(
                AppTranslations.get('language', lang),
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              ),
            ],
          ),
          Row(
            children: [
              _buildLangChip('EN', 'en', lang),
              const SizedBox(width: 6),
              _buildLangChip('کوردی', 'ckb', lang),
              const SizedBox(width: 6),
              _buildLangChip('عربي', 'ar', lang),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLangChip(String label, String code, String currentLang) {
    final isSelected = currentLang == code;
    return InkWell(
      onTap: () {
        LocaleProvider().setLanguage(code);
        setState(() {});
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryOrange : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : Colors.black87,
          ),
        ),
      ),
    );
  }

  Widget _buildSavedAddressesSection(AuthState auth, String lang) {
    final addresses = auth.addresses;
    final isRtl = lang == 'ckb' || lang == 'ar';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, color: AppColors.primaryOrange, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    AppTranslations.get('saved_addresses', lang),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
              Text(
                AppTranslations.get('saved_addresses_count', lang, params: {'count': '${addresses.length}'}),
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (addresses.isEmpty)
            Text(
              isRtl ? 'هیچ ناونیشانێک پاشەکەوت نەکراوە' : 'No saved addresses',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            )
          else
            for (var addr in addresses)
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: addr.isDefault ? Colors.orange.shade50 : Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: addr.isDefault ? Colors.orange.shade200 : Colors.grey.shade200,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      addr.title == 'Home' ? Icons.home_rounded : Icons.business_rounded,
                      color: addr.isDefault ? AppColors.primaryOrange : Colors.grey.shade600,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                addr.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                ),
                              ),
                              if (addr.isDefault) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryOrange,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    AppTranslations.get('default_address', lang),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${addr.city} - ${addr.neighborhood}, ${addr.street} ${addr.landmark ?? ''}',
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey.shade700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (!addr.isDefault)
                      TextButton(
                        onPressed: () {
                          auth.setDefaultAddress(addr.id);
                        },
                        child: Text(
                          AppTranslations.get('set_as_default', lang),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryOrange,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
        ],
      ),
    );
  }

  Widget _buildOrderHistorySection(String lang) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.receipt_long_rounded, color: AppColors.primaryOrange, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    AppTranslations.get('order_history', lang),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
              if (_isLoadingOrders)
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryOrange),
                ),
            ],
          ),
          const SizedBox(height: 12),
          if (_pastOrders.isEmpty && !_isLoadingOrders)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                AppTranslations.get('no_past_orders', lang),
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
              ),
            )
          else
            for (var o in _pastOrders) ...[
              _buildOrderItemCard(o as Map<String, dynamic>, lang),
            ],
        ],
      ),
    );
  }

  Widget _buildOrderItemCard(Map<String, dynamic> order, String lang) {
    final orderNum = order['orderNumber'] ?? 'BM-XXXX';
    final totalIqd = order['totalIqd'] ?? 0;
    final status = order['orderStatus'] ?? 'DELIVERED';
    final items = (order['items'] as List<dynamic>? ?? []);

    final isRtl = LocaleProvider().isRtl;
    final statusText = isRtl ? (status == 'DELIVERED' ? 'گەیەندراوە' : status) : status;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '#$orderNum',
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  color: Colors.black87,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: status == 'DELIVERED'
                      ? Colors.green.shade50
                      : Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: status == 'DELIVERED'
                        ? Colors.green.shade700
                        : Colors.blue.shade700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            isRtl ? '${items.length} بەرهەم • $totalIqd دینار' : '${items.length} items • IQD ${totalIqd.toString()}',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 10),
          // Items preview
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: items.take(3).map((it) {
              final prod = it['product'] ?? {};
              final title = isRtl
                  ? (prod['titleCkb'] ?? prod['titleEn'] ?? 'کاڵا')
                  : (prod['titleEn'] ?? 'Item');
              final qty = it['quantity'] ?? 1;
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Text(
                  '$qty x $title',
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 10),
          // 1-Tap Reorder Button
          Align(
            alignment: Alignment.centerRight,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryOrange,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                elevation: 0,
              ),
              onPressed: _isReordering ? null : () => _handleReorder(order),
              icon: const Icon(Icons.replay_rounded, size: 14),
              label: Text(
                AppTranslations.get('reorder', lang),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWalletCard(AuthState auth, String lang) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.purple.shade900, const Color(0xFF4A0E4E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.purple.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    AppTranslations.get('bazmart_wallet', lang),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ],
              ),
              OutlinedButton(
                onPressed: () => _showWalletHistoryModal(auth, lang),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: BorderSide(color: Colors.white.withOpacity(0.4)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text(
                  AppTranslations.get('view_history', lang),
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            AppTranslations.get('available_balance', lang),
            style: TextStyle(fontSize: 11, color: Colors.purple.shade100, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            LocaleProvider().isRtl ? '${auth.walletBalanceIqd} دینار' : 'IQD ${auth.walletBalanceIqd}',
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5),
          ),
        ],
      ),
    );
  }

  void _showWalletHistoryModal(AuthState auth, String lang) async {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return FutureBuilder<Map<String, dynamic>>(
          future: ApiClient().fetchWallet(phone: auth.phone ?? '+9647701234567'),
          builder: (context, snapshot) {
            final transactions = snapshot.data?['transactions'] as List<dynamic>? ?? [];
            return Container(
              padding: const EdgeInsets.all(20),
              constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.7),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.history_rounded, color: AppColors.primaryOrange),
                          const SizedBox(width: 8),
                          Text(
                            AppTranslations.get('wallet_history', lang),
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (snapshot.connectionState == ConnectionState.waiting)
                    const Center(child: Padding(padding: EdgeInsets.all(30), child: CircularProgressIndicator()))
                  else if (transactions.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(30),
                        child: Text(
                          'No wallet transactions yet.',
                          style: TextStyle(color: Colors.grey.shade500),
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: ListView.separated(
                        itemCount: transactions.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, idx) {
                          final tx = transactions[idx];
                          final isCredit = tx['direction'] == 'CREDIT';
                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(vertical: 6),
                            leading: CircleAvatar(
                              backgroundColor: isCredit ? Colors.green.shade50 : Colors.red.shade50,
                              child: Icon(
                                isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                                color: isCredit ? Colors.green : Colors.red,
                                size: 18,
                              ),
                            ),
                            title: Text(
                              LocaleProvider().isRtl
                                  ? (tx['descriptionCkb'] ?? tx['descriptionEn'] ?? 'جووڵەی دارایی')
                                  : (tx['descriptionEn'] ?? tx['type'] ?? 'Transaction'),
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                            ),
                            subtitle: Text(
                              tx['transactionNumber'] ?? '',
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontFamily: 'monospace'),
                            ),
                            trailing: Text(
                              LocaleProvider().isRtl
                                  ? '${isCredit ? '+' : '-'} ${tx['amountIqd']} دینار'
                                  : '${isCredit ? '+' : '-'} IQD ${tx['amountIqd']}',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: isCredit ? Colors.green.shade700 : Colors.red.shade700,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSupportAndAccountActions(AuthState auth, String lang) {
    final isRtl = lang == 'ckb' || lang == 'ar';
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          ListTile(
            leading: const Icon(Icons.favorite_rounded, color: Colors.redAccent),
            title: Text(
              AppTranslations.get('my_favorites', lang),
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
            ),
            trailing: Text(
              AppTranslations.get('items_count', lang, params: {'count': '${auth.favoriteProductIds.length}'}),
              style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontWeight: FontWeight.w600),
            ),
            onTap: () {
              final favCount = auth.favoriteProductIds.length;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isRtl
                        ? (lang == 'ckb' ? '$favCount کاڵای دڵخوازت پاشەکەوت کردووە ❤️' : 'لديك $favCount منتجات مفضلة محفوظة ❤️')
                        : 'You have $favCount favorite products saved ❤️',
                  ),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.support_agent_rounded, color: AppColors.primaryOrange),
            title: Text(
              AppTranslations.get('help_and_support', lang),
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
            ),
            trailing: Icon(
              isRtl
                  ? Icons.arrow_back_ios_new_rounded
                  : Icons.arrow_forward_ios_rounded,
              size: 18,
            ),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    isRtl
                        ? (lang == 'ckb' ? 'ناوەندی هاوکاری بازمارت: ٢٤/٧ لە خزمەتتاندایە بۆ کێشەی داواکاری و وۆڵێت.' : 'مركز المساعدة والدعم: متاح على مدار الساعة للمشكلات واسترجاع المبالغ.')
                        : 'Support Center: Available 24/7 for order issues and wallet refunds.',
                  ),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.delete_forever_rounded, color: Colors.red),
            title: Text(
              AppTranslations.get('delete_account', lang),
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.red),
            ),
            onTap: () => _showDeleteAccountDialog(auth, lang),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(AuthState auth, String lang) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          AppTranslations.get('delete_account_confirm', lang),
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.red),
        ),
        content: Text(
          AppTranslations.get('delete_account_warning', lang),
          style: const TextStyle(fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(AppTranslations.get('cancel', lang)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              final phone = auth.phone;
              if (phone != null) {
                await ApiClient().deleteAccount(phone: phone);
              }
              auth.logout();
              if (mounted) {
                Navigator.of(context).pop();
              }
            },
            child: Text(AppTranslations.get('delete_account', lang)),
          ),
        ],
      ),
    );
  }
}
