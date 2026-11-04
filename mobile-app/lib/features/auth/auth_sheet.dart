import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../core/state/auth_state.dart';
import '../../core/localization/app_locale.dart';
import '../../core/localization/app_translations.dart';
import '../../core/theme/app_theme.dart';

class AuthSheet extends StatefulWidget {
  final VoidCallback? onSuccess;
  final int initialStep;
  final String? initialErrorMessage;

  const AuthSheet({
    super.key,
    this.onSuccess,
    this.initialStep = 1,
    this.initialErrorMessage,
  });

  static Future<bool?> show(
    BuildContext context, {
    VoidCallback? onSuccess,
    int initialStep = 1,
    String? initialErrorMessage,
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AuthSheet(
        onSuccess: onSuccess,
        initialStep: initialStep,
        initialErrorMessage: initialErrorMessage,
      ),
    );
  }

  @override
  State<AuthSheet> createState() => _AuthSheetState();
}

class _AuthSheetState extends State<AuthSheet> {
  final TextEditingController _phoneController = TextEditingController(text: '07701234567');
  final TextEditingController _nameController = TextEditingController(text: 'Saman Rekani');
  final TextEditingController _emailController = TextEditingController(text: 'saman.rekani@bazmart.iq');
  String _selectedLanguage = 'ckb';
  String _selectedCity = 'Sulaymaniyah';
  final List<TextEditingController> _otpControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  late int _step;
  bool _isLoading = false;
  String? _errorMessage;
  String? _normalizedPhone;

