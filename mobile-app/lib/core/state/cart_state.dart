import 'package:flutter/material.dart';
import '../models/product_model.dart';
import '../models/cart_item_model.dart';
import '../models/payment_method_model.dart';

class CartState extends ChangeNotifier {
  static const int minOrderThresholdIqd = 7000;

  final Map<String, CartItemModel> _items = {};
  PaymentGatewayAdapter _selectedPayment = CodPaymentAdapter();
  String? _appliedCouponCode;
  int _couponDiscountIqd = 0;
  String? _couponTitle;
  int _couponMinSubtotalIqd = 0;
  String? _activeOrderNumber;
  String? _activeOrderStatus;
  int? _activeOrderTotalIqd;

  Map<String, CartItemModel> get items => Map.unmodifiable(_items);

  List<CartItemModel> get itemList => _items.values.toList();

  PaymentGatewayAdapter get selectedPayment => _selectedPayment;

  String? get appliedCouponCode => _appliedCouponCode;
  int get couponDiscountIqd => _couponDiscountIqd;
  String? get couponTitle => _couponTitle;
  int get couponMinSubtotalIqd => _couponMinSubtotalIqd;

  String? get activeOrderNumber => _activeOrderNumber;
  String? get activeOrderStatus => _activeOrderStatus;
  int? get activeOrderTotalIqd => _activeOrderTotalIqd;

  void setActiveOrder({required String orderNumber, String status = 'PLACED', int? totalIqd}) {
    _activeOrderNumber = orderNumber;
    _activeOrderStatus = status;
    _activeOrderTotalIqd = totalIqd;
    notifyListeners();
  }

  void clearActiveOrder() {
    _activeOrderNumber = null;
    _activeOrderStatus = null;
    _activeOrderTotalIqd = null;
    notifyListeners();
  }

  int get finalTotalIqd {
    final net = totalAmountIqd - _couponDiscountIqd;
    return net > 0 ? net : 0;
  }

  int get totalItemCount {
    int count = 0;
    for (var item in _items.values) {
      count += item.quantity;
    }
    return count;
  }

  int get totalAmountIqd {
    int total = 0;
    for (var item in _items.values) {
      total += item.totalIqd;
    }
    return total;
  }

  bool get isEmpty => _items.isEmpty;

  bool get isMinimumOrderMet => totalAmountIqd >= minOrderThresholdIqd;

  int get remainingForMinOrder {
    if (isMinimumOrderMet) return 0;
    return minOrderThresholdIqd - totalAmountIqd;
  }

  double get minOrderProgress {
    if (totalAmountIqd <= 0) return 0.0;
    final progress = totalAmountIqd / minOrderThresholdIqd;
    return progress > 1.0 ? 1.0 : progress;
  }

  int getQuantity(String productId) {
    return _items[productId]?.quantity ?? 0;
  }

  bool addToCart(ProductModel product) {
    if (_items.containsKey(product.id)) {
      if (_items[product.id]!.quantity < product.stockQuantity) {
        _items[product.id]!.quantity += 1;
        notifyListeners();
        return true;
      } else {
        return false; // Reached max ERP warehouse stock
      }
    } else {
      if (product.stockQuantity > 0) {
        _items[product.id] = CartItemModel(product: product, quantity: 1);
        notifyListeners();
        return true;
      }
      return false;
    }
  }

  void applyCoupon({
    required String code,
    required int discountIqd,
    String? title,
    int minSubtotal = 0,
  }) {
    _appliedCouponCode = code;
    _couponDiscountIqd = discountIqd;
    _couponTitle = title;
    _couponMinSubtotalIqd = minSubtotal;
    notifyListeners();
  }

  void removeCoupon() {
    _appliedCouponCode = null;
    _couponDiscountIqd = 0;
    _couponTitle = null;
    _couponMinSubtotalIqd = 0;
    notifyListeners();
  }

  void _checkCouponThreshold() {
    if (_appliedCouponCode != null && totalAmountIqd < _couponMinSubtotalIqd) {
      removeCoupon();
    }
  }

  void decrementQuantity(String productId) {
    if (_items.containsKey(productId)) {
      if (_items[productId]!.quantity > 1) {
        _items[productId]!.quantity -= 1;
      } else {
        _items.remove(productId);
      }
      _checkCouponThreshold();
      notifyListeners();
    }
  }

  void removeItem(String productId) {
    if (_items.containsKey(productId)) {
      _items.remove(productId);
      _checkCouponThreshold();
      notifyListeners();
    }
  }

  void clearCart() {
    _items.clear();
    removeCoupon();
    notifyListeners();
  }

  void setPaymentMethod(PaymentGatewayAdapter method) {
    _selectedPayment = method;
    notifyListeners();
  }
}
