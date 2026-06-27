import { useMemo, useState } from 'react';
import { formatCategory, formatPrice } from '../utils/format.js';

/**
 * Build an ordered list of image sources to try for an item.
 * The only source is the seller-provided imageUrl (e.g. http://localhost:8080/
 * images/furniture/sofa1.png, served from src/main/resources/static/). Listings
 * now require a real photo at creation time, so we never substitute a random or
 * stock image. If the provided URL fails to load, the inline "no image" mark is
 * shown instead.
 */
function buildImageSources(item) {
  const sources = [];
  if (item.imageUrl) sources.push(item.imageUrl);
  return sources;
}

/**
 * Inline mark shown when every image source fails (or there are none).
 * Keeps the card layout stable without a network request.
 */
function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-paper-sunk text-ink-400">
      <svg
        className="h-12 w-12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m4 18 5-5 4 4 3-3 4 4" />
      </svg>
      <span className="overline">No image</span>
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
  const sources = useMemo(() => buildImageSources(item), [item]);
  // Index of the image source currently being attempted; advance on error.
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSrc = sources[sourceIndex];

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-paper-raised shadow-card">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-line bg-paper-sunk">
        {currentSrc ? (
          <img
            key={currentSrc}
            src={currentSrc}
            alt={item.title}
            // Not draggable so it doesn't fight the swipe gesture.
            draggable={false}
            onError={() => setSourceIndex((i) => i + 1)}
            className="h-full w-full select-none object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}

        {/* Category meta — a quiet label, not a loud chip */}
        <span className="absolute left-4 top-4 rounded-sm bg-paper-raised/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-overline text-ink-700 ring-1 ring-line backdrop-blur-[1px]">
          {formatCategory(item.category)}
        </span>
      </div>

      {/* Details */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-6">
        <div className="flex shrink-0 items-baseline justify-between gap-4">
          <h2 className="font-display text-[1.6rem] font-medium leading-tight text-ink-900">
            {item.title}
          </h2>
          <p className="shrink-0 font-display text-xl font-medium tabular-nums text-ink-900">
            {formatPrice(item.price)}
          </p>
        </div>

        {item.sellerName && (
          <p className="shrink-0 text-sm text-ink-500">
            Offered by{' '}
            <span className="font-medium text-ink-700">{item.sellerName}</span>
          </p>
        )}

        {/* Scrollable description: full text is readable without leaving the card.
            `pan-y` lets vertical touch gestures scroll here while horizontal
            gestures still drive the swipe. */}
        {item.description && (
          <div className="pan-y min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            <p className="text-[0.95rem] leading-relaxed text-ink-500">
              {item.description}
            </p>
          </div>
        )}

        {interactive && (
          <button
            type="button"
            onClick={onInterest}
            aria-label={`Express interest in ${item.title}`}
            className="mt-2 shrink-0 inline-flex items-center justify-center rounded-sm border border-ink-900 bg-ink-900 px-4 py-3 text-sm font-medium tracking-wide text-paper-raised transition-colors hover:bg-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500"
          >
            Express interest
          </button>
        )}
      </div>
    </article>
  );
}
