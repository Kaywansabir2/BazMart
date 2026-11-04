import { BadRequestException } from '@nestjs/common';
import { normalizeEasternNumerals } from './linguistic-normalizer';

/**
 * Normalizes any Iraqi mobile phone input to standard E.164 (+9647XXXXXXXXX).
 * Accepts:
 *  - Local format: "0770 123 4567", "07501234567", "07801234567", "07901234567"
 *  - Raw 10 digits without leading 0: "7701234567"
 *  - Full international: "+964 770 123 4567", "009647701234567", "9647701234567"
 *  - Eastern numerals: "٠٧٧٠١٢٣٤٥٦٧"
 */
export function normalizeIraqiPhone(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== 'string') {
    throw new BadRequestException({
      statusCode: 400,
      error: 'INVALID_IRAQI_PHONE',
      message: 'Mobile phone number is required.',
      messageCkb: 'ژمارەی مۆبایل پێویستە بنووسرێت.',
      messageAr: 'رقم الهاتف مطلوب.',
    });
  }

  // 1. Convert Kurdish/Arabic numerals to standard ASCII
  let cleaned = normalizeEasternNumerals(rawPhone).trim();

  // 2. Remove all spaces, dashes, dots, brackets
  cleaned = cleaned.replace(/[\s\-\.\(\)]/g, '');

  // 3. Remove leading international prefixes
  if (cleaned.startsWith('00964')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('+964')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('964') && cleaned.length >= 12) {
    cleaned = cleaned.substring(3);
  }

  // 4. Strip local leading 0 if present (e.g. 0770 -> 770)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // 5. Must now be 10 digits starting with 75, 77, 78, or 79
  const iraqiPhonePattern = /^7[5789]\d{8}$/;
  if (!iraqiPhonePattern.test(cleaned)) {
    throw new BadRequestException({
      statusCode: 400,
      error: 'INVALID_IRAQI_PHONE',
      message: 'Invalid Iraqi mobile number. Must be a valid 10-digit number (e.g., 0750XXXXXXX, 0770XXXXXXX, 0780XXXXXXX).',
      messageCkb: 'ژمارەی مۆبایلی عێراقی نادروستە. دەبێت بە ٠٧٥٠، ٠٧٧٠ یان ٠٧٨٠ دەست پێبکات.',
      messageAr: 'رقم الهاتف العراقي غير صالح. يجب أن يبدأ بـ 0750 أو 0770 أو 0780.',
    });
  }

  return `+964${cleaned}`;
}

/**
 * Check if a phone string can be normalized to a valid Iraqi number
 */
export function isValidIraqiPhone(rawPhone: string): boolean {
  try {
    normalizeIraqiPhone(rawPhone);
    return true;
  } catch {
    return false;
  }
}

