/**
 * Kurdish Sorani & Eastern Arabic Linguistic and Numeral Normalization
 */

export function normalizeEasternNumerals(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u0660\u06F0]/g, '0') // ٠, ۰
    .replace(/[\u0661\u06F1]/g, '1') // ١, ۱
    .replace(/[\u0662\u06F2]/g, '2') // ٢, ۲
    .replace(/[\u0663\u06F3]/g, '3') // ٣, ۳
    .replace(/[\u0664\u06F4]/g, '4') // ٤, ۴
    .replace(/[\u0665\u06F5]/g, '5') // ٥, ۵
    .replace(/[\u0666\u06F6]/g, '6') // ٦, ۶
    .replace(/[\u0667\u06F7]/g, '7') // ٧, ۷
    .replace(/[\u0668\u06F8]/g, '8') // ٨, ۸
    .replace(/[\u0669\u06F9]/g, '9'); // ٩, ۹
}

export function normalizeKurdishArabicText(input: string): string {
  if (!input) return '';
  let text = normalizeEasternNumerals(input).toLowerCase();

  // 1. Strip Arabic/Kurdish Tashkeel & Harakat (diacritics)
  text = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

  // 2. Normalize Alifs (أ, إ, آ, ٱ, ٲ, ٳ -> ا)
  text = text.replace(/[\u0622\u0623\u0625\u0671\u0672\u0673]/g, '\u0627');

  // 3. Normalize Kafs (ك Arabic U+0643 -> ک Kurdish/Farsi U+06A9)
  text = text.replace(/\u0643/g, '\u06A9');

  // 4. Normalize Yaas (ي Arabic with 2 dots U+064A, ى Alef maksura U+0649, ێ Kurdish E U+06CE -> ی dotless Farsi/Kurdish U+06CC)
  text = text.replace(/[\u064A\u0649\u06CE]/g, '\u06CC');

  // 5. Normalize Hehs & Ta Marbuta (ھ Do-chashmi U+06BE, ة Ta Marbuta U+0629 -> ه Heh U+0647)
  text = text.replace(/[\u06BE\u0629]/g, '\u0647');

  // 6. Strip zero-width non-joiners & control marks
  text = text.replace(/[\u200B-\u200F\uFEFF]/g, '');

  // 7. Collapse spaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

