/**
 * BazMart Deterministic Number & Currency Formatter
 * Prevents React hydration mismatch (#418, #423, #425) across Node.js SSR and client browsers.
 */

export function formatNumber(val: number | string | undefined | null): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatIqd(val: number | string | undefined | null): string {
  return `IQD ${formatNumber(val)}`;
}

export function formatDateSafe(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
  } catch {
    return String(dateStr);
  }
}
