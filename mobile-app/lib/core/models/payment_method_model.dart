import 'package:flutter/material.dart';

enum PaymentType { cod, fastPay, zainCash, fib, card }

abstract class PaymentGatewayAdapter {
  String get id;
  String get name;
  String get subtitle;
  IconData get icon;
  bool get isEnabled;
  PaymentType get type;

  Future<bool> processPayment({required int amountIqd, required String orderId});
}

class CodPaymentAdapter implements PaymentGatewayAdapter {
  @override
  String get id => 'cod';

  @override
  String get name => 'Cash on Delivery (COD)';

  @override
  String get subtitle => 'Pay cash to courier upon arrival';

  @override
  IconData get icon => Icons.payments_outlined;

  @override
  bool get isEnabled => true;

  @override
  PaymentType get type => PaymentType.cod;

  @override
  Future<bool> processPayment({required int amountIqd, required String orderId}) async {
    // COD is always successfully approved on placement
    return true;
  }
}

class FastPayPaymentAdapter implements PaymentGatewayAdapter {
  @override
  String get id => 'fastpay';

  @override
  String get name => 'FastPay Wallet';

  @override
  String get subtitle => 'Kurdistan direct digital wallet';

  @override
  IconData get icon => Icons.account_balance_wallet_outlined;

  @override
  bool get isEnabled => false; // Strategy Gateway Ready for Phase 2

  @override
  PaymentType get type => PaymentType.fastPay;

  @override
  Future<bool> processPayment({required int amountIqd, required String orderId}) async {
    return false;
  }
}

class ZainCashPaymentAdapter implements PaymentGatewayAdapter {
  @override
  String get id => 'zaincash';

  @override
  String get name => 'ZainCash';

  @override
  String get subtitle => 'National mobile money';

  @override
  IconData get icon => Icons.phone_android_outlined;

  @override
  bool get isEnabled => false; // Strategy Gateway Ready for Phase 2

  @override
  PaymentType get type => PaymentType.zainCash;

  @override
  Future<bool> processPayment({required int amountIqd, required String orderId}) async {
    return false;
  }
}

class FibPaymentAdapter implements PaymentGatewayAdapter {
  @override
  String get id => 'fib';

  @override
  String get name => 'First Iraqi Bank (FIB)';

  @override
  String get subtitle => 'Direct instant bank QR transfer';

  @override
  IconData get icon => Icons.account_balance_outlined;

  @override
  bool get isEnabled => false; // Strategy Gateway Ready for Phase 2

  @override
  PaymentType get type => PaymentType.fib;

  @override
  Future<bool> processPayment({required int amountIqd, required String orderId}) async {
    return false;
  }
}

class CardPaymentAdapter implements PaymentGatewayAdapter {
  @override
  String get id => 'card';

  @override
  String get name => 'Visa / Mastercard';

  @override
  String get subtitle => 'Credit and debit cards';

  @override
  IconData get icon => Icons.credit_card_outlined;

  @override
  bool get isEnabled => false; // Strategy Gateway Ready for Phase 2

  @override
  PaymentType get type => PaymentType.card;

  @override
  Future<bool> processPayment({required int amountIqd, required String orderId}) async {
    return false;
  }
}
