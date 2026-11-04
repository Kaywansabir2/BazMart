import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/product_model.dart';
import '../data/mock_erp_catalog.dart';
import '../utils/linguistic_normalizer.dart';

class ApiClient {
  static const String baseUrl = 'http://localhost:4001/api/v1';

  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  bool _isBackendReachable = true;
  bool get isBackendReachable => _isBackendReachable;

  Future<Map<String, dynamic>> fetchHomeData() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/catalog/home'))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        _isBackendReachable = true;
        return body['data'] as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('[ApiClient] Backend not reachable, using local ERP mock fallback: $e');
      _isBackendReachable = false;
    }

    // Seamless offline fallback
    return {
      'categories': MockErpCatalog.allCategories,
      'brands': MockErpCatalog.allBrands,
      'countries': MockErpCatalog.allCountries,
      'buyAgain': MockErpCatalog.buyAgainProducts,
      'bestSellers': MockErpCatalog.bestSellers,
      'topSavers': MockErpCatalog.topSavers,
      'freshPicks': MockErpCatalog.freshPicks,
      'tabascoNoodles': MockErpCatalog.tabascoNoodles,
      'icedCoffees': MockErpCatalog.nescafeIced,
      'usuals': MockErpCatalog.frequentlyBoughtTogether,
      'allProducts': MockErpCatalog.allProducts,
    };
  }

  Future<List<ProductModel>> searchProducts(String query) async {
    if (query.trim().isEmpty) return [];

    final normalized = normalizeKurdishArabicText(query);
    try {
      final encoded = Uri.encodeComponent(query.trim());
      final response = await http
          .get(Uri.parse('$baseUrl/catalog/search?q=$encoded'))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        final List items = body['data'] ?? [];
        return items.map((jsonItem) => _parseProduct(jsonItem)).toList();
      }
    } catch (e) {
      debugPrint('[ApiClient] Search fallback: $e');
    }

    // Local multi-lingual normalized search fallback
    return MockErpCatalog.allProducts.where((p) {
      final normName = normalizeKurdishArabicText(p.name);
      final normBrand = normalizeKurdishArabicText(p.brand);
      final normCat = normalizeKurdishArabicText(p.category);
      final normCkb = normalizeKurdishArabicText(p.nameCkb ?? '');
      final normAr = normalizeKurdishArabicText(p.nameAr ?? '');
      return normName.contains(normalized) ||
          normBrand.contains(normalized) ||
          normCat.contains(normalized) ||
          normCkb.contains(normalized) ||
          normAr.contains(normalized) ||
          p.barcode.contains(normalized);
    }).toList();
  }

  Future<Map<String, dynamic>> submitOrder({
    required String customerName,
    required String customerPhone,
    required Map<String, dynamic> address,
    required List<Map<String, dynamic>> items,
    required String paymentMethod,
    String? idempotencyKey,
    String? warehouseId,
    String? couponCode,
    int riderTipIqd = 0,
    String unavailableItemPreference = 'REPLACE_WITH_BEST_MATCH',
    Map<String, dynamic>? deliveryDropoffOptions,
    bool useWallet = false,
  }) async {
    final payload = {
      'customerName': customerName,
      'customerPhone': normalizeEasternNumerals(customerPhone),
      'address': address,
      'items': items,
      'paymentMethod': paymentMethod,
      'riderTipIqd': riderTipIqd,
      'unavailableItemPreference': unavailableItemPreference,
      if (deliveryDropoffOptions != null) 'deliveryDropoffOptions': deliveryDropoffOptions,
      'useWallet': useWallet,
      if (warehouseId != null) 'warehouseId': warehouseId,
      if (couponCode != null) 'couponCode': couponCode,
    };

    final headers = {
      'Content-Type': 'application/json',
      if (idempotencyKey != null) 'idempotency-key': idempotencyKey,
    };

    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/orders'),
            headers: headers,
            body: json.encode(payload),
          )
          .timeout(const Duration(seconds: 6));

      final body = json.decode(response.body);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return body['data'] as Map<String, dynamic>;
      } else {
        return {
          'error': true,
          'statusCode': response.statusCode,
          'message': body['message'] ?? 'Order error',
          'errorCode': body['error'] ?? 'UNKNOWN_ERROR',
          'updatedItems': body['updatedItems'] ?? [],
        };
      }
    } catch (e) {
      debugPrint('[ApiClient] Order submission network fallback: $e');
    }

    // Fallback simulation
    final randOrderNumber = 'BM-${10000 + (DateTime.now().millisecondsSinceEpoch % 89999)}';
    return {
      'order': {
        'id': 'local-$randOrderNumber',
        'orderNumber': randOrderNumber,
        'assignedDriverName': 'Karwan Ahmed',
        'assignedDriverPhone': '+964 750 491 8822',
        'estimatedDeliveryMinutes': '15 - 20 mins',
        'orderStatus': 'PLACED',
        'paymentMethod': paymentMethod,
        'totalIqd': items.fold<int>(0, (sum, i) => sum + ((i['quantity'] as int) * 2250)),
        'createdAt': DateTime.now().toIso8601String(),
      },
      'payment': {
        'success': true,
        'transactionReference': 'COD-$randOrderNumber',
        'paymentStatus': 'PENDING_COD',
      }
    };
  }

  ProductModel _parseProduct(Map<String, dynamic> json) {
    final originalPrice = json['originalPriceIqd'] ?? 0;
    final discountedPrice = json['discountedPriceIqd'];
    final discountPercent = json['discountPercentage'];
    final effectivePrice = (discountedPrice != null && discountedPrice > 0) ? discountedPrice as int : originalPrice as int;
    final oldPrice = (discountedPrice != null && discountedPrice > 0) ? originalPrice as int : null;

    return ProductModel(
      id: json['id'] ?? '',
      externalErpId: json['externalErpId'] ?? '',
      name: json['titleEn'] ?? '',
      nameCkb: json['titleCkb'],
      nameAr: json['titleAr'],
      brand: json['brand'] != null ? (json['brand']['name'] ?? 'Local') : 'Local',
      unit: json['unitText'] ?? '1 Piece',
      priceIqd: effectivePrice,
      oldPriceIqd: oldPrice,
      discountPercent: discountPercent,
      stockQuantity: json['stockQuantity'] ?? 50,
      storageTemp: json['storageTemp'],
      sku: json['barcode'] ?? json['externalErpId'] ?? 'SKU-001',
      barcode: json['barcode'] ?? '628000000000',
      category: json['category'] != null ? (json['category']['nameEn'] ?? 'Groceries') : 'Groceries',
      imageUrl: json['imageUrl'] ?? 'milk_alrahma',
      badgeLabel: discountPercent != null && discountPercent > 0 ? 'Save $discountPercent%' : null,
    );
  }

  // --- Auth & Customer Account API ---

  Future<Map<String, dynamic>> requestOtp(String phone) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/request-otp'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({'phone': phone}),
          )
          .timeout(const Duration(seconds: 4));

      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        return {'success': true, ...data};
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to send OTP',
          'errorCode': data['error'] ?? 'INVALID_PHONE',
        };
      }
    } catch (e) {
      debugPrint('[ApiClient] requestOtp fallback: $e');
      return {
        'success': true,
        'normalizedPhone': phone,
        'devOtpHint': '123456',
        'messageEn': 'Dev Fixed OTP: 123456',
      };
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otpCode) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/verify-otp'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({'phone': phone, 'otpCode': otpCode}),
          )
          .timeout(const Duration(seconds: 4));

      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        return {'success': true, ...data};
      } else {
        return {
          'success': false,
          'statusCode': response.statusCode,
          'message': data['message'] ?? 'Invalid OTP code',
          'errorCode': data['error'] ?? 'INVALID_OTP',
        };
      }
    } catch (e) {
      debugPrint('[ApiClient] verifyOtp fallback: $e');
      if (otpCode == '123456') {
        return {
          'success': true,
          'accessToken': 'local-dev-token',
          'customer': {
            'id': 'local-ako',
            'phone': phone,
            'name': 'Ako Muhamad',
            'preferredLanguage': 'en',
            'orderCount': 2,
            'addresses': [
              {
                'id': 'a1',
                'title': 'Home',
                'city': 'Sulaymaniyah',
                'neighborhood': 'Bakhtiari',
                'street': 'Street 24',
                'building': 'House 12',
                'isDefault': true,
              },
            ],
          },
        };
      }
      return {
        'success': false,
        'message': 'Invalid OTP code. Please use 123456.',
        'errorCode': 'INVALID_OTP',
      };
    }
  }

  Future<Map<String, dynamic>> fetchCustomerOrders(String phone) async {
    try {
      final encodedPhone = Uri.encodeComponent(phone);
      final response = await http
          .get(Uri.parse('$baseUrl/customer/orders?phone=$encodedPhone'))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final list = data['orders'] ?? data['data'] ?? [];
        return {'success': true, 'orders': list};
      }
    } catch (e) {
      debugPrint('[ApiClient] fetchCustomerOrders fallback: $e');
    }
    return {'success': true, 'orders': []};
  }

  Future<Map<String, dynamic>> reorderPastOrder(String orderId, String phone) async {
    try {
      final encodedPhone = Uri.encodeComponent(phone);
      final response = await http
          .post(
            Uri.parse('$baseUrl/customer/orders/$orderId/reorder?phone=$encodedPhone'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (e) {
      debugPrint('[ApiClient] reorderPastOrder fallback: $e');
    }
    return {'success': false, 'reorderItems': []};
  }

  Future<List<ProductModel>> fetchPersonalizedProducts(String? phone) async {
    try {
      final url = phone != null
          ? '$baseUrl/customer/personalized-products?phone=${Uri.encodeComponent(phone)}'
          : '$baseUrl/customer/personalized-products';
      final response = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final prods = data['products'] as List<dynamic>? ?? [];
        return prods.map((p) => _parseProduct(p as Map<String, dynamic>)).toList();
      }
    } catch (e) {
      debugPrint('[ApiClient] fetchPersonalizedProducts fallback: $e');
    }
    return MockErpCatalog.buyAgainProducts;
  }

  Future<Map<String, dynamic>> fetchNotifications({String? phone, String? type}) async {
    try {
      final queryParams = <String, String>{};
      if (phone != null && phone.isNotEmpty) queryParams['phone'] = phone;
      if (type != null && type.isNotEmpty && type != 'ALL') queryParams['type'] = type;

      final uri = Uri.parse('$baseUrl/notifications').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
      final response = await http.get(uri).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (e) {
      debugPrint('[ApiClient] fetchNotifications fallback: $e');
    }
    return {'success': true, 'unreadCount': 0, 'notifications': []};
  }

  Future<bool> markNotificationRead(String id) async {
    try {
      final response = await http
          .patch(Uri.parse('$baseUrl/notifications/$id/read'))
          .timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('[ApiClient] markNotificationRead error: $e');
      return false;
    }
  }

  Future<bool> markAllNotificationsRead({String? phone}) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/notifications/read-all'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode({if (phone != null) 'phone': phone}),
          )
          .timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('[ApiClient] markAllNotificationsRead error: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>> fetchLiveOrderStatus(String orderId) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/orders/$orderId/live-status'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (e) {
      debugPrint('[ApiClient] fetchLiveOrderStatus fallback: $e');
    }
    return {'success': false};
  }

  Future<Map<String, dynamic>> rateOrder(String orderId, Map<String, dynamic> ratingData) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/orders/$orderId/rate'),
            headers: {'Content-Type': 'application/json'},
            body: json.encode(ratingData),
          )
          .timeout(const Duration(seconds: 4));
      return json.decode(response.body);
    } catch (e) {
      debugPrint('[ApiClient] rateOrder fallback: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> completeRegistration({
    required String phone,
    required String name,
    String? email,
    String preferredLanguage = 'en',
    Map<String, dynamic>? address,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/complete-registration'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone': normalizeEasternNumerals(phone),
          'name': name,
          'email': email,
          'preferredLanguage': preferredLanguage,
          if (address != null) 'address': address,
        }),
      ).timeout(const Duration(seconds: 4));
      return json.decode(response.body);
    } catch (e) {
      debugPrint('[ApiClient] completeRegistration fallback: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<bool> logout({String? phone, String? token}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: {
          'Content-Type': 'application/json',
          if (phone != null) 'x-customer-phone': phone,
          if (token != null) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 4));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('[ApiClient] logout fallback: $e');
      return true;
    }
  }

  Future<Map<String, dynamic>> deleteAccount({required String phone}) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/customer/account'),
        headers: {
          'Content-Type': 'application/json',
          'x-customer-phone': phone,
        },
      ).timeout(const Duration(seconds: 4));
      return json.decode(response.body);
    } catch (e) {
      debugPrint('[ApiClient] deleteAccount fallback: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> syncGuestState({
    required String phone,
    List<String>? favoriteProductIds,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/customer/sync-guest-state'),
        headers: {
          'Content-Type': 'application/json',
          'x-customer-phone': phone,
        },
        body: json.encode({
          'favoriteProductIds': favoriteProductIds ?? [],
        }),
      ).timeout(const Duration(seconds: 4));
      return json.decode(response.body);
    } catch (e) {
      debugPrint('[ApiClient] syncGuestState fallback: $e');
      return {'success': false};
    }
  }

  Future<Map<String, dynamic>> fetchWallet({required String phone}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/customer/wallet'),
        headers: {'x-customer-phone': phone},
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (e) {
      debugPrint('[ApiClient] fetchWallet fallback: $e');
    }
    return {'success': true, 'balanceIqd': 5000, 'transactions': []};
  }

  Future<Map<String, dynamic>> toggleFavorite({required String phone, required String productId}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/customer/favorites/toggle'),
        headers: {
          'Content-Type': 'application/json',
          'x-customer-phone': phone,
        },
        body: json.encode({'productId': productId}),
      ).timeout(const Duration(seconds: 4));
      return json.decode(response.body);
    } catch (e) {
      debugPrint('[ApiClient] toggleFavorite fallback: $e');
      return {'success': false};
    }
  }

  Future<Map<String, dynamic>> subscribeStockAlert({
    required String phone,
    required String productId,
    String warehouseId = 'erbil-central-darkstore',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/catalog/products/$productId/notify-when-available'),
        headers: {
          'Content-Type': 'application/json',
          'x-customer-phone': phone,
        },
        body: json.encode({
          'phone': phone,
          'warehouseId': warehouseId,
        }),
      ).timeout(const Duration(seconds: 4));
      return json.decode(response.body);
    } catch (e) {
      debugPrint('[ApiClient] subscribeStockAlert fallback: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> reportOrderIssue({
    required String orderId,
    required String phone,
    required String issueCategory,
    required int requestedRefundIqd,
    String? customerNote,
    List<String>? affectedOrderItemIds,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/customer/orders/$orderId/report-issue'),
        headers: {
          'Content-Type': 'application/json',
          'x-customer-phone': phone,
        },
        body: json.encode({
          'issueCategory': issueCategory,
          'requestedRefundIqd': requestedRefundIqd,
          'customerNote': customerNote,
          'affectedOrderItemIds': affectedOrderItemIds ?? [],
        }),
      ).timeout(const Duration(seconds: 4));
      return json.decode(response.body);
    } catch (e) {
      debugPrint('[ApiClient] reportOrderIssue fallback: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<List<dynamic>> fetchSupportTickets({required String phone}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/customer/support-tickets'),
        headers: {'x-customer-phone': phone},
      ).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        return body['data'] as List<dynamic>? ?? [];
      }
    } catch (e) {
      debugPrint('[ApiClient] fetchSupportTickets fallback: $e');
    }
    return [];
  }

  Future<dynamic> get(String path) async {
    try {
      final fullUrl = path.startsWith('http') ? path : '$baseUrl${path.startsWith('/') ? path : '/$path'}';
      final response = await http.get(Uri.parse(fullUrl)).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (e) {
      debugPrint('[ApiClient] get $path fallback: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> fetchProductByBarcode(String barcode) async {
    final res = await get('/catalog/barcode/$barcode');
    if (res is Map<String, dynamic>) {
      return res;
    }
    return null;
  }
}
