import { API_BASE_URL, PAGE_SIZE } from '../config.js';

/**
 * Error thrown for any non-2xx API response. Carries the HTTP status and,
 * when present, the backend's ApiError payload (including fieldErrors).
 */
export class ApiError extends Error {
  constructor(message, { status, fieldErrors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors ?? null;
  }
}

/**
 * Parse a Response, throwing an ApiError with a friendly message on failure.
 * The backend returns an ApiError record: { message, fieldErrors, ... }.
 */
async function parseResponse(res) {
  // 204 No Content (or empty body) — nothing to parse.
  if (res.status === 204) return null;

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message =
      body?.message ||
      friendlyStatusMessage(res.status) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, {
      status: res.status,
      fieldErrors: body?.fieldErrors ?? null,
    });
  }

  return body;
}

function friendlyStatusMessage(status) {
  if (status === 400) return 'Some details were invalid. Please check the form.';
  if (status === 404) return 'That item is no longer available.';
  if (status >= 500) return 'The server had a problem. Please try again shortly.';
  return null;
}

/**
 * Wrap fetch so network failures (backend down) surface as a clean ApiError
 * instead of an unhandled TypeError.
 */
async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new ApiError(
      'Could not reach the server. Is the backend running on :8080?',
      { status: 0 }
    );
  }
  return parseResponse(res);
}

/**
 * Fetch a page of furniture items.
 * @param {object} params
 * @param {string} [params.category] - Category enum (SOFA, TABLE, ...).
 * @param {string} [params.status='AVAILABLE'] - Item status.
 * @param {number} [params.page=0] - 0-based page index.
 * @param {number} [params.size] - Page size.
 * @param {AbortSignal} [params.signal] - Abort signal for cancellation.
 * @returns {Promise<{ items: object[], page: object }>}
 */
export async function fetchFurniture({
  category,
  status = 'AVAILABLE',
  page = 0,
  size = PAGE_SIZE,
  sort,
  signal,
} = {}) {
  const qs = new URLSearchParams();
  if (category) qs.set('category', category);
  if (status) qs.set('status', status);
  qs.set('page', String(page));
  qs.set('size', String(size));
  if (sort) qs.set('sort', sort);

  const body = await request(`/api/furniture?${qs.toString()}`, { signal });
  // Spring PagedModel: { content: [...], page: { number, size, totalElements, totalPages } }
  return {
    items: body?.content ?? [],
    page: body?.page ?? { number: page, size, totalElements: 0, totalPages: 0 },
  };
}

/**
 * Express interest in an item. Triggers the seller-notification email on the backend.
 * @param {number|string} itemId
 * @param {{ buyerName: string, buyerEmail: string, message: string }} payload
 * @returns {Promise<object>} the created InterestResponse
 */
export async function expressInterest(itemId, payload) {
  return request(`/api/furniture/${itemId}/interest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Create a seller account. Used by the "Sell an item" flow before listing.
 * @param {{ name: string, email: string }} payload
 * @returns {Promise<object>} the created seller, including its `id`
 */
export async function createSeller({ name, email }) {
  return request('/api/sellers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });
}

/**
 * Upload a furniture image. Sends multipart/form-data; the browser sets the
 * Content-Type (with boundary) itself, so we must NOT set it manually.
 * @param {File} file
 * @returns {Promise<{ url: string, filename: string }>} absolute URL to the stored image
 */
export async function uploadImage(file) {
  const data = new FormData();
  data.append('file', file);
  return request('/api/uploads', { method: 'POST', body: data });
}

/**
 * Create a furniture listing. New items default to AVAILABLE on the backend,
 * so they show up in the deck automatically — do not send a status field.
 * Optional keys are omitted when empty so the backend keeps them null.
 * @param {object} payload
 * @param {string} payload.title
 * @param {string} [payload.description]
 * @param {number} payload.price
 * @param {string} payload.category - Category enum (SOFA, TABLE, ...).
 * @param {string} [payload.imageUrl]
 * @param {number} payload.sellerId
 * @returns {Promise<object>} the created FurnitureResponse
 */
export async function createFurniture({
  title,
  description,
  price,
  category,
  imageUrl,
  sellerId,
}) {
  const body = { title, price: Number(price), category, sellerId };
  if (description) body.description = description;
  if (imageUrl) body.imageUrl = imageUrl;

  return request('/api/furniture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
