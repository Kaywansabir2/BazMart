import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/network/api_client.dart';
import '../ratings/order_rating_modal.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String orderNumber;
  final String? orderId;
  final int totalIqd;
  final String deliveryAddress;
  final String driverName;
  final String driverPhone;
  final String estimatedMinutes;
  final LocaleProvider localeProvider;
  final String? initialStage; // 'placed', 'packing', 'out_for_delivery', 'delivered'
  final bool? initialRated;

  const OrderTrackingScreen({
    super.key,
    required this.orderNumber,
    this.orderId,
    required this.totalIqd,
    required this.deliveryAddress,
    required this.driverName,
    required this.driverPhone,
    required this.estimatedMinutes,
    required this.localeProvider,
    this.initialStage,
    this.initialRated,
  });

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  late int _currentStepIndex;
  late String _currentStatus;
  late String _driverName;
  late String _driverPhone;
  late double _driverRating;
  late String _estimatedMinutes;
  bool _isRated = false;
  Map<String, dynamic>? _ratingData;
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _currentStepIndex = _mapStageToIndex(widget.initialStage ?? 'packing');
    _currentStatus = _mapIndexToStatus(_currentStepIndex);
    _driverName = widget.driverName;
    _driverPhone = widget.driverPhone;
    _driverRating = 4.9;
    _estimatedMinutes = widget.estimatedMinutes;
    _isRated = widget.initialRated ?? false;

    _fetchLiveStatus();
    _startPolling();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final uri = Uri.base;
      if (uri.queryParameters['modal'] == 'issue' || uri.queryParameters['report_issue'] == 'true') {
        _showReportIssueSheet();
      }
    });
  }

  int _mapStageToIndex(String stage) {
    switch (stage.toLowerCase()) {
      case 'placed':
        return 0;
      case 'packing':
      case 'packing_in_darkstore':
      case 'ready_for_pickup':
        return 1;
      case 'out_for_delivery':
      case 'on_the_way':
      case 'delivery':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 1;
    }
  }

  String _mapIndexToStatus(int index) {
    switch (index) {
      case 0:
        return 'PLACED';
      case 1:
        return 'PACKING_IN_DARKSTORE';
      case 2:
        return 'OUT_FOR_DELIVERY';
      case 3:
        return 'DELIVERED';
      default:
        return 'PACKING_IN_DARKSTORE';
    }
  }

  void _startPolling() {
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      _fetchLiveStatus();
    });
  }

  Future<void> _fetchLiveStatus() async {
    final targetId = widget.orderId ?? widget.orderNumber;
    final res = await ApiClient().fetchLiveOrderStatus(targetId);
    if (!mounted || res['success'] != true) return;

    final data = res['data'] as Map<String, dynamic>;
    final status = data['orderStatus'] as String? ?? 'PLACED';
    final isRated = data['isRated'] as bool? ?? false;
    final driver = data['driver'] as Map<String, dynamic>?;

    setState(() {
      _currentStatus = status;
      _currentStepIndex = _mapStageToIndex(status);
      _isRated = isRated || (_isRated);
      if (data['rating'] != null) {
        _ratingData = data['rating'] as Map<String, dynamic>;
      }
      if (driver != null) {
        _driverName = driver['name'] ?? _driverName;
        _driverPhone = driver['phone'] ?? _driverPhone;
        _driverRating = (driver['averageRating'] as num?)?.toDouble() ?? _driverRating;
      }
      if (data['estimatedDeliveryMinutes'] != null) {
        _estimatedMinutes = data['estimatedDeliveryMinutes'];
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  void _openRatingModal() {
    OrderRatingModal.show(
      context,
      orderId: widget.orderId ?? widget.orderNumber,
      orderNumber: widget.orderNumber,
      driverName: _driverName,
      onSubmitted: (data) {
        setState(() {
          _isRated = true;
          _ratingData = data;
        });
      },
    );
  }

  String _getHeroStatusTitle(LocaleProvider locale) {
    switch (_currentStepIndex) {
      case 0:
        return locale.translate('order_placed');
      case 1:
        return locale.translate('packing_in_darkstore');
      case 2:
        return locale.translate('rider_on_way');
      case 3:
        return locale.translate('delivered');
      default:
        return locale.translate('packing_in_darkstore');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = widget.localeProvider.isRtl;

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
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
                    onTap: () => Navigator.popUntil(context, (route) => route.isFirst),
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
                    widget.localeProvider.translate('order_tracking'),
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
            // 1. Hero Status Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFF3E0), Colors.white],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primaryOrange.withOpacity(0.3)),
                boxShadow: const [
                  BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2)),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primaryOrange,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              widget.orderNumber,
                              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _currentStatus,
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryOrangeDark),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Icon(
                            _currentStepIndex >= 3 ? Icons.check_circle_rounded : Icons.timer_outlined,
                            color: _currentStepIndex >= 3 ? const Color(0xFF2E7D32) : AppColors.primaryOrangeDark,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _currentStepIndex >= 3 ? 'Delivered' : _estimatedMinutes,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: _currentStepIndex >= 3 ? const Color(0xFF2E7D32) : AppColors.primaryOrangeDark,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Icon(
                    _currentStepIndex == 0
                        ? Icons.receipt_long_rounded
                        : _currentStepIndex == 1
                            ? Icons.inventory_2_rounded
                            : _currentStepIndex == 2
                                ? Icons.two_wheeler_rounded
                                : Icons.check_circle_rounded,
                    color: _currentStepIndex >= 3 ? const Color(0xFF2E7D32) : AppColors.primaryOrange,
                    size: 48,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _getHeroStatusTitle(widget.localeProvider),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _currentStepIndex == 0
                        ? 'Received & Verified at Dark Store'
                        : _currentStepIndex == 1
                            ? 'BazMart Erbil Central Dark Store • Picked under 5°'
                            : _currentStepIndex == 2
                                ? 'Dedicated courier on high-speed delivery route'
                                : 'Order fulfilled successfully! Enjoy your groceries',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 2. 4-Stage Live Stepper Progress
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
                  _buildTrackingStep(
                    0,
                    widget.localeProvider.translate('order_placed'),
                    'Received & Verified in Database',
                    isCompleted: _currentStepIndex > 0,
                    isActive: _currentStepIndex == 0,
                  ),
                  _buildStepConnector(_currentStepIndex > 0),
                  _buildTrackingStep(
                    1,
                    widget.localeProvider.translate('packing_in_darkstore'),
                    'Dark store pickers preparing cold items',
                    isCompleted: _currentStepIndex > 1,
                    isActive: _currentStepIndex == 1,
                  ),
                  _buildStepConnector(_currentStepIndex > 1),
                  _buildTrackingStep(
                    2,
                    widget.localeProvider.translate('rider_on_way'),
                    'Courier $_driverName dispatched on route',
                    isCompleted: _currentStepIndex > 2,
                    isActive: _currentStepIndex == 2,
                  ),
                  _buildStepConnector(_currentStepIndex > 2),
                  _buildTrackingStep(
                    3,
                    widget.localeProvider.translate('delivered'),
                    'Cash on Delivery collected in IQD',
                    isCompleted: _currentStepIndex >= 3,
                    isActive: _currentStepIndex == 3,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 3. Post-Delivery Rating Trigger / Confirmation Badge (if Delivered)
            if (_currentStepIndex >= 3) ...[
              if (_isRated)
                Container(
                  key: const ValueKey('order_rated_badge'),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF81C784)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: Color(0xFF2E7D32),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.star_rounded, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.localeProvider.translate('thank_you_rating'),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF1B5E20),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _ratingData != null && _ratingData!['comment'] != null && _ratingData!['comment'].toString().isNotEmpty
                                  ? '"${_ratingData!['comment']}"'
                                  : 'Store: 5.0 ★ • Driver: 5.0 ★ • Fast Delivery ⚡',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.green.shade800,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2E7D32),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          widget.localeProvider.translate('rated_badge'),
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFF8E1), Colors.white],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.amber.shade400, width: 1.4),
                    boxShadow: const [
                      BoxShadow(color: Color(0x0C000000), blurRadius: 8, offset: Offset(0, 2)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.stars_rounded, color: Colors.amber, size: 28),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  widget.localeProvider.translate('rate_order'),
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'Help us improve dark store packaging & courier speed',
                                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      ElevatedButton.icon(
                        key: const ValueKey('open_rating_modal_btn'),
                        onPressed: _openRatingModal,
                        icon: const Icon(Icons.star_rate_rounded, color: Colors.white, size: 18),
                        label: Text(
                          widget.localeProvider.translate('rate_order'),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryOrange,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 0,
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),
            ],

            // 4. Assigned Rider Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.dividerColor),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryOrangeLight,
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Icon(Icons.two_wheeler, color: AppColors.primaryOrange, size: 28),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _driverName,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Colors.amber, size: 15),
                            const SizedBox(width: 2),
                            Text(
                              '$_driverRating',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.amber),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '• ${widget.localeProvider.translate('assigned_rider')}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF81C784)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.call, color: Color(0xFF2E7D32), size: 14),
                        const SizedBox(width: 4),
                        Text(
                          widget.localeProvider.translate('call_rider'),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2E7D32),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 5. Delivery Address Confirmation
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.dividerColor),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.home_outlined, color: AppColors.primaryOrange, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.localeProvider.translate('delivery_address'),
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.deliveryAddress,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 6. Itemized Receipt
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
                    widget.localeProvider.translate('itemized_receipt'),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 10),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Payment Method', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Text('Cash on Delivery (COD)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Delivery Fee', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      Text(
                        widget.localeProvider.translate('free'),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF2E7D32)),
                      ),
                    ],
                  ),
                  const Divider(height: 20, color: AppColors.dividerColor),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        widget.localeProvider.translate('total'),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                      ),
                      Text(
                        'IQD ${widget.totalIqd.toLocaleString()}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primaryOrange,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Get Help / Report Issue Button
            SizedBox(
              height: 48,
              child: OutlinedButton.icon(
                key: const ValueKey('report_issue_btn'),
                onPressed: _showReportIssueSheet,
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.redAccent,
                  side: const BorderSide(color: Colors.redAccent, width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
                icon: const Icon(Icons.help_outline_rounded, size: 18),
                label: Text(
                  isRtl ? 'تۆمارکردنی سکاڵا / کێشە لە داواکاری' : 'Report Issue & Request Refund',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Back to Home Button
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: () => Navigator.popUntil(context, (route) => route.isFirst),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryOrange,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                ),
                child: Text(
                  widget.localeProvider.translate('back_to_home'),
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                ),
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  void _showReportIssueSheet() {
    final isRtl = widget.localeProvider.isRtl;
    String issueType = 'DAMAGED_ITEMS';
    final notesController = TextEditingController();
    int refundAmount = 2250;
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Directionality(
              textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
              child: Padding(
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
                          isRtl ? 'تۆمارکردنی کێشە و داواکاری گەڕاندنەوە' : 'Report Order Issue & Refund',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      isRtl ? 'هۆکاری کێشەکە هەڵبژێرە:' : 'Select Issue Reason:',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: issueType,
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      items: [
                        DropdownMenuItem(
                          value: 'DAMAGED_ITEMS',
                          child: Text(isRtl ? 'کاڵای تێکچوو یان بەسەرچوو' : 'Damaged / Expired Item'),
                        ),
                        DropdownMenuItem(
                          value: 'MISSING_ITEMS',
                          child: Text(isRtl ? 'کاڵای کەم لە سەبەتەکەدا' : 'Missing Item in Bag'),
                        ),
                        DropdownMenuItem(
                          value: 'WRONG_ITEMS',
                          child: Text(isRtl ? 'کاڵای هەڵە گەیشتووە' : 'Received Wrong Item'),
                        ),
                        DropdownMenuItem(
                          value: 'EXTREME_DELAY',
                          child: Text(isRtl ? 'دواکەوتنی گەیاندن (زیاتر لە ٣٠ خولەک)' : 'Late Delivery (>30m)'),
                        ),
                      ],
                      onChanged: (val) {
                        if (val != null) setSheetState(() => issueType = val);
                      },
                    ),
                    const SizedBox(height: 12),
                    Text(
                      isRtl ? 'بڕی پارەی گەڕاوە (د.ع):' : 'Refund Amount Requested (IQD):',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        ChoiceChip(
                          label: Text(isRtl ? '٢،٢٥٠ د.ع' : 'IQD 2,250'),
                          selected: refundAmount == 2250,
                          onSelected: (val) {
                            if (val) setSheetState(() => refundAmount = 2250);
                          },
                        ),
                        const SizedBox(width: 8),
                        ChoiceChip(
                          label: Text(isRtl ? '٤،٥٠٠ د.ع' : 'IQD 4,500'),
                          selected: refundAmount == 4500,
                          onSelected: (val) {
                            if (val) setSheetState(() => refundAmount = 4500);
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      isRtl ? 'تێبینی یان ڕوونکردنەوەی زیاتر:' : 'Details / Notes:',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: notesController,
                      maxLines: 2,
                      decoration: InputDecoration(
                        hintText: isRtl ? 'بۆ نموونە: شیرەکە کون بووبوو یان تێکچووبوو...' : 'e.g. Eggs were cracked during delivery...',
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryOrange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: isSubmitting
                            ? null
                            : () async {
                                final messenger = ScaffoldMessenger.of(context);
                                setSheetState(() => isSubmitting = true);
                                final orderIdToReport = widget.orderId ?? widget.orderNumber;
                                final res = await ApiClient().reportOrderIssue(
                                  orderId: orderIdToReport,
                                  phone: widget.driverPhone.isNotEmpty ? '+9647701234567' : '+9647701234567',
                                  issueCategory: issueType,
                                  customerNote: notesController.text.isNotEmpty ? notesController.text : 'Issue reported from app',
                                  requestedRefundIqd: refundAmount,
                                );
                                setSheetState(() => isSubmitting = false);
                                if (ctx.mounted) {
                                  Navigator.pop(ctx);
                                }
                                if (!mounted) return;
                                final tktNum = res['ticket']?['ticketNumber'] ?? '#TKT-10002';
                                messenger.showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      isRtl
                                          ? '✓ سکاڵای ژمارە $tktNum تۆمارکرا! داواکاری گەڕاندنەوە لەژێر پێداچوونەوەدایە.'
                                          : '✓ Support ticket $tktNum submitted! Refund under review.',
                                    ),
                                    backgroundColor: AppColors.primaryOrange,
                                    duration: const Duration(seconds: 3),
                                  ),
                                );
                              },
                        child: isSubmitting
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(
                                isRtl ? 'ناردنی سکاڵا و داواکاری گەڕاندنەوە' : 'Submit Ticket & Request Refund',
                                style: const TextStyle(fontWeight: FontWeight.w800),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildTrackingStep(int index, String title, String subtitle, {required bool isCompleted, required bool isActive}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isCompleted
                ? const Color(0xFF2E7D32)
                : (isActive ? AppColors.primaryOrange : Colors.grey.shade200),
          ),
          child: Center(
            child: isCompleted
                ? const Icon(Icons.check, size: 16, color: Colors.white)
                : (isActive
                    ? const Icon(Icons.radio_button_checked, size: 16, color: Colors.white)
                    : Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(color: Colors.grey.shade400, shape: BoxShape.circle),
                      )),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: (isCompleted || isActive) ? AppColors.textPrimary : AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStepConnector(bool isActive) {
    return Container(
      margin: const EdgeInsets.only(left: 13, top: 4, bottom: 4),
      width: 2,
      height: 24,
      color: isActive ? AppColors.primaryOrange : Colors.grey.shade300,
    );
  }
}

extension NumberFormatting on int {
  String toLocaleString() {
    final str = toString();
    final reg = RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))');
    return str.replaceAllMapped(reg, (Match m) => '${m[1]},');
  }
}
