const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/**
 * Format a numeric/string price as USD currency.
 * Falls back to an em dash when the value is missing or not a number.
 */
export function formatPrice(price) {
  const numeric = typeof price === 'string' ? Number(price) : price;
  if (numeric == null || Number.isNaN(numeric)) return '—';
  return currencyFormatter.format(numeric);
}

/**
 * Turn an enum-style category (e.g. "SOFA") into a display label ("Sofa").
 */
export function formatCategory(category) {
  if (!category) return '';
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

/**
 * Lightweight email validity check for client-side form validation.
 * The backend is the source of truth (@Email), this is just for UX.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}
