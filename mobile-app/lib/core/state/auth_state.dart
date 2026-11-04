import 'package:flutter/material.dart';

class CustomerAddressModel {
  final String id;
  final String title;
  final String city;
  final String neighborhood;
  final String street;
  final String building;
  final String? landmark;
  final double latitude;
  final double longitude;
  final bool isDefault;

  CustomerAddressModel({
    required this.id,
    required this.title,
    required this.city,
    required this.neighborhood,
    required this.street,
    required this.building,
    this.landmark,
    this.latitude = 36.1901,
    this.longitude = 44.0091,
    this.isDefault = false,
  });

  factory CustomerAddressModel.fromJson(Map<String, dynamic> json) {
    return CustomerAddressModel(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Home',
      city: json['city'] ?? 'Erbil',
      neighborhood: json['neighborhood'] ?? '',
      street: json['street'] ?? '',
      building: json['building'] ?? '',
      landmark: json['landmark'],
      latitude: (json['latitude'] as num?)?.toDouble() ?? 36.1901,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 44.0091,
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'city': city,
        'neighborhood': neighborhood,
        'street': street,
        'building': building,
        'landmark': landmark,
        'latitude': latitude,
        'longitude': longitude,
        'isDefault': isDefault,
      };
}

class AuthState extends ChangeNotifier {
  static final AuthState _instance = AuthState._internal();
  factory AuthState() => _instance;
  AuthState._internal();

  bool _isLoggedIn = false;
  String? _accessToken;
  String? _customerId;
  String? _name;
  String? _email;
  String? _phone;
  String _preferredLanguage = 'en';
  bool _isOnboarded = false;
  int _walletBalanceIqd = 0;
  int _orderCount = 0;
  final Set<String> _favoriteProductIds = {'p-alrahma', 'p-cucumber'};
  List<CustomerAddressModel> _addresses = [];
  CustomerAddressModel? _selectedAddress;

  bool get isLoggedIn => _isLoggedIn;
  String? get accessToken => _accessToken;
  String? get customerId => _customerId;
  String get name => _name ?? 'Guest';
  String? get email => _email;
  String? get phone => _phone;
  String get preferredLanguage => _preferredLanguage;
  bool get isOnboarded => _isOnboarded;
  int get walletBalanceIqd => _walletBalanceIqd;
  int get orderCount => _orderCount;
  Set<String> get favoriteProductIds => Set.unmodifiable(_favoriteProductIds);
  bool isFavorite(String productId) => _favoriteProductIds.contains(productId);
  List<CustomerAddressModel> get addresses => List.unmodifiable(_addresses);
  CustomerAddressModel? get selectedAddress => _selectedAddress;

  void setWalletBalance(int amount) {
    _walletBalanceIqd = amount;
    notifyListeners();
  }

  void toggleFavorite(String productId) {
    if (_favoriteProductIds.contains(productId)) {
      _favoriteProductIds.remove(productId);
    } else {
      _favoriteProductIds.add(productId);
    }
    notifyListeners();
  }

  void setFavoriteProductIds(Iterable<String> ids) {
    _favoriteProductIds.clear();
    _favoriteProductIds.addAll(ids);
    notifyListeners();
  }

  Map<String, dynamic>? get customer => _isLoggedIn
      ? {
          'id': _customerId,
          'name': _name,
          'email': _email,
          'phone': _phone,
          'preferredLanguage': _preferredLanguage,
          'isOnboarded': _isOnboarded,
          'walletBalanceIqd': _walletBalanceIqd,
          'orderCount': _orderCount,
        }
      : null;

  void login({
    required String accessToken,
    required Map<String, dynamic> customer,
  }) {
    _isLoggedIn = true;
    _accessToken = accessToken;
    _customerId = customer['id'];
    _name = customer['name'] ?? 'BazMart Customer';
    _email = customer['email'];
    _phone = customer['phone'];
    _preferredLanguage = customer['preferredLanguage'] ?? 'en';
    _isOnboarded = customer['isOnboarded'] ?? customer['is_onboarded'] ?? true;
    _walletBalanceIqd = customer['walletBalanceIqd'] ?? customer['wallet_balance_iqd'] ?? 5000;
    _orderCount = customer['orderCount'] ?? 0;

    final rawAddresses = customer['addresses'] as List<dynamic>? ?? [];
    _addresses = rawAddresses
        .map((a) => CustomerAddressModel.fromJson(a as Map<String, dynamic>))
        .toList();

    _selectedAddress = _addresses.firstWhere(
      (a) => a.isDefault,
      orElse: () => _addresses.isNotEmpty ? _addresses.first : _defaultFallbackAddress(),
    );

    notifyListeners();
  }

  void logout() {
    _isLoggedIn = false;
    _accessToken = null;
    _customerId = null;
    _name = null;
    _email = null;
    _phone = null;
    _isOnboarded = false;
    _walletBalanceIqd = 0;
    _orderCount = 0;
    _addresses = [];
    _selectedAddress = null;
    notifyListeners();
  }

  void updateName(String newName) {
    _name = newName.trim();
    notifyListeners();
  }

  void incrementOrderCount() {
    _orderCount++;
    notifyListeners();
  }

  void setAddresses(List<CustomerAddressModel> list) {
    _addresses = list;
    _selectedAddress = _addresses.firstWhere(
      (a) => a.isDefault,
      orElse: () => _addresses.isNotEmpty ? _addresses.first : _defaultFallbackAddress(),
    );
    notifyListeners();
  }

  void setDefaultAddress(String addressId) {
    final updated = <CustomerAddressModel>[];
    CustomerAddressModel? newDefault;
    for (var a in _addresses) {
      final isDef = a.id == addressId;
      final copy = CustomerAddressModel(
        id: a.id,
        title: a.title,
        city: a.city,
        neighborhood: a.neighborhood,
        street: a.street,
        building: a.building,
        landmark: a.landmark,
        latitude: a.latitude,
        longitude: a.longitude,
        isDefault: isDef,
      );
      if (isDef) newDefault = copy;
      updated.add(copy);
    }
    _addresses = updated;
    if (newDefault != null) {
      _selectedAddress = newDefault;
    }
    notifyListeners();
  }

  CustomerAddressModel _defaultFallbackAddress() {
    return CustomerAddressModel(
      id: 'default-suly',
      title: 'ماڵەوە (Home)',
      city: 'Sulaymaniyah',
      neighborhood: 'بەختیاری - شەقامی سالم',
      street: 'Salim Main Street',
      building: 'Building 14, Floor 3',
      latitude: 35.5669,
      longitude: 45.4167,
      isDefault: true,
    );
  }
}

