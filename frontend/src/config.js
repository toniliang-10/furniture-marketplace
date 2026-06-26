// Centralized runtime configuration.
// VITE_API_BASE_URL is injected at build time by Vite from the .env file.
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '');

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
