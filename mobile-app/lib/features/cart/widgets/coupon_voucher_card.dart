import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../core/theme/app_theme.dart';
import '../../../core/localization/app_locale.dart';
import '../../../core/state/cart_state.dart';
import '../../../core/utils/linguistic_normalizer.dart';
import 'available_coupons_sheet.dart';

class CouponVoucherCard extends StatefulWidget {
  final CartState cartState;
  final LocaleProvider localeProvider;
  final VoidCallback? onCouponChanged;

  const CouponVoucherCard({
    super.key,
    required this.cartState,
    required this.localeProvider,
    this.onCouponChanged,
  });

  @override
  State<CouponVoucherCard> createState() => _CouponVoucherCardState();
}

class _CouponVoucherCardState extends State<CouponVoucherCard> {
  final TextEditingController _codeController = TextEditingController();
  bool _validating = false;
  String? _errorMessage;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _validateAndApplyCoupon(String inputCode) async {
    final rawCode = inputCode.trim();
    if (rawCode.isEmpty) return;

    final normalizedCode = LinguisticNormalizer.normalizeEasternNumerals(rawCode).trim().toUpperCase();

    setState(() {
      _validating = true;
      _errorMessage = null;
    });

    final cartState = widget.cartState;
    final locale = widget.localeProvider;

    final cartItemsPayload = cartState.itemList.map((i) => {
      'productId': i.product.id,
      'quantity': i.quantity,
      'unitPriceIqd': i.product.priceIqd,
    }).toList();

    try {
      final res = await http.post(
        Uri.parse('http://localhost:4001/api/v1/coupons/validate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'code': normalizedCode,
          'cartItems': cartItemsPayload,
        }),
      );

      final body = jsonDecode(res.body);

      if (res.statusCode == 200 && body['success'] == true) {
        final data = body['data'];
        final discountIqd = data['couponDiscountIqd'] as int? ?? 0;
        final minSubtotal = data['minOrderSubtotalIqd'] as int? ?? 0;

        String title = data['titleEn'] ?? normalizedCode;
        if (locale.isKurdish && data['titleCkb'] != null) {
          title = data['titleCkb'];
        } else if (locale.isArabic && data['titleAr'] != null) {
          title = data['titleAr'];
        }

        cartState.applyCoupon(
          code: normalizedCode,
          discountIqd: discountIqd,
          title: title,
          minSubtotal: minSubtotal,
        );

        _codeController.clear();
        setState(() {
          _errorMessage = null;
          _validating = false;
        });

        if (widget.onCouponChanged != null) {
          widget.onCouponChanged!();
        }
      } else {
        // Localized error message from backend
        String errorMsg = body['message'] ?? 'Failed to apply promo code.';
        if (locale.isKurdish && body['messageCkb'] != null) {
          errorMsg = body['messageCkb'];
        } else if (locale.isArabic && body['messageAr'] != null) {
          errorMsg = body['messageAr'];
        }

        setState(() {
          _errorMessage = errorMsg;
          _validating = false;
        });
      }
    } catch (_) {
      // Offline fallback validation
      if (normalizedCode == 'BAZ20') {
        if (cartState.totalAmountIqd >= 10000) {
          final discount = (cartState.totalAmountIqd * 0.20).round();
          final capped = discount > 5000 ? 5000 : discount;
          cartState.applyCoupon(code: 'BAZ20', discountIqd: capped, minSubtotal: 10000);
          _codeController.clear();
          setState(() {
            _validating = false;
            _errorMessage = null;
          });
          return;
        } else {
          setState(() {
            _validating = false;
            _errorMessage = locale.isKurdish
                ? 'پێویستە کەمترین کۆی داواکاری ١٠،٠٠٠ د.ع بێت بۆ بەکارهێنانی BAZ20'
                : 'Minimum order subtotal of IQD 10,000 required to apply BAZ20.';
          });
          return;
        }
      }

      setState(() {
        _validating = false;
        _errorMessage = 'Invalid promo code or server unreachable.';
      });
    }
  }

  void _openAvailableCouponsSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AvailableCouponsSheet(
        cartState: widget.cartState,
        localeProvider: widget.localeProvider,
        onApplyCoupon: (code) {
          _validateAndApplyCoupon(code);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cartState = widget.cartState;
    final locale = widget.localeProvider;
    final isRtl = locale.isRtl;
    final isApplied = cartState.appliedCouponCode != null;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isApplied ? const Color(0xFFA7F3D0) : AppColors.dividerColor,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title & Icon
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('🎟️', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Text(
                    locale.isKurdish
                        ? 'داشکاندن و کۆدی داشکاندن'
                        : locale.isArabic
                            ? 'كوبونات الخصم وقسائم الشراء'
                            : 'Vouchers & Promo Codes',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: _openAvailableCouponsSheet,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 6),
                  child: Row(
                    children: [
                      Text(
                        locale.isKurdish
                            ? 'پیشاندانی هەموو'
                            : locale.isArabic
                                ? 'عرض الكل'
                                : 'View all',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryOrange,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(
                        isRtl ? Icons.chevron_left : Icons.chevron_right,
                        size: 16,
                        color: AppColors.primaryOrange,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // APPLIED STATE PILL
          if (isApplied)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Color(0xFF059669), size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Code ${cartState.appliedCouponCode} applied!',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF059669),
                              ),
                            ),
                          ],
                        ),
                        Text(
                          locale.isKurdish
                            ? '${cartState.couponDiscountIqd} د.ع داشکاندنت بۆ کراوە'
                            : locale.isArabic
                              ? 'وفرت ${cartState.couponDiscountIqd} د.ع على طلبك'
                              : 'You saved IQD ${cartState.couponDiscountIqd}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF065F46),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18, color: Color(0xFF059669)),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () {
                      cartState.removeCoupon();
                      if (widget.onCouponChanged != null) {
                        widget.onCouponChanged!();
                      }
                    },
                  ),
                ],
              ),
            )
          else ...[
            // INPUT FIELD & APPLY BUTTON
            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8F9FA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _errorMessage != null ? Colors.red.shade300 : const Color(0xFFE5E7EB),
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    alignment: Alignment.center,
                    child: TextField(
                      controller: _codeController,
                      textCapitalization: TextCapitalization.characters,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: 0.8,
                      ),
                      decoration: InputDecoration(
                        hintText: locale.isKurdish
                            ? 'کۆدی داشکاندن بنووسە e.g. BAZ20'
                            : locale.isArabic
                                ? 'أدخل كود الخصم e.g. BAZ20'
                                : 'Enter promo code e.g. BAZ20',
                        hintStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade400,
                          letterSpacing: 0,
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onSubmitted: (val) => _validateAndApplyCoupon(val),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 44,
                  child: ElevatedButton(
                    onPressed: _validating ? null : () => _validateAndApplyCoupon(_codeController.text),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryOrange,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: AppColors.primaryOrange.withOpacity(0.6),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                    ),
                    child: _validating
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            locale.isKurdish ? 'بەکاربێنە' : locale.isArabic ? 'تطبيق' : 'Apply',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                          ),
                  ),
                ),
              ],
            ),

            // ERROR FEEDBACK BANNER
            if (_errorMessage != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.red.shade800,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}
