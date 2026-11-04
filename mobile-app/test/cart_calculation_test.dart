import 'package:flutter_test/flutter_test.dart';
import 'package:bazmart/core/state/cart_state.dart';
import 'package:bazmart/core/models/product_model.dart';

void main() {
  group('BazMart ERP Cart Calculations & Minimum Order Threshold Tests', () {
    late CartState cart;

    final alRahmaMilk = ProductModel(
      id: 'p-alrahma',
      externalErpId: 'BM-DAIRY-001',
      name: 'Al Rahma Low Fat Milk, 1L',
      brand: 'Al Rahma',
      unit: '1 L',
      priceIqd: 2250,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 5,
      storageTemp: 'Stored at 5°',
      sku: 'BM-DAIRY-001',
      barcode: '628100010001',
      category: 'Milk',
      imageUrl: 'assets/products/milk.png',
    );

    final rabbitLollipop = ProductModel(
      id: 'p-rabbit-lollipop',
      externalErpId: 'BM-SNACK-002',
      name: 'Rabbit Lollipop, 60g',
      brand: 'Rabbit',
      unit: '60g',
      priceIqd: 1250,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 10,
      storageTemp: 'Ambient',
      sku: 'BM-SNACK-002',
      barcode: '628100010008',
      category: 'Snacks & Chocolate',
      imageUrl: 'assets/products/lollipop.png',
    );

    final coconutMilk = ProductModel(
      id: 'p-coconut-milk',
      externalErpId: 'BM-PANTRY-001',
      name: 'Exotic Coconut Milk',
      brand: 'Exotic',
      unit: '400ml',
      priceIqd: 5250,
      oldPriceIqd: null,
      discountPercent: null,
      stockQuantity: 8,
      storageTemp: 'Ambient',
      sku: 'BM-PANTRY-001',
      barcode: '628100010007',
      category: 'Cooking & Baking',
      imageUrl: 'assets/products/coconut_milk.png',
    );

    final discountedCucumber = ProductModel(
      id: 'p-cucumber',
      externalErpId: 'BM-PRODUCE-001',
      name: 'Cucumber - Local, 1kg',
      brand: 'Fresh Produce',
      unit: '1kg',
      priceIqd: 1445,
      oldPriceIqd: 1700,
      discountPercent: 15,
      stockQuantity: 12,
      storageTemp: 'Stored at 5°',
      sku: 'BM-PRODUCE-001',
      barcode: '628100010003',
      category: 'Fruit & Veg',
      imageUrl: 'assets/products/cucumber.png',
      badgeLabel: 'Save 15%',
    );

    setUp(() {
      cart = CartState();
    });

    test('Initial cart is empty with IQD 0 and IQD 7000 remaining', () {
      expect(cart.isEmpty, isTrue);
      expect(cart.totalItemCount, 0);
      expect(cart.totalAmountIqd, 0);
      expect(cart.isMinimumOrderMet, isFalse);
      expect(cart.remainingForMinOrder, 7000);
      expect(cart.minOrderProgress, 0.0);
    });

    test('Adding 2x Milk (IQD 4500) + 1x Lollipop (IQD 1250) equals IQD 5750 with IQD 1250 remaining (< IQD 7000 threshold)', () {
      // Add 2x Al Rahma Milk (2 x 2250 = 4500)
      cart.addToCart(alRahmaMilk);
      cart.addToCart(alRahmaMilk);
      expect(cart.getQuantity(alRahmaMilk.id), 2);
      expect(cart.totalAmountIqd, 4500);

      // Add 1x Rabbit Lollipop (1250)
      cart.addToCart(rabbitLollipop);
      expect(cart.getQuantity(rabbitLollipop.id), 1);
      expect(cart.totalItemCount, 3);
      expect(cart.totalAmountIqd, 5750);

      // Verify minimum order threshold IQD 7000
      expect(cart.isMinimumOrderMet, isFalse);
      expect(cart.remainingForMinOrder, 1250); // 7000 - 5750 = 1250
      expect(cart.minOrderProgress, closeTo(5750 / 7000, 0.01));
    });

    test('Adding Coconut Milk (IQD 5250) pushes total to IQD 11000 and unlocks checkout', () {
      cart.addToCart(alRahmaMilk);
      cart.addToCart(alRahmaMilk);
      cart.addToCart(rabbitLollipop);
      expect(cart.totalAmountIqd, 5750);
      expect(cart.isMinimumOrderMet, isFalse);

      // Add Coconut Milk (5250) -> 5750 + 5250 = 11000
      cart.addToCart(coconutMilk);
      expect(cart.totalAmountIqd, 11000);
      expect(cart.isMinimumOrderMet, isTrue);
      expect(cart.remainingForMinOrder, 0);
      expect(cart.minOrderProgress, 1.0);
    });

    test('Discounted Cucumber calculates correct savings and subtotal', () {
      cart.addToCart(discountedCucumber);
      cart.addToCart(discountedCucumber);

      expect(cart.getQuantity(discountedCucumber.id), 2);
      expect(cart.totalAmountIqd, 2890); // 1445 * 2

      // Compare against regular price (1700 * 2 = 3400)
      final regularTotal = discountedCucumber.oldPriceIqd! * 2;
      final totalSaved = regularTotal - cart.totalAmountIqd;
      expect(regularTotal, 3400);
      expect(totalSaved, 510);
      expect(discountedCucumber.isOnSale, isTrue);
      expect(discountedCucumber.discountBadgeText, 'Save 15%');
    });

    test('ERP Stock Limit Enforcement prevents adding items above warehouse stock', () {
      // alRahmaMilk stockQuantity = 5
      for (int i = 0; i < 5; i++) {
        final success = cart.addToCart(alRahmaMilk);
        expect(success, isTrue, reason: 'Unit ${i + 1} should be added within stock limit');
      }
      expect(cart.getQuantity(alRahmaMilk.id), 5);

      // Attempting 6th unit should return false and not increment quantity
      final overLimitSuccess = cart.addToCart(alRahmaMilk);
      expect(overLimitSuccess, isFalse, reason: 'Should reject adding beyond stock limit of 5');
      expect(cart.getQuantity(alRahmaMilk.id), 5);
      expect(cart.totalAmountIqd, 5 * 2250);
    });

    test('Cart decrement and removal behavior', () {
      cart.addToCart(coconutMilk);
      cart.addToCart(coconutMilk);
      expect(cart.getQuantity(coconutMilk.id), 2);

      cart.decrementQuantity(coconutMilk.id);
      expect(cart.getQuantity(coconutMilk.id), 1);
      expect(cart.totalAmountIqd, 5250);

      cart.decrementQuantity(coconutMilk.id);
      expect(cart.getQuantity(coconutMilk.id), 0);
      expect(cart.isEmpty, isTrue);
    });
  });
}

