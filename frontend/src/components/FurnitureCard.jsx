import { useState } from 'react';
import { formatCategory, formatPrice } from '../utils/format.js';

/**
 * Inline SVG shown when an item has no image (or the image fails to load).
 * Keeps the card layout stable without a network request.
 */
function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
      <svg
        className="h-16 w-16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m4 18 5-5 4 4 3-3 4 4" />
      </svg>
      <span className="text-xs font-medium uppercase tracking-wide">
        No photo
      </span>
    </div>
  );
}

/**
 * Presentational furniture card. Pure — receives the item plus an onInterest
 * callback. The draggable wrapper lives in SwipeDeck.
 *
 * `interactive={false}` is used for the static "peek" card behind the top card,
 * which hides the action button and disables pointer events.
 */
export default function FurnitureCard({ item, onInterest, interactive = true }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = item.imageUrl && !imageFailed;

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            // Native lazy-load; not draggable so it doesn't fight the swipe gesture.
            loading="lazy"
            draggable={false}
            onError={() => setImageFailed(true)}
            className="h-full w-full select-none object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {formatCategory(item.category)}
        </span>
      </div>

      {/* Details */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold leading-tight text-slate-900">
            {item.title}
          </h2>
          <p className="shrink-0 text-xl font-extrabold text-brand-600">
            {formatPrice(item.price)}
          </p>
        </div>

        {item.sellerName && (
          <p className="text-sm text-slate-500">
            Listed by{' '}
            <span className="font-medium text-slate-700">{item.sellerName}</span>
          </p>
        )}

        {item.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
            {item.description}
          </p>
        )}

        {interactive && (
          <button
            type="button"
            onClick={onInterest}
            aria-label={`Express interest in ${item.title}`}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 21s-7.5-4.35-10-8.5C.5 9.5 2 5.5 6 5.5c2 0 3.2 1.1 4 2.2.8-1.1 2-2.2 4-2.2 4 0 5.5 4 4 7-2.5 4.15-10 8.5-10 8.5z" />
            </svg>
            I&apos;m interested
          </button>
        )}
      </div>
    </article>
  );
}
