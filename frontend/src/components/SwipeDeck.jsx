import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import FurnitureCard from './FurnitureCard.jsx';

// Horizontal distance (px) past which a release counts as a swipe.
const SWIPE_THRESHOLD = 110;
// Flick velocity (px/s) that triggers a swipe even below the distance threshold.
const VELOCITY_THRESHOLD = 500;

/**
 * The stacked, draggable card deck.
 *
 * - Drag right (or the heart / "interested" button) => onInterest(item).
 *   The card snaps back to center; the parent opens the modal. Nothing is
 *   removed until the interest is actually submitted.
 * - Drag left (or the skip button) => onSkip(item): the card flies off-screen
 *   and the parent advances the deck.
 * - ArrowLeft / ArrowRight keyboard shortcuts mirror the buttons.
 *
 * `interactionsDisabled` (e.g. while the modal is open) freezes drag + keys.
 */
export default function SwipeDeck({
  topCard,
  nextCard,
  onSkip,
  onInterest,
  interactionsDisabled = false,
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);

  // Direction the top card should exit toward when it unmounts (skip).
  const [exitX, setExitX] = useState(0);

  const handleSkip = useCallback(
    (item) => {
      if (!item) return;
      setExitX(-window.innerWidth);
      onSkip(item);
    },
    [onSkip]
  );

  const handleDragEnd = useCallback(
    (_event, info) => {
      const offsetX = info.offset.x;
      const velocityX = info.velocity.x;

      const swipedRight =
        offsetX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD;
      const swipedLeft =
        offsetX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;

      if (swipedRight) {
        // Express interest: snap back, let the parent open the modal.
        x.set(0);
        onInterest(topCard);
      } else if (swipedLeft) {
        handleSkip(topCard);
      } else {
        // Not far enough — spring back to center.
        x.set(0);
      }
    },
    [handleSkip, onInterest, topCard, x]
  );

  // Reset the shared motion value whenever a new card becomes the top card.
  const topId = topCard?.id;
  useEffect(() => {
    x.set(0);
    setExitX(0);
  }, [topId, x]);

  // Keyboard shortcuts: ArrowLeft = skip, ArrowRight = interest.
  useEffect(() => {
    if (interactionsDisabled || !topCard) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(topCard);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        x.set(0);
        onInterest(topCard);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [interactionsDisabled, topCard, handleSkip, onInterest, x]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Card stack */}
      <div className="relative h-[28rem] w-full max-w-sm select-none sm:h-[30rem]">
        {/* Peek card behind the top one for the stacked look. */}
        {nextCard && (
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-[0.94] translate-y-3"
          >
            <FurnitureCard item={nextCard} interactive={false} />
          </div>
        )}

        <AnimatePresence>
          {topCard && (
            <motion.div
              key={topCard.id}
              className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
              style={{ x, rotate }}
              drag={interactionsDisabled ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{
                x: exitX || -window.innerWidth,
                opacity: 0,
                rotate: exitX < 0 ? -18 : 0,
                transition: { duration: 0.28 },
              }}
              whileTap={{ cursor: 'grabbing' }}
            >
              {/* LIKE / NOPE drag indicators */}
              <motion.div
                style={{ opacity: likeOpacity }}
                className="pointer-events-none absolute left-4 top-4 z-10 rotate-[-12deg] rounded-lg border-4 border-brand-500 px-3 py-1 text-xl font-extrabold uppercase tracking-wider text-brand-500"
              >
                Like
              </motion.div>
              <motion.div
                style={{ opacity: nopeOpacity }}
                className="pointer-events-none absolute right-4 top-4 z-10 rotate-[12deg] rounded-lg border-4 border-rose-500 px-3 py-1 text-xl font-extrabold uppercase tracking-wider text-rose-500"
              >
                Skip
              </motion.div>

              <FurnitureCard item={topCard} onInterest={() => onInterest(topCard)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* On-screen action buttons (fallback / desktop) */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => handleSkip(topCard)}
          disabled={!topCard || interactionsDisabled}
          aria-label="Skip this item"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-rose-500 shadow-card ring-1 ring-black/5 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 active:scale-95 disabled:opacity-40"
        >
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onInterest(topCard)}
          disabled={!topCard || interactionsDisabled}
          aria-label="I'm interested in this item"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-card ring-1 ring-black/5 transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-95 disabled:opacity-40"
        >
          <svg
            className="h-9 w-9"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 21s-7.5-4.35-10-8.5C.5 9.5 2 5.5 6 5.5c2 0 3.2 1.1 4 2.2.8-1.1 2-2.2 4-2.2 4 0 5.5 4 4 7-2.5 4.15-10 8.5-10 8.5z" />
          </svg>
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">
        Swipe or drag — right to show interest, left to skip.
      </p>
    </div>
  );
}
