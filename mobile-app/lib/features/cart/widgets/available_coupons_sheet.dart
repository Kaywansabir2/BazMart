import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../core/theme/app_theme.dart';
import '../../../core/localization/app_locale.dart';
import '../../../core/state/cart_state.dart';

class AvailableCouponsSheet extends StatefulWidget {
  final CartState cartState;
  final LocaleProvider localeProvider;
  final Function(String code) onApplyCoupon;

  const AvailableCouponsSheet({
    super.key,
    required this.cartState,
    required this.localeProvider,
    required this.onApplyCoupon,
  });

  @override
  State<AvailableCouponsSheet> createState() => _AvailableCouponsSheetState();
}

class _AvailableCouponsSheetState extends State<AvailableCouponsSheet> {
  List<Map<String, dynamic>> _coupons = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchCoupons();
  }

  Future<void> _fetchCoupons() async {
    try {
      final res = await http.get(Uri.parse('http://localhost:4001/api/v1/coupons/available'));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] is List) {
          setState(() {
            _coupons = List<Map<String, dynamic>>.from(body['data']);
            _loading = false;
          });
          return;
        }
      }
    } catch (_) {}

    // Fallback static coupons
    setState(() {
      _coupons = [
        {
          'code': 'BAZ20',
          'titleEn': '20% off orders above IQD 10,000 (Max IQD 5,000)',
          'titleCkb': 'داشکاندنی ٢٠٪ بۆ داواکاری سەروو ١٠،٠٠٠ د.ع (زۆرینە ٥،٠٠٠ د.ع)',
          'titleAr': 'خصم 20% للطلبات فوق 10,000 د.ع (حد أقصى 5,000 د.ع)',
          'discountType': 'PERCENTAGE',
          'discountValue': 20,
          'maxDiscountIqd': 5000,
          'minOrderSubtotalIqd': 10000,
        },
        {
          'code': 'SLEMANI2500',
          'titleEn': 'IQD 2,500 instant discount on orders over IQD 8,000',
          'titleCkb': 'داشکاندنی دەستبەجێی ٢،٥٠٠ د.ع بۆ داواکاری سەروو ٨،٠٠٠ د.ع',
          'titleAr': 'خصم فوري 2,500 د.ع للطلبات فوق 8,000 د.ع',
          'discountType': 'FIXED_IQD',
          'discountValue': 2500,
          'minOrderSubtotalIqd': 8000,
        },
        {
          'code': 'FIRST5000',
          'titleEn': 'IQD 5,000 off your very first BazMart order!',
          'titleCkb': '٥،٠٠٠ د.ع داشکاندن بۆ یەکەم داواکاری لە بازماڕت!',
          'titleAr': 'خصم 5,000 د.ع على طلبك الأول من باز مارت!',
          'discountType': 'FIXED_IQD',
          'discountValue': 5000,
          'minOrderSubtotalIqd': 12000,
        },
        {
          'code': 'FREEDEL',
          'titleEn': 'Free rapid delivery on your order',
          'titleCkb': 'گەیاندنی خێرای بێبەرامبەر بۆ داواکارییەکەت',
          'titleAr': 'توصيل سريع مجاني لطلبك',
          'discountType': 'FREE_DELIVERY',
          'discountValue': 500,
          'minOrderSubtotalIqd': 7000,
        },
      ];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final locale = widget.localeProvider;
    final currentSubtotal = widget.cartState.totalAmountIqd;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag Handle
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryOrangeLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.confirmation_number_outlined, color: AppColors.primaryOrange, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    locale.isKurdish
                        ? 'کۆپۆن و داشکاندنە بەردەستەکان'
                        : locale.isArabic
                            ? 'الكوبونات والعروض المتاحة'
                            : 'Available Vouchers',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 20, color: AppColors.textSecondary),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (_loading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 30),
              child: Center(child: CircularProgressIndicator(color: AppColors.primaryOrange)),
            )
          else if (_coupons.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text(
                  locale.translate('no_results_found'),
                  style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                ),
              ),
            )
          else
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: _coupons.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final c = _coupons[index];
                  final code = c['code'] as String;
                  final minSubtotal = c['minOrderSubtotalIqd'] as int? ?? 0;
                  final isApplicable = currentSubtotal >= minSubtotal;
                  final isAlreadyApplied = widget.cartState.appliedCouponCode == code;

                  String title = c['titleEn'] ?? '';
                  if (locale.isKurdish && c['titleCkb'] != null) {
                    title = c['titleCkb'];
                  } else if (locale.isArabic && c['titleAr'] != null) {
                    title = c['titleAr'];
                  }

                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isAlreadyApplied
                          ? const Color(0xFFECFDF5)
                          : isApplicable
                              ? const Color(0xFFFFF9F5)
                              : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isAlreadyApplied
                            ? const Color(0xFFA7F3D0)
                            : isApplicable
                                ? AppColors.primaryOrange.withOpacity(0.4)
                                : Colors.grey.shade200,
                        width: 1.2,
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Left Ticket Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: isAlreadyApplied ? const Color(0xFF059669) : AppColors.primaryOrange,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            code,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),

                        // Center Details
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                title,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: isApplicable ? AppColors.textPrimary : Colors.grey.shade500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                locale.isKurdish
                                    ? 'کەمترین داواکاری: IQD $minSubtotal'
                                    : locale.isArabic
                                        ? 'الحد الأدنى للطلب: IQD $minSubtotal'
                                        : 'Min. order: IQD $minSubtotal',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isApplicable ? AppColors.textSecondary : Colors.grey.shade400,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Action Button
                        if (isAlreadyApplied)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD1FAE5),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'Applied ✓',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF059669),
                              ),
                            ),
                          )
                        else
                          ElevatedButton(
                            onPressed: isApplicable
                                ? () {
                                    Navigator.pop(context);
                                    widget.onApplyCoupon(code);
                                  }
                                : null,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryOrange,
                              foregroundColor: Colors.white,
                              disabledBackgroundColor: Colors.grey.shade200,
                              disabledForegroundColor: Colors.grey.shade400,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              minimumSize: const Size(60, 32),
                            ),
                            child: Text(
                              locale.isKurdish ? 'بەکاربهێنە' : locale.isArabic ? 'تطبيق' : 'Apply',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                            ),
                          ),
                      ],
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
