import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/localization/app_translations.dart';
import '../../core/state/cart_state.dart';
import '../../core/network/api_client.dart';
import '../order_tracking/order_tracking_screen.dart';
import '../cart/widgets/coupon_voucher_card.dart';
import '../../core/state/auth_state.dart';
import '../../core/utils/linguistic_normalizer.dart';

class CheckoutScreen extends StatefulWidget {
  final CartState cartState;
  final LocaleProvider localeProvider;
  final bool openGpsModalOnInit;
  final bool initialOutOfZone;

  const CheckoutScreen({
    super.key,
    required this.cartState,
    required this.localeProvider,
    this.openGpsModalOnInit = false,
    this.initialOutOfZone = false,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _selectedCity = 'Erbil';
  String _selectedNeighborhood = 'Dream City';
  final String _selectedStreet = 'Street 10';
  final String _buildingDetails = 'Villa 42';
  String _selectedInstruction = 'Call upon arrival';
  final String _selectedPaymentMethod = 'COD';
  bool _isSubmitting = false;
  late bool _isOutOfZone;
  String _unavailableItemPreference = 'REPLACE_WITH_BEST_MATCH';
  int _riderTipIqd = 0;
  bool _leaveAtDoor = false;
  bool _doNotRingBell = false;
  bool _useWallet = false;

  @override
  void initState() {
    super.initState();
    final auth = AuthState();
    if (auth.selectedAddress != null) {
      _selectedCity = auth.selectedAddress!.city;
      _selectedNeighborhood = auth.selectedAddress!.neighborhood;
    }
    _isOutOfZone = widget.initialOutOfZone;
    if (_isOutOfZone) {
      _selectedCity = 'Out of Zone';
      _selectedNeighborhood = 'Mount Halgurd';
    }
    if (widget.openGpsModalOnInit) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showAddressMapModal();
      });
    }
  }

  void _showAddressMapModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        String tempCity = _selectedCity;
        String tempNeigh = _selectedNeighborhood;

        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        widget.localeProvider.translate('delivery_address'),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Simulated GPS Map Pin Selector Box
                  Container(
                    height: 150,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.primaryOrange.withOpacity(0.4)),
                    ),
                    child: Stack(
                      children: [
                        Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.location_on, color: AppColors.primaryOrange, size: 44),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                                ),
                                child: Text(
                                  '$tempCity - $tempNeigh',
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Positioned(
                          top: 8,
                          right: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black54,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'GPS Pinpoint Active',
                              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // City selector chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        ChoiceChip(
                          label: const Text('Erbil (هەولێر)'),
                          selected: tempCity == 'Erbil',
                          onSelected: (s) {
                            if (s) {
                              setModalState(() {
                                tempCity = 'Erbil';
                                tempNeigh = 'Dream City';
                              });
                            }
                          },
                          selectedColor: AppColors.primaryOrangeLight,
                        ),
                        const SizedBox(width: 8),
                        ChoiceChip(
                          label: const Text('Sulaymaniyah (سلێمانی)'),
                          selected: tempCity == 'Sulaymaniyah',
                          onSelected: (s) {
                            if (s) {
                              setModalState(() {
                                tempCity = 'Sulaymaniyah';
                                tempNeigh = 'Bakhtiari';
                              });
                            }
                          },
                          selectedColor: AppColors.primaryOrangeLight,
                        ),
                        const SizedBox(width: 8),
                        ChoiceChip(
                          label: const Text('Out of Zone (دەرەوەی بازنە)'),
                          selected: tempCity == 'Out of Zone',
                          onSelected: (s) {
                            if (s) {
                              setModalState(() {
                                tempCity = 'Out of Zone';
                                tempNeigh = 'Mount Halgurd';
                              });
                            }
                          },
                          selectedColor: const Color(0xFFFFCDD2),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _selectedCity = tempCity;
                          _selectedNeighborhood = tempNeigh;
                          _isOutOfZone = (tempCity == 'Out of Zone');
                        });
                        Navigator.pop(ctx);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryOrange,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      ),
                      child: Text(
                        widget.localeProvider.translate('confirm_location'),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                      ),
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

  Future<void> _handlePlaceOrder() async {
    setState(() => _isSubmitting = true);

    final cartItemsPayload = widget.cartState.itemList.map((i) {
      return {
        'productId': i.product.id,
        'quantity': i.quantity,
      };
    }).toList();

    final appliedCode = widget.cartState.appliedCouponCode;
    final finalOrderTotal = widget.cartState.finalTotalIqd;
    final auth = AuthState();
    final cName = auth.isLoggedIn ? auth.name : 'Rebwar Salih';
    final cPhone = auth.isLoggedIn ? (auth.phone ?? '+964 750 123 4567') : '+964 750 123 4567';

    final orderResult = await ApiClient().submitOrder(
      customerName: cName,
      customerPhone: cPhone,
      address: {
        'city': _selectedCity,
        'neighborhood': _selectedNeighborhood,
        'street': _selectedStreet,
        'building': _buildingDetails,
        'deliveryInstructions': _selectedInstruction,
      },
      items: cartItemsPayload,
      paymentMethod: _selectedPaymentMethod,
      couponCode: appliedCode,
      unavailableItemPreference: _unavailableItemPreference,
      riderTipIqd: _riderTipIqd,
      deliveryDropoffOptions: {
        'leaveAtDoor': _leaveAtDoor,
        'doNotRingBell': _doNotRingBell,
      },
      useWallet: _useWallet,
    );

    if (auth.isLoggedIn) {
      auth.incrementOrderCount();
    }

    setState(() => _isSubmitting = false);

    final orderData = orderResult['order'] ?? {};
    final orderNumber = orderData['orderNumber'] ?? 'BM-10042';

    // Clear cart after confirmed submission and store active order
    widget.cartState.clearCart();
    widget.cartState.setActiveOrder(
      orderNumber: orderNumber,
      status: 'PLACED',
      totalIqd: finalOrderTotal > 0 ? finalOrderTotal : 9000,
    );

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => OrderTrackingScreen(
            orderNumber: orderNumber,
            orderId: orderData['id'] ?? orderNumber,
            totalIqd: finalOrderTotal > 0 ? finalOrderTotal : 9000,
            deliveryAddress: '$_selectedCity - $_selectedNeighborhood, $_buildingDetails',
            driverName: orderData['assignedDriverName'] ?? 'Karwan Ahmed',
            driverPhone: orderData['assignedDriverPhone'] ?? '+964 750 491 8822',
            estimatedMinutes: orderData['estimatedDeliveryMinutes'] ?? '15 - 20 mins',
            localeProvider: widget.localeProvider,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = widget.localeProvider.isRtl;
    final totalIqd = widget.cartState.totalAmountIqd;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: Container(
          color: Colors.white,
          padding: const EdgeInsets.only(left: 16, right: 16, top: 10, bottom: 8),
          child: SafeArea(
            bottom: false,
            child: Row(
              children: [
                InkWell(
                  onTap: () => Navigator.pop(context),
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE0E0E0), width: 1.2),
                      color: Colors.white,
                    ),
                    child: Center(
                      child: Icon(
                        isRtl ? Icons.chevron_right : Icons.chevron_left,
                        color: AppColors.textPrimary,
                        size: 22,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  widget.localeProvider.translate('checkout'),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),

      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1. Delivery Address Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.dividerColor),
              boxShadow: const [BoxShadow(color: Color(0x08000000), blurRadius: 6, offset: Offset(0, 2))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: AppColors.primaryOrange, size: 20),
                        const SizedBox(width: 6),
                        Text(
                          widget.localeProvider.translate('delivery_address'),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: _showAddressMapModal,
                      child: Text(
                        'Change GPS',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryOrange),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  '$_selectedCity - $_selectedNeighborhood',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 4),
                Text(
                  '$_selectedStreet, $_buildingDetails',
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 12),

                // Delivery instructions pill selector
                Row(
                  children: [
                    _buildInstructionChip('Call upon arrival', Icons.phone),
                    const SizedBox(width: 8),
                    _buildInstructionChip('Leave at door', Icons.door_front_door_outlined),
                  ],
                ),
              ],
            ),
          ),

          if (_isOutOfZone)
            Container(
              margin: const EdgeInsets.only(top: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFEBEE),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFEF5350), width: 1.5),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_off_rounded, color: Color(0xFFC62828), size: 24),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isRtl ? 'دەرەوەی بازنەی گەیاندنی خێرا' : 'Outside Rapid Delivery Zone',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFFC62828)),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          isRtl
                              ? 'گەیاندنی خێرای ١٥ خولەک تەنها لە هەولێر، سلێمانی، دهۆک و بەغدا بەردەستە. تکایە ناونیشانێکی ناو بازنەکە هەڵبژێرە.'
                              : '15-minute rapid delivery is currently limited to active Dark Store zones (Erbil, Sulaymaniyah, Duhok, Baghdad). Please select a valid address.',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF424242)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 14),

          // 2. Delivery Time Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.primaryOrangeLight.withOpacity(0.35),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primaryOrange.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.bolt, color: AppColors.primaryOrange, size: 22),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.localeProvider.translate('standard_delivery'),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                    Text(
                      '${widget.localeProvider.translate('delivery_time_15_20')} • Erbil Central Dark Store',
                      style: const TextStyle(fontSize: 11, color: AppColors.primaryOrangeDark, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 2.5 Talabat Item Replacement Preference Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.dividerColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.swap_horiz_rounded, color: AppColors.primaryOrange, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      AppTranslations.get('unavailable_item_pref', widget.localeProvider.currentLanguage),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'If an item runs out while packing in dark store:',
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ChoiceChip(
                      label: Text(AppTranslations.get('replace_with_match', widget.localeProvider.currentLanguage)),
                      selected: _unavailableItemPreference == 'REPLACE_WITH_BEST_MATCH',
                      onSelected: (val) {
                        if (val) setState(() => _unavailableItemPreference = 'REPLACE_WITH_BEST_MATCH');
                      },
                      selectedColor: AppColors.primaryOrange.withOpacity(0.2),
                      labelStyle: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: _unavailableItemPreference == 'REPLACE_WITH_BEST_MATCH' ? AppColors.primaryOrangeDark : Colors.black87,
                      ),
                    ),
                    ChoiceChip(
                      label: Text(AppTranslations.get('call_me', widget.localeProvider.currentLanguage)),
                      selected: _unavailableItemPreference == 'CALL_ME',
                      onSelected: (val) {
                        if (val) setState(() => _unavailableItemPreference = 'CALL_ME');
                      },
                      selectedColor: AppColors.primaryOrange.withOpacity(0.2),
                      labelStyle: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: _unavailableItemPreference == 'CALL_ME' ? AppColors.primaryOrangeDark : Colors.black87,
                      ),
                    ),
                    ChoiceChip(
                      label: Text(AppTranslations.get('remove_and_refund', widget.localeProvider.currentLanguage)),
                      selected: _unavailableItemPreference == 'REMOVE_AND_REFUND_ITEM',
                      onSelected: (val) {
                        if (val) setState(() => _unavailableItemPreference = 'REMOVE_AND_REFUND_ITEM');
                      },
                      selectedColor: AppColors.primaryOrange.withOpacity(0.2),
                      labelStyle: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: _unavailableItemPreference == 'REMOVE_AND_REFUND_ITEM' ? AppColors.primaryOrangeDark : Colors.black87,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 2.6 Delivery Drop-Off Rules Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.dividerColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.door_front_door_outlined, color: AppColors.primaryOrange, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      AppTranslations.get('delivery_instructions', widget.localeProvider.currentLanguage),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  title: Text(
                    AppTranslations.get('leave_at_door', widget.localeProvider.currentLanguage),
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  value: _leaveAtDoor,
                  activeColor: AppColors.primaryOrange,
                  onChanged: (val) => setState(() => _leaveAtDoor = val ?? false),
                ),
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  title: Text(
                    AppTranslations.get('do_not_ring_bell', widget.localeProvider.currentLanguage),
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  value: _doNotRingBell,
                  activeColor: AppColors.primaryOrange,
                  onChanged: (val) => setState(() => _doNotRingBell = val ?? false),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 2.7 Rider Tip Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.dividerColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.two_wheeler_rounded, color: AppColors.primaryOrange, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          AppTranslations.get('rider_tip', widget.localeProvider.currentLanguage),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        '100% to Rider',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF059669)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    ChoiceChip(
                      label: Text(AppTranslations.get('tip_none', widget.localeProvider.currentLanguage)),
                      selected: _riderTipIqd == 0,
                      onSelected: (val) {
                        if (val) setState(() => _riderTipIqd = 0);
                      },
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      label: Text(LinguisticNormalizer.formatIqd(500, widget.localeProvider.currentLanguage)),
                      selected: _riderTipIqd == 500,
                      onSelected: (val) {
                        if (val) setState(() => _riderTipIqd = 500);
                      },
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      label: Text(LinguisticNormalizer.formatIqd(1000, widget.localeProvider.currentLanguage)),
                      selected: _riderTipIqd == 1000,
                      onSelected: (val) {
                        if (val) setState(() => _riderTipIqd = 1000);
                      },
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      label: Text(LinguisticNormalizer.formatIqd(2000, widget.localeProvider.currentLanguage)),
                      selected: _riderTipIqd == 2000,
                      onSelected: (val) {
                        if (val) setState(() => _riderTipIqd = 2000);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 2.8 BazMart Wallet Balance Switch Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.purple.shade900, const Color(0xFF3B0764)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.purple.withOpacity(0.25), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppTranslations.get('bazmart_wallet', widget.localeProvider.currentLanguage),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                      Text(
                        '${AppTranslations.get('available_balance', widget.localeProvider.currentLanguage)}: ${LinguisticNormalizer.formatIqd(AuthState().walletBalanceIqd, widget.localeProvider.currentLanguage)}',
                        style: TextStyle(fontSize: 11, color: Colors.purple.shade100, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _useWallet,
                  activeColor: AppColors.primaryOrange,
                  onChanged: (val) => setState(() => _useWallet = val),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 3. Payment Method Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.dividerColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.localeProvider.translate('payment_method'),
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 10),

                // COD (Default Active)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primaryOrangeLight.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primaryOrange, width: 1.5),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.payments_outlined, color: AppColors.primaryOrange, size: 22),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.localeProvider.translate('cod'),
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                            ),
                            Text(
                              widget.localeProvider.translate('cod_subtitle'),
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.check_circle, color: AppColors.primaryOrange, size: 20),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // Pluggable Gateways (FastPay, ZainCash, FIB)
                _buildGatewayPill('FastPay Wallet', Icons.account_balance_wallet_outlined),
                const SizedBox(height: 6),
                _buildGatewayPill('ZainCash', Icons.phone_android_outlined),
                const SizedBox(height: 6),
                _buildGatewayPill('First Iraqi Bank (FIB)', Icons.account_balance_outlined),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 3.5 Promotional Voucher & Promo Code Card
          CouponVoucherCard(
            cartState: widget.cartState,
            localeProvider: widget.localeProvider,
            onCouponChanged: () => setState(() {}),
          ),
          const SizedBox(height: 14),

          // 4. Order Summary Breakdown
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.dividerColor),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.localeProvider.translate('order_summary'),
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 12),

                _buildSummaryRow(
                  widget.localeProvider.translate('subtotal'),
                  LinguisticNormalizer.formatIqd(totalIqd, widget.localeProvider.currentLanguage),
                ),
                
                // Applied Promo Code Discount (Green highlighted)
                if (widget.cartState.appliedCouponCode != null) ...[
                  const SizedBox(height: 8),
                  _buildSummaryRow(
                    '🎟️ ${widget.cartState.appliedCouponCode}',
                    '- ${LinguisticNormalizer.formatIqd(widget.cartState.couponDiscountIqd, widget.localeProvider.currentLanguage)}',
                    isSavings: true,
                  ),
                ],

                const SizedBox(height: 8),
                _buildSummaryRow(
                  widget.localeProvider.translate('delivery_fee'),
                  widget.localeProvider.translate('free'),
                  isFree: true,
                ),

                if (_riderTipIqd > 0) ...[
                  const SizedBox(height: 8),
                  _buildSummaryRow(
                    isRtl ? '🛵 بەخشیشی شۆفێر (١٠٠٪ بۆ کاپتن)' : '🛵 Rider Tip (100% to Driver)',
                    '+ ${LinguisticNormalizer.formatIqd(_riderTipIqd, widget.localeProvider.currentLanguage)}',
                  ),
                ],

                if (_useWallet) ...[
                  const SizedBox(height: 8),
                  _buildSummaryRow(
                    isRtl ? '🟣 جزدانی بازمارت' : '🟣 BazMart Wallet Credit',
                    '- ${LinguisticNormalizer.formatIqd(AuthState().walletBalanceIqd > (widget.cartState.finalTotalIqd + _riderTipIqd) ? (widget.cartState.finalTotalIqd + _riderTipIqd) : AuthState().walletBalanceIqd, widget.localeProvider.currentLanguage)}',
                    isSavings: true,
                  ),
                ],

                const Divider(height: 24, color: AppColors.dividerColor),
                _buildSummaryRow(
                  _useWallet && (AuthState().walletBalanceIqd >= (widget.cartState.finalTotalIqd + _riderTipIqd))
                      ? (isRtl ? 'کۆی گشتی (دراوە لە وۆڵێت)' : 'Total (Paid via Wallet)')
                      : (isRtl ? 'کۆی پێویست بۆ شۆفێر (کاش)' : 'Cash to Pay Driver (COD)'),
                  LinguisticNormalizer.formatIqd(
                    _useWallet
                        ? ((widget.cartState.finalTotalIqd + _riderTipIqd) - (AuthState().walletBalanceIqd > (widget.cartState.finalTotalIqd + _riderTipIqd) ? (widget.cartState.finalTotalIqd + _riderTipIqd) : AuthState().walletBalanceIqd))
                        : (widget.cartState.finalTotalIqd + _riderTipIqd),
                    widget.localeProvider.currentLanguage,
                  ),
                  isTotal: true,
                ),
              ],
            ),
          ),

          const SizedBox(height: 100),
        ],
      ),

      // Sticky Bottom Place Order Button
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, -3)),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 54,
            child: ElevatedButton(
              onPressed: (_isSubmitting || _isOutOfZone) ? null : _handlePlaceOrder,
              style: ElevatedButton.styleFrom(
                backgroundColor: _isOutOfZone ? Colors.grey.shade400 : AppColors.primaryOrange,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(27)),
                elevation: _isOutOfZone ? 0 : 3,
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                    )
                  : _isOutOfZone
                      ? Text(
                          isRtl ? 'گەیاندن بەردەست نییە (دەرەوەی بازنە)' : 'Delivery Unavailable (Out of Zone)',
                          style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              LinguisticNormalizer.formatIqd(
                                _useWallet
                                    ? ((widget.cartState.finalTotalIqd + _riderTipIqd) - (AuthState().walletBalanceIqd > (widget.cartState.finalTotalIqd + _riderTipIqd) ? (widget.cartState.finalTotalIqd + _riderTipIqd) : AuthState().walletBalanceIqd))
                                    : (widget.cartState.finalTotalIqd + _riderTipIqd),
                                widget.localeProvider.currentLanguage,
                              ),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            Text(
                              _useWallet && (AuthState().walletBalanceIqd >= (widget.cartState.finalTotalIqd + _riderTipIqd))
                                  ? (isRtl ? (widget.localeProvider.currentLanguage == 'ckb' ? 'پارەدان بە تەواوی لە وۆڵێت' : 'دفع كامل من المحفظة') : 'Pay 100% via Wallet')
                                  : widget.localeProvider.translate('place_order'),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            Icon(
                              isRtl
                                  ? Icons.arrow_back_ios_new_rounded
                                  : Icons.arrow_forward_ios_rounded,
                              color: Colors.white,
                              size: 20,
                            ),
                          ],
                        ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInstructionChip(String label, IconData icon) {
    final isSelected = _selectedInstruction == label;
    return GestureDetector(
      onTap: () => setState(() => _selectedInstruction = label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryOrangeLight : AppColors.productBoxSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? AppColors.primaryOrange : AppColors.dividerColor),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isSelected ? AppColors.primaryOrange : AppColors.textSecondary),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primaryOrangeDark : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGatewayPill(String name, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.productBoxSurface,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.textMuted, size: 20),
          const SizedBox(width: 10),
          Text(name, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              widget.localeProvider.translate('gateway_ready'),
              style: TextStyle(fontSize: 10, color: Colors.grey.shade700, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isSavings = false, bool isFree = false, bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 15 : 13,
            fontWeight: isTotal ? FontWeight.w800 : FontWeight.w500,
            color: isTotal ? AppColors.textPrimary : AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 16 : 13,
            fontWeight: isTotal ? FontWeight.w900 : FontWeight.w700,
            color: isTotal
                ? AppColors.primaryOrange
                : (isSavings ? const Color(0xFF2E7D32) : (isFree ? const Color(0xFF2E7D32) : AppColors.textPrimary)),
          ),
        ),
      ],
    );
  }
}
