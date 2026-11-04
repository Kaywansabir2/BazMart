<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Order;
use Illuminate\Validation\ValidationException;

class PhoneAuthService
{
    public static function normalizeIraqiPhone(?string $rawPhone): string
    {
        if (!$rawPhone) {
            throw ValidationException::withMessages(['phone' => 'Mobile phone number is required.']);
        }

        // 1. Convert Kurdish/Arabic numerals to standard ASCII
        $cleaned = trim(LinguisticNormalizerService::normalizeEasternNumerals($rawPhone));

        // 2. Remove all spaces, dashes, dots, brackets
        $cleaned = preg_replace('/[\s\-\.\(\)]/', '', $cleaned);

        // 3. Remove leading international prefixes
        if (str_starts_with($cleaned, '00964')) {
            $cleaned = substr($cleaned, 5);
        } elseif (str_starts_with($cleaned, '+964')) {
            $cleaned = substr($cleaned, 4);
        } elseif (str_starts_with($cleaned, '964') && strlen($cleaned) >= 12) {
            $cleaned = substr($cleaned, 3);
        }

        // 4. Strip local leading 0 if present (e.g. 0770 -> 770)
        if (str_starts_with($cleaned, '0')) {
            $cleaned = substr($cleaned, 1);
        }

        // 5. Must now be 10 digits starting with 75, 77, 78, or 79
        if (!preg_match('/^7[5789]\d{8}$/', $cleaned)) {
            throw ValidationException::withMessages([
                'phone' => 'Invalid Iraqi mobile number. Must be a valid 10-digit number (e.g., 0750XXXXXXX, 0770XXXXXXX, 0780XXXXXXX).'
            ]);
        }

        return '+964' . $cleaned;
    }

    public function requestOtp(string $phone): array
    {
        $normalizedPhone = self::normalizeIraqiPhone($phone);

        return [
            'success' => true,
            'normalizedPhone' => $normalizedPhone,
            'devOtpHint' => '123456',
            'expiresInSeconds' => 300,
            'messageEn' => 'OTP code sent (Dev Fixed OTP: 123456)',
            'messageCkb' => 'کۆدی دڵنیابوونەوە نێردرا (کۆدی تاقیکاری: 123456)',
            'messageAr' => 'تم إرسال رمز التحقق (الرمز التجريبي: 123456)',
        ];
    }

