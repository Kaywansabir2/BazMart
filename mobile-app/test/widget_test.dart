import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bazmart/main.dart';

void main() {
  testWidgets('BazMartApp root widget pump smoke test in mobile viewport', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(390 * 2, 844 * 2);
    tester.view.devicePixelRatio = 2.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    // Build BazMartApp and trigger initial frame
    await tester.pumpWidget(const BazMartApp());
    await tester.pump();

    // Verify BazMart root app mounts cleanly
    expect(find.byType(BazMartApp), findsOneWidget);
  });
}
