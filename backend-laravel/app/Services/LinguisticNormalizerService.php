<?php

namespace App\Services;

class LinguisticNormalizerService
{
    /**
     * Kurdish Sorani & Eastern Arabic Linguistic and Numeral Normalization
     */
    public static function normalizeEasternNumerals(?string $input): string
    {
        if (!$input) return '';
        
        $eastern = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $western = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        return str_replace($eastern, $western, $input);
    }

    public static function normalizeKurdishArabicText(?string $input): string
    {
        if (!$input) return '';
        $text = mb_strtolower(self::normalizeEasternNumerals($input), 'UTF-8');

        // 1. Strip Arabic/Kurdish Tashkeel & Harakat (diacritics)
        $text = preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{06D6}-\x{06ED}]/u', '', $text);

        // 2. Normalize Alifs (أ, إ, آ, ٱ, ٲ, ٳ -> ا)
        $text = preg_replace('/[\x{0622}\x{0623}\x{0625}\x{0671}\x{0672}\x{0673}]/u', 'ا', $text);

        // 3. Normalize Kafs (ك Arabic U+0643 -> ک Kurdish/Farsi U+06A9)
        $text = preg_replace('/\x{0643}/u', 'ک', $text);

        // 4. Normalize Yaas (ي Arabic with 2 dots U+064A, ى Alef maksura U+0649, ێ Kurdish E U+06CE -> ی dotless Farsi/Kurdish U+06CC)
        $text = preg_replace('/[\x{064A}\x{0649}\x{06CE}]/u', 'ی', $text);

        // 5. Normalize Hehs & Ta Marbuta (ھ Do-chashmi U+06BE, ة Ta Marbuta U+0629 -> ه Heh U+0647)
        $text = preg_replace('/[\x{06BE}\x{0629}]/u', 'ه', $text);

        // 6. Strip zero-width non-joiners & control marks
        $text = preg_replace('/[\x{200B}-\x{200F}\x{FEFF}]/u', '', $text);

        // 7. Collapse spaces
        $text = preg_replace('/\s+/u', ' ', $text);

        return trim($text);
    }
}

