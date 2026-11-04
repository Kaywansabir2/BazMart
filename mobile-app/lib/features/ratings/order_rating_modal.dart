import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/network/api_client.dart';
import '../../core/state/auth_state.dart';

class OrderRatingModal extends StatefulWidget {
  final String orderId;
  final String orderNumber;
  final String driverName;
  final ValueChanged<Map<String, dynamic>>? onSubmitted;

  const OrderRatingModal({
    super.key,
    required this.orderId,
    required this.orderNumber,
    this.driverName = 'Karwan Ahmed',
    this.onSubmitted,
  });

  static Future<bool?> show(
    BuildContext context, {
    required String orderId,
    required String orderNumber,
    String driverName = 'Karwan Ahmed',
    ValueChanged<Map<String, dynamic>>? onSubmitted,
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => OrderRatingModal(
        orderId: orderId,
        orderNumber: orderNumber,
        driverName: driverName,
        onSubmitted: onSubmitted,
      ),
    );
  }

  @override
  State<OrderRatingModal> createState() => _OrderRatingModalState();
}

class _OrderRatingModalState extends State<OrderRatingModal> {
  int _storeStars = 5;
  int _driverStars = 5;
  final Set<String> _selectedTags = {'Fast Delivery ⚡', 'Fresh & Cold Items 🧊'};
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;
  String? _errorMessage;

  final List<String> _positiveTags = [
    'Fast Delivery ⚡',
    'Fresh & Cold Items 🧊',
    'Polite Rider 😊',
    'Perfect Packaging 📦',
  ];

  final List<String> _negativeTags = [
    'Late Delivery',
    'Missing/Damaged Item',
    'Warm Chilled Item',
  ];

  List<String> getAvailableTags(String lang) {
    final isGood = (_storeStars >= 4 && _driverStars >= 4);
    if (lang == 'ckb') {
      return isGood
          ? ['گەیاندنی خێرا ⚡', 'کاڵای فرێش و سارد 🧊', 'شۆفێری بەڕێز 😊', 'پێچانەوەی بێ کەموری 📦']
          : ['دواکەوتنی گەیاندن', 'کاڵای کەم یان تێکچوو', 'کاڵای سارد گەرم بووبوو'];
    } else if (lang == 'ar') {
      return isGood
          ? ['توصيل سريع ⚡', 'منتجات طازجة وباردة 🧊', 'سائق مهذب 😊', 'تغليف ممتاز 📦']
          : ['تأخر التوصيل', 'منتج مفقود أو تالف', 'منتج مبرد وصل دافئاً'];
    }
    return isGood ? _positiveTags : _negativeTags;
  }

  List<String> get _currentAvailableTags {
    return getAvailableTags(LocaleProvider().currentLanguage);
  }

  Future<void> _submitRating() async {
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final auth = AuthState();
    final customerPhone = auth.customer?['phone'] ?? '+9647701234567';

    final payload = {
      'overallStoreStars': _storeStars,
      'driverStars': _driverStars,
      'feedbackTags': _selectedTags.toList(),
      'comment': _commentController.text.trim(),
      'customerPhone': customerPhone,
    };

    final result = await ApiClient().rateOrder(widget.orderId, payload);

    if (!mounted) return;

    if (result['success'] == true) {
      widget.onSubmitted?.call(result['data'] ?? payload);
      Navigator.of(context).pop(true);
    } else {
      setState(() {
        _isSubmitting = false;
        _errorMessage = result['message'] ?? result['error'] ?? 'Failed to submit rating. Please try again.';
      });
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locale = LocaleProvider();
    final isRtl = locale.isRtl;

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 12,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
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
              const SizedBox(height: 14),

              // Title Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryOrange.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.star_rounded, color: AppColors.primaryOrange, size: 22),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        locale.translate('rate_order'),
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.textMuted),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Order #${widget.orderNumber}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
              ),
              const Divider(height: 24, color: AppColors.dividerColor),

              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: Colors.red, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(fontSize: 11, color: Colors.red.shade900, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],

              // Section 1: Dark Store & Items
              Text(
                locale.translate('rate_darkstore_title'),
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 6),
              Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(5, (index) {
                    final starNum = index + 1;
                    return IconButton(
                      key: ValueKey('store_star_$starNum'),
                      icon: Icon(
                        starNum <= _storeStars ? Icons.star_rounded : Icons.star_outline_rounded,
                        color: Colors.amber.shade500,
                        size: 36,
                      ),
                      onPressed: () {
                        setState(() {
                          _storeStars = starNum;
                        });
                      },
                    );
                  }),
              ),
              ),
              const SizedBox(height: 14),

              // Section 2: Courier Delivery
              Text(
                '${locale.translate('rate_rider_title')} (${widget.driverName})',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 6),
              Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(5, (index) {
                    final starNum = index + 1;
                    return IconButton(
                      key: ValueKey('driver_star_$starNum'),
                      icon: Icon(
                        starNum <= _driverStars ? Icons.star_rounded : Icons.star_outline_rounded,
                        color: Colors.amber.shade500,
                        size: 36,
                      ),
                      onPressed: () {
                        setState(() {
                          _driverStars = starNum;
                        });
                      },
                    );
                  }),
                ),
              ),
              const SizedBox(height: 14),

              // Section 3: Quick Feedback Chips
              Text(
                locale.translate('quick_feedback'),
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _currentAvailableTags.map((tag) {
                  final isSelected = _selectedTags.contains(tag);
                  return FilterChip(
                    key: ValueKey('chip_${tag.replaceAll(' ', '_')}'),
                    selected: isSelected,
                    label: Text(tag),
                    labelStyle: TextStyle(
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                    backgroundColor: Colors.grey.shade100,
                    selectedColor: AppColors.primaryOrange,
                    checkmarkColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected ? AppColors.primaryOrange : Colors.grey.shade300,
                      ),
                    ),
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedTags.add(tag);
                        } else {
                          _selectedTags.remove(tag);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Section 4: Optional Comment Input
              TextField(
                key: const ValueKey('rating_comment_input'),
                controller: _commentController,
                maxLines: 2,
                style: const TextStyle(fontSize: 12),
                decoration: InputDecoration(
                  hintText: locale.translate('additional_comments'),
                  hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  filled: true,
                  fillColor: Colors.grey.shade50,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primaryOrange, width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // Submit Button
              ElevatedButton(
                key: const ValueKey('submit_rating_btn'),
                onPressed: _isSubmitting ? null : _submitRating,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryOrange,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : Text(
                        locale.translate('submit_rating'),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