  @override
  void initState() {
    super.initState();
    _step = widget.initialStep;
    _errorMessage = widget.initialErrorMessage;
    if (_step == 2) {
      _normalizedPhone = '+9647701234567';
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    for (var c in _otpControllers) {
      c.dispose();
    }
    for (var f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String _getLocalizedError(String key, String lang) {
    if (key == 'digits') {
      return lang == 'ckb'
          ? 'تکایە هەر ٦ ژمارەکەی کۆدی چوونەژوورەوە بنووسە.'
          : (lang == 'ar' ? 'يرجى إدخال جميع أرقام رمز التحقق الستة.' : 'Please enter all 6 digits of the OTP code.');
    }
    if (key == 'invalid_otp') {
      return lang == 'ckb'
          ? 'کۆدی چوونەژوورەوە هەڵەیە. تکایە ١٢٣٤٥٦ بەکاربهێنە.'
          : (lang == 'ar' ? 'رمز التحقق غير صحيح. يرجى استخدام 123456.' : 'Invalid OTP code. Please use 123456.');
    }
    if (key == 'name_required') {
      return lang == 'ckb'
          ? 'تکایە ناوی تەواوت بنووسە.'
          : (lang == 'ar' ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your full name.');
    }
    if (key == 'failed_otp') {
      return lang == 'ckb'
          ? 'ناردنی کۆدی چوونەژوورەوە سەرکەوتوو نەبوو.'
          : (lang == 'ar' ? 'فشل إرسال رمز التحقق.' : 'Failed to send OTP code.');
    }
    return key;
  }

  Future<void> _handleSendOtp() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final phone = _phoneController.text.trim();
    final res = await ApiClient().requestOtp(phone);

    setState(() {
      _isLoading = false;
    });

    if (res['success'] == true) {
      setState(() {
        _normalizedPhone = res['normalizedPhone'] ?? phone;
        _step = 2;
      });
      // Focus first OTP field
      Future.delayed(const Duration(milliseconds: 100), () {
        if (mounted) _focusNodes[0].requestFocus();
      });
    } else {
      final lang = LocaleProvider().currentLanguage;
      setState(() {
        _errorMessage = res['message'] ?? _getLocalizedError('failed_otp', lang);
      });
    }
  }

  Future<void> _handleVerifyOtp([String? codeOverride]) async {
    final lang = LocaleProvider().currentLanguage;
    final code = codeOverride ??
        _otpControllers.map((c) => c.text).join('').trim();

    if (code.length != 6) {
      setState(() {
        _errorMessage = _getLocalizedError('digits', lang);
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final phone = _normalizedPhone ?? _phoneController.text.trim();
    final res = await ApiClient().verifyOtp(phone, code);

    setState(() {
      _isLoading = false;
    });

    if (res['success'] == true && res['customer'] != null) {
      final isNewUser = res['isNewUser'] == true;
      if (isNewUser) {
        setState(() {
          _step = 3;
          _errorMessage = null;
        });
        return;
      }

      AuthState().login(
        accessToken: res['accessToken'] ?? 'dev-token',
        customer: res['customer'] as Map<String, dynamic>,
      );

      ApiClient().syncGuestState(
        phone: phone,
        favoriteProductIds: AuthState().favoriteProductIds.toList(),
      );

      if (widget.onSuccess != null) {
        widget.onSuccess!();
      }

      if (mounted) {
        Navigator.of(context).pop(true);
      }
    } else {
      setState(() {
        _errorMessage = res['message'] ?? _getLocalizedError('invalid_otp', lang);
      });
    }
  }

  Future<void> _handleCompleteRegistration() async {
    final lang = LocaleProvider().currentLanguage;
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      setState(() => _errorMessage = _getLocalizedError('name_required', lang));
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final phone = _normalizedPhone ?? _phoneController.text.trim();
    final res = await ApiClient().completeRegistration(
      phone: phone,
      name: name,
      email: _emailController.text.trim().isNotEmpty ? _emailController.text.trim() : null,
      preferredLanguage: _selectedLanguage,
      address: {
        'city': _selectedCity,
        'neighborhood': _selectedCity == 'Sulaymaniyah' ? 'Bakhtiari' : 'Dream City',
        'street': 'Street 14',
        'building': 'Building 5',
      },
    );

    setState(() => _isLoading = false);

    if (res['success'] == true && res['customer'] != null) {
      AuthState().login(
        accessToken: 'dev-token-step14',
        customer: res['customer'] as Map<String, dynamic>,
      );

      ApiClient().syncGuestState(
        phone: phone,
        favoriteProductIds: AuthState().favoriteProductIds.toList(),
      );

      if (widget.onSuccess != null) {
        widget.onSuccess!();
      }

      if (mounted) {
        Navigator.of(context).pop(true);
      }
    } else {
      setState(() => _errorMessage = res['message'] ?? 'Failed to complete registration.');
    }
  }

  void _quickFillOtp() {
    const devCode = '123456';
    for (int i = 0; i < 6; i++) {
      _otpControllers[i].text = devCode[i];
    }
    _handleVerifyOtp(devCode);
  }

  @override
  Widget build(BuildContext context) {
    final lang = LocaleProvider().currentLanguage;
    final isRtl = LocaleProvider().isRtl;

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: AnimatedPadding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        duration: const Duration(milliseconds: 200),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SafeArea(
            top: false,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Handle pill
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
                  const SizedBox(height: 18),

                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: AppColors.primaryOrange.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.phone_iphone_rounded,
                              color: AppColors.primaryOrange,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            _step == 1
                                ? AppTranslations.get('sign_in_or_register', lang)
                                : _step == 2
                                ? AppTranslations.get('enter_otp', lang)
                                : AppTranslations.get('complete_registration', lang),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, color: Colors.grey),
                        onPressed: () => Navigator.of(context).pop(false),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Dev Mode Banner
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.orange.shade200),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline, color: AppColors.primaryOrange, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            AppTranslations.get('dev_auth_hint', lang),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Colors.orange.shade900,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  if (_step == 1) ...[
                    // Step 1: Phone input
                    Text(
                      AppTranslations.get('phone_number', lang),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                            decoration: BoxDecoration(
                              border: BorderDirectional(
                                end: BorderSide(color: Colors.grey.shade300),
                              ),
                            ),
                            child: const Row(
                              children: [
                                Text('🇮🇶', style: TextStyle(fontSize: 18)),
                                SizedBox(width: 6),
                                Text(
                                  '+964',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: TextField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 1.1,
                              ),
                              decoration: const InputDecoration(
                                hintText: '0770 123 4567',
                                hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(horizontal: 14),
                              ),
                              onSubmitted: (_) => _handleSendOtp(),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    if (_errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: Colors.red, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(color: Colors.red, fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryOrange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        onPressed: _isLoading ? null : _handleSendOtp,
                        child: _isLoading
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                AppTranslations.get('send_otp', lang),
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                    ),
                  ] else if (_step == 2) ...[
                    // Step 2: OTP verification
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          lang == 'ckb'
                              ? 'کۆد نێردرا بۆ $_normalizedPhone'
                              : (lang == 'ar' ? 'تم إرسال الرمز إلى $_normalizedPhone' : 'Code sent to $_normalizedPhone'),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        TextButton(
                          onPressed: () => setState(() => _step = 1),
                          child: Text(
                            lang == 'ckb' ? 'گۆڕین' : (lang == 'ar' ? 'تغيير' : 'Change'),
                            style: const TextStyle(
                              color: AppColors.primaryOrange,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Quick fill helper chip
                    Align(
                      alignment: Alignment.centerLeft,
                      child: ActionChip(
                        avatar: const Icon(Icons.flash_on, size: 14, color: AppColors.primaryOrange),
                        label: Text(
                          AppTranslations.get('quick_fill_otp', lang),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryOrange,
                          ),
                        ),
                        backgroundColor: Colors.orange.shade50,
                        side: BorderSide(color: Colors.orange.shade200),
                        onPressed: _quickFillOtp,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // 6 OTP boxes
                    Directionality(
                      textDirection: TextDirection.ltr,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(6, (index) {
                          return SizedBox(
                            width: 44,
                            height: 52,
                            child: TextField(
                              controller: _otpControllers[index],
                              focusNode: _focusNodes[index],
                              textAlign: TextAlign.center,
                              keyboardType: TextInputType.number,
                              maxLength: 1,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: Colors.black87,
                              ),
                              decoration: InputDecoration(
                                counterText: '',
                                filled: true,
                                fillColor: Colors.grey.shade100,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(color: Colors.grey.shade300),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: const BorderSide(
                                    color: AppColors.primaryOrange,
                                    width: 2,
                                  ),
                                ),
                              ),
                              onChanged: (val) {
                                if (val.isNotEmpty && index < 5) {
                                  _focusNodes[index + 1].requestFocus();
                                } else if (val.isEmpty && index > 0) {
                                  _focusNodes[index - 1].requestFocus();
                                }
                                if (index == 5 && val.isNotEmpty) {
                                  _handleVerifyOtp();
                                }
                              },
                            ),
                          );
                        }),
                      ),
                    ),
                    const SizedBox(height: 16),

                    if (_errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: Colors.red, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: Colors.red,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryOrange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        onPressed: _isLoading ? null : () => _handleVerifyOtp(),
                        child: _isLoading
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                AppTranslations.get('verify_and_continue', lang),
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                    ),
                  ] else if (_step == 3) ...[
                    // Step 3: Complete Account Registration
                    Text(
                      AppTranslations.get('full_name', lang),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _nameController,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      decoration: InputDecoration(
                        hintText: 'e.g. Ako Muhamad',
                        prefixIcon: const Icon(Icons.person_outline, size: 20, color: AppColors.primaryOrange),
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.grey.shade300),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    Text(
                      '${AppTranslations.get('email', lang)} (${lang == 'ckb' ? 'ئارەزوومەندانە' : (lang == 'ar' ? 'اختياري' : 'Optional')})',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      decoration: InputDecoration(
                        hintText: 'ako@example.com',
                        prefixIcon: const Icon(Icons.email_outlined, size: 20, color: Colors.grey),
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.grey.shade300),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    Text(
                      AppTranslations.get('preferred_language', lang),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        ChoiceChip(
                          label: const Text('کوردی'),
                          selected: _selectedLanguage == 'ckb',
                          onSelected: (val) {
                            if (val) setState(() => _selectedLanguage = 'ckb');
                          },
                        ),
                        const SizedBox(width: 8),
                        ChoiceChip(
                          label: const Text('عربي'),
                          selected: _selectedLanguage == 'ar',
                          onSelected: (val) {
                            if (val) setState(() => _selectedLanguage = 'ar');
                          },
                        ),
                        const SizedBox(width: 8),
                        ChoiceChip(
                          label: const Text('English'),
                          selected: _selectedLanguage == 'en',
                          onSelected: (val) {
                            if (val) setState(() => _selectedLanguage = 'en');
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    Text(
                      AppTranslations.get('default_city', lang),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        ChoiceChip(
                          label: const Text('Sulaymaniyah (سلێمانی)'),
                          selected: _selectedCity == 'Sulaymaniyah',
                          onSelected: (val) {
                            if (val) setState(() => _selectedCity = 'Sulaymaniyah');
                          },
                        ),
                        const SizedBox(width: 8),
                        ChoiceChip(
                          label: const Text('Erbil (هەولێر)'),
                          selected: _selectedCity == 'Erbil',
                          onSelected: (val) {
                            if (val) setState(() => _selectedCity = 'Erbil');
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    if (_errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: Colors.red, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: Colors.red,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    SizedBox(
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryOrange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        onPressed: _isLoading ? null : _handleCompleteRegistration,
                        child: _isLoading
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                AppTranslations.get('save_and_start_shopping', lang),
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 10),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