    public function verifyOtp(string $phone, string $otpCode): array
    {
        $normalizedPhone = self::normalizeIraqiPhone($phone);
        $normalizedOtp = trim(LinguisticNormalizerService::normalizeEasternNumerals($otpCode));

        if ($normalizedOtp !== '123456') {
            throw ValidationException::withMessages([
                'otpCode' => 'Invalid OTP code. Please use 123456.',
            ]);
        }

        $rawDigits = substr($normalizedPhone, 4); // e.g. 7701234567
        $customer = Customer::where('phone', $normalizedPhone)
            ->orWhere('phone', '0' . $rawDigits)
            ->orWhere('phone', 'like', "%{$rawDigits}")
            ->first();
        $isExisting = ($customer !== null);

        if (!$customer) {
            $isVipSeed = in_array($normalizedPhone, ['+9647701234567', '+9647501234567']);
            $customer = Customer::create([
                'id' => 'cust-' . substr(md5($normalizedPhone), 0, 12),
                'phone' => $normalizedPhone,
                'name' => $isVipSeed ? 'ئاکۆ محەمەد (Ako Muhamad)' : 'BazMart Customer',
                'preferred_language' => 'ckb',
                'is_onboarded' => $isVipSeed,
                'wallet_balance_iqd' => $isVipSeed ? 25000 : 0,
                'api_token' => 'token-' . bin2hex(random_bytes(24)),
                'status' => 'ACTIVE',
                'last_login_at' => now(),
            ]);

            if ($isVipSeed) {
                CustomerAddress::create([
                    'id' => 'addr-' . substr(md5($normalizedPhone . 'home'), 0, 10),
                    'customer_id' => $customer->id,
                    'title' => 'ماڵەوە (Home)',
                    'city' => 'هەولێر (Erbil)',
                    'neighborhood' => 'دریم ستی (Dream City)',
                    'street' => 'کۆڵانی ١٢',
                    'building' => 'ڤێلا ٥',
                    'landmark' => 'نزیک بەنزینخانەی دریم ستی',
                    'is_default' => true,
                ]);
                CustomerAddress::create([
                    'id' => 'addr-' . substr(md5($normalizedPhone . 'work'), 0, 10),
                    'customer_id' => $customer->id,
                    'title' => 'ئۆفیس (Office)',
                    'city' => 'هەولێر (Erbil)',
                    'neighborhood' => 'ئیمپایەر وۆڕڵد (Empire World)',
                    'street' => 'تاوەری ٤',
                    'building' => 'نهۆمی ١٠',
                    'landmark' => 'بەرامبەر فڕۆکەخانە',
                    'is_default' => false,
                ]);
            }
        } else {
            $customer->phone = $normalizedPhone; // Ensure normalized
            $customer->last_login_at = now();
            if (!$customer->api_token) {
                $customer->api_token = 'token-' . bin2hex(random_bytes(24));
            }
            if ($customer->wallet_balance_iqd <= 0 && in_array($normalizedPhone, ['+9647701234567', '+9647501234567'])) {
                $customer->wallet_balance_iqd = 25000;
                $customer->name = 'ئاکۆ محەمەد (Ako Muhamad)';
            }
            $customer->save();
        }

        $customer->load('addresses');

        $orderCount = Order::where('customer_phone', $normalizedPhone)
            ->whereNotIn('order_status', ['CANCELLED'])
            ->count();

        $token = 'demo-jwt-' . base64_encode(json_encode([
            'sub' => $customer->id,
            'phone' => $customer->phone,
            'name' => $customer->name,
            'exp' => time() + 86400 * 30,
        ]));

        $isNewUser = !$customer->is_onboarded;

        return [
            'success' => true,
            'isNewUser' => $isNewUser,
            'accessToken' => $token,
            'customer' => [
                'id' => $customer->id,
                'phone' => $customer->phone,
                'name' => $customer->name,
                'email' => $customer->email,
                'preferredLanguage' => $customer->preferred_language,
                'isOnboarded' => (bool)$customer->is_onboarded,
                'walletBalanceIqd' => (int)$customer->wallet_balance_iqd,
                'referralCode' => $customer->referral_code,
                'orderCount' => $orderCount,
                'addresses' => $customer->addresses,
            ],
        ];
    }

    public function completeRegistration(string $phone, string $name, ?string $email, string $language, ?array $addressData = null): array
    {
        $normalizedPhone = self::normalizeIraqiPhone($phone);
        $customer = Customer::where('phone', $normalizedPhone)->first();

        if (!$customer) {
            throw ValidationException::withMessages(['customer' => 'Customer profile not found for registration.']);
        }

        $customer->name = trim($name);
        $customer->email = $email ? trim($email) : null;
        $customer->preferred_language = in_array($language, ['ckb', 'ar', 'en']) ? $language : 'en';
        $customer->is_onboarded = true;
        $customer->referral_code = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 4)) . rand(1000, 9999);
        $customer->save();

        if ($addressData && !empty($addressData['city'])) {
            CustomerAddress::create([
                'id' => 'addr-' . uniqid(),
                'customer_id' => $customer->id,
                'title' => $addressData['title'] ?? 'Home',
                'city' => $addressData['city'],
                'neighborhood' => $addressData['neighborhood'] ?? 'Downtown',
                'street' => $addressData['street'] ?? 'Main Street',
                'building' => $addressData['building'] ?? 'Building 1',
                'latitude' => $addressData['latitude'] ?? 36.1901,
                'longitude' => $addressData['longitude'] ?? 44.0091,
                'is_default' => true,
            ]);
        }

        $customer->load('addresses');

        return [
            'success' => true,
            'message' => 'Account registration completed successfully!',
            'customer' => [
                'id' => $customer->id,
                'phone' => $customer->phone,
                'name' => $customer->name,
                'email' => $customer->email,
                'preferredLanguage' => $customer->preferred_language,
                'isOnboarded' => true,
                'walletBalanceIqd' => (int)$customer->wallet_balance_iqd,
                'referralCode' => $customer->referral_code,
                'addresses' => $customer->addresses,
            ],
        ];
    }

    public function logout(Customer $customer): void
    {
        $customer->api_token = null;
        $customer->save();
    }
}
