import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_locale.dart';
import '../../core/network/api_client.dart';
import '../../core/state/auth_state.dart';
import '../order_tracking/order_tracking_screen.dart';

class NotificationsScreen extends StatefulWidget {
  final String? initialFilter;

  const NotificationsScreen({
    super.key,
    this.initialFilter,
  });

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedTab = 'ALL'; // ALL, ORDERS, PROMOS
  List<dynamic> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    if (widget.initialFilter != null) {
      _selectedTab = widget.initialFilter!;
    }
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    final auth = AuthState();
    final phone = auth.customer?['phone'];

    final result = await ApiClient().fetchNotifications(phone: phone, type: _selectedTab);
    if (!mounted) return;

    setState(() {
      _notifications = result['notifications'] as List<dynamic>? ?? [];
      _unreadCount = result['unreadCount'] as int? ?? 0;
      _isLoading = false;
    });
  }

  Future<void> _markAllRead() async {
    final auth = AuthState();
    final phone = auth.customer?['phone'];
    await ApiClient().markAllNotificationsRead(phone: phone);
    if (!mounted) return;
    setState(() {
      for (final n in _notifications) {
        if (n is Map<String, dynamic>) {
          n['isRead'] = true;
        }
      }
      _unreadCount = 0;
    });
  }

  Future<void> _handleNotificationTap(Map<String, dynamic> notif) async {
    final id = notif['id'] as String?;
    if (id != null && notif['isRead'] != true) {
      await ApiClient().markNotificationRead(id);
      setState(() {
        notif['isRead'] = true;
        if (_unreadCount > 0) _unreadCount--;
      });
    }

    final orderId = notif['orderId'] as String?;
    if (orderId != null && mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (ctx) => OrderTrackingScreen(
            orderNumber: notif['orderNumber'] ?? orderId,
            totalIqd: notif['totalIqd'] ?? 18500,
            deliveryAddress: 'Erbil Central / Sulaymaniyah',
            driverName: 'Karwan Ahmed',
            driverPhone: '+964 750 491 8822',
            estimatedMinutes: '12-15 mins',
            localeProvider: LocaleProvider(),
          ),
        ),
      );
    }
  }

  String _getLocalizedTitle(Map<String, dynamic> notif, String lang) {
    if (lang == 'ckb' && notif['titleCkb'] != null && notif['titleCkb'].toString().isNotEmpty) {
      return notif['titleCkb'].toString();
    }
    if (lang == 'ar' && notif['titleAr'] != null && notif['titleAr'].toString().isNotEmpty) {
      return notif['titleAr'].toString();
    }
    return notif['titleEn']?.toString() ?? 'BazMart Notification';
  }

  String _getLocalizedBody(Map<String, dynamic> notif, String lang) {
    if (lang == 'ckb' && notif['bodyCkb'] != null && notif['bodyCkb'].toString().isNotEmpty) {
      return notif['bodyCkb'].toString();
    }
    if (lang == 'ar' && notif['bodyAr'] != null && notif['bodyAr'].toString().isNotEmpty) {
      return notif['bodyAr'].toString();
    }
    return notif['bodyEn']?.toString() ?? '';
  }

  Widget _buildTypeIcon(String? type) {
    IconData icon;
    Color bg;
    Color color;

    switch (type) {
      case 'ORDER_PLACED':
        icon = Icons.shopping_bag_outlined;
        bg = Colors.blue.shade50;
        color = Colors.blue.shade700;
        break;
      case 'ORDER_PACKING':
        icon = Icons.inventory_2_outlined;
        bg = Colors.amber.shade50;
        color = Colors.amber.shade800;
        break;
      case 'ORDER_OUT_FOR_DELIVERY':
        icon = Icons.two_wheeler_outlined;
        bg = Colors.orange.shade50;
        color = AppColors.primaryOrange;
        break;
      case 'ORDER_DELIVERED':
        icon = Icons.check_circle_outline_rounded;
        bg = const Color(0xFFE8F5E9);
        color = const Color(0xFF2E7D32);
        break;
      case 'PROMO_OFFER':
      case 'PRICE_DROP':
      default:
        icon = Icons.local_offer_outlined;
        bg = Colors.purple.shade50;
        color = Colors.purple.shade700;
        break;
    }

    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: bg,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Icon(icon, color: color, size: 22),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final locale = LocaleProvider();
    final isRtl = locale.isRtl;
    final lang = locale.currentLanguage;

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBackground,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: Icon(
              isRtl ? Icons.chevron_right_rounded : Icons.chevron_left_rounded,
              color: AppColors.textPrimary,
              size: 28,
            ),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: Text(
            locale.translate('notifications'),
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
            ),
          ),
          actions: [
            if (_unreadCount > 0)
              TextButton(
                key: const ValueKey('mark_all_read_btn'),
                onPressed: _markAllRead,
                child: Text(
                  locale.translate('mark_all_read'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryOrange,
                  ),
                ),
              ),
          ],
        ),
        body: Column(
          children: [
            // Tab Selector
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  _buildTabButton('ALL', locale.translate('tab_all')),
                  const SizedBox(width: 8),
                  _buildTabButton('ORDERS', locale.translate('tab_orders')),
                  const SizedBox(width: 8),
                  _buildTabButton('PROMOS', locale.translate('tab_promos')),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.dividerColor),

            // Notification List
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.primaryOrange),
                    )
                  : _notifications.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.notifications_off_outlined, size: 64, color: Colors.grey.shade400),
                              const SizedBox(height: 12),
                              Text(
                                locale.translate('no_notifications'),
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.grey.shade700,
                                ),
                              ),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _loadNotifications,
                          color: AppColors.primaryOrange,
                          child: ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: _notifications.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (ctx, index) {
                              final notif = _notifications[index] as Map<String, dynamic>;
                              final isRead = notif['isRead'] == true;
                              final type = notif['type'] as String?;
                              final title = _getLocalizedTitle(notif, lang);
                              final body = _getLocalizedBody(notif, lang);

                              return InkWell(
                                key: ValueKey('notif_item_$index'),
                                onTap: () => _handleNotificationTap(notif),
                                borderRadius: BorderRadius.circular(16),
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: isRead ? Colors.white : const Color(0xFFFFF9F5),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: isRead ? AppColors.dividerColor : AppColors.primaryOrange.withOpacity(0.3),
                                      width: isRead ? 1 : 1.4,
                                    ),
                                    boxShadow: const [
                                      BoxShadow(
                                        color: Color(0x06000000),
                                        blurRadius: 6,
                                        offset: Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      _buildTypeIcon(type),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    title,
                                                    style: TextStyle(
                                                      fontSize: 14,
                                                      fontWeight: isRead ? FontWeight.w700 : FontWeight.w900,
                                                      color: AppColors.textPrimary,
                                                    ),
                                                  ),
                                                ),
                                                if (!isRead)
                                                  Container(
                                                    width: 8,
                                                    height: 8,
                                                    decoration: const BoxDecoration(
                                                      color: AppColors.primaryOrange,
                                                      shape: BoxShape.circle,
                                                    ),
                                                  ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              body,
                                              style: TextStyle(
                                                fontSize: 12,
                                                color: isRead ? AppColors.textSecondary : AppColors.textPrimary,
                                                height: 1.35,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(String key, String label) {
    final isSelected = _selectedTab == key;
    return InkWell(
      key: ValueKey('notif_tab_$key'),
      onTap: () {
        setState(() => _selectedTab = key);
        _loadNotifications();
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryOrange : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
