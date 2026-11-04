import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/state/cart_state.dart';
import '../../../core/localization/app_locale.dart';

class OrderConfirmationDialog extends StatelessWidget {
  final CartState cartState;
  final LocaleProvider localeProvider;
  final VoidCallback onDismiss;

  const OrderConfirmationDialog({
    super.key,
    required this.cartState,
    required this.localeProvider,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final totalAmount = cartState.totalAmountIqd;
    final totalItems = cartState.totalItemCount;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Success Checkmark Circle
            Container(
              width: 68,
              height: 68,
              decoration: const BoxDecoration(
                color: Color(0xFFE8F5E9),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Icon(Icons.check_circle, size: 48, color: Color(0xFF2E7D32)),
              ),
            ),

            const SizedBox(height: 16),

            // Order Confirmed Title
            Text(
              localeProvider.translate('order_confirmed'),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary,
              ),
            ),

            const SizedBox(height: 6),

            // Order ID Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.productBoxSurface,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                localeProvider.translate('order_id'),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Success message
            Text(
              localeProvider.translate('order_success_msg'),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),

            const SizedBox(height: 18),
            const Divider(),
            const SizedBox(height: 14),

            // Order Summary Details
            _buildDetailRow(
              localeProvider.translate('payment_method'),
              localeProvider.translate('cod'),
            ),
            const SizedBox(height: 8),
            _buildDetailRow(
              localeProvider.translate('items'),
              '$totalItems ${totalItems > 1 ? localeProvider.translate('items') : localeProvider.translate('item')}',
            ),
            const SizedBox(height: 8),
            _buildDetailRow(
              localeProvider.translate('total_amount'),
              'IQD $totalAmount',
              isBold: true,
              valueColor: AppColors.primaryOrange,
            ),

            const SizedBox(height: 22),

            // Done Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  cartState.clearCart();
                  onDismiss();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryOrange,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  elevation: 2,
                ),
                child: Text(
                  localeProvider.translate('done'),
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isBold = false, Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.w700,
            color: valueColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
