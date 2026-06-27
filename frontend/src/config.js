// Centralized runtime configuration.
// VITE_API_BASE_URL is injected at build time by Vite from the .env file.
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '');

/**
 * Resolve a furniture image URL for use as an <img> src.
 * Backend stores host-relative paths (e.g. "/images/furniture/sofa1.png") so the
 * data is independent of where the backend is deployed; we prepend API_BASE_URL
 * here. Already-absolute URLs (http/https/data) are returned unchanged so older
 * records and external images still work.
 */
export function resolveImageUrl(url) {
  if (!url) return url;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Category enum values mirrored from the backend (model/Category.java).
// `value` matches the API enum; `label` is the human-facing chip text.
export const CATEGORIES = [
  { value: 'SOFA', label: 'Sofa' },
  { value: 'TABLE', label: 'Table' },
  { value: 'CHAIR', label: 'Chair' },
  { value: 'BED', label: 'Bed' },
  { value: 'DESK', label: 'Desk' },
  { value: 'OTHER', label: 'Other' },
];

// How many items to request per page from the deck endpoint.
export const PAGE_SIZE = 20;
