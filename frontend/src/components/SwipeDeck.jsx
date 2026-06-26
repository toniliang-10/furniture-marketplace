import { useCallback, useEffect } from 'react';
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
 * A single draggable card. Each instance owns its OWN motion value, so the
 * exiting card and the incoming card never share/fight over `x` — that shared
 * value was the cause of "the next card won't drag after a skip".
 *
 * Cards only ever unmount on a skip / after a submitted interest, so the exit
 * always flies to the left; there's no need to track an exit direction.
 */
function SwipeCard({ item, onSkip, onInterest, disabled }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);

  const handleDragEnd = (_event, info) => {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;

    const swipedRight =
      offsetX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD;
    const swipedLeft =
      offsetX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;

    if (swipedRight) {
      // Express interest: snap back to center, let the parent open the modal.
      x.set(0);
      onInterest(item);
    } else if (swipedLeft) {
      onSkip(item);
    }
    // Otherwise: dragConstraints springs the card back to center automatically.
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.96, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{
        x: -window.innerWidth,
        opacity: 0,
        rotate: -16,
        pointerEvents: 'none', // don't intercept the incoming card mid-exit
        transition: { duration: 0.28 },
      }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Drag intent indicators — restrained, stamped labels */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-5 top-5 z-10 -rotate-6 rounded-sm border-2 border-clay-500 px-3 py-1 text-sm font-semibold uppercase tracking-overline text-clay-600"
      >
        Interested
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-5 top-5 z-10 rotate-6 rounded-sm border-2 border-ink-400 px-3 py-1 text-sm font-semibold uppercase tracking-overline text-ink-500"
      >
        Pass
      </motion.div>

      <FurnitureCard item={item} onInterest={() => onInterest(item)} />
    </motion.div>
  );
}

/**
 * The stacked, draggable card deck.
 *
 * - Drag right (or the interest button) => onInterest(item): the card snaps back
 *   to center; the parent opens the modal. Nothing is removed until the interest
 *   is actually submitted.
 * - Drag left (or the skip button) => onSkip(item): the card flies off-screen and
 *   the parent advances the deck.
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
  const handleSkip = useCallback(
    (item) => {
      if (item) onSkip(item);
    },
    [onSkip]
  );

  const handleInterest = useCallback(
    (item) => {
      if (item) onInterest(item);
    },
    [onInterest]
  );

  // Keyboard shortcuts: ArrowLeft = skip, ArrowRight = interest.
  useEffect(() => {
    if (interactionsDisabled || !topCard) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(topCard);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleInterest(topCard);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [interactionsDisabled, topCard, handleSkip, handleInterest]);

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
            <SwipeCard
              key={topCard.id}
              item={topCard}
              onSkip={handleSkip}
              onInterest={handleInterest}
              disabled={interactionsDisabled}
            />
          )}
        </AnimatePresence>
      </div>

      {/* On-screen action buttons (fallback / desktop) */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => handleSkip(topCard)}
          disabled={!topCard || interactionsDisabled}
          aria-label="Skip this item"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-paper-raised text-ink-500 shadow-soft transition-colors hover:border-ink-400 hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-400 disabled:opacity-40"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => handleInterest(topCard)}
          disabled={!topCard || interactionsDisabled}
          aria-label="I'm interested in this item"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-clay-600 bg-clay-500 text-paper-raised shadow-card transition-colors hover:bg-clay-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500 disabled:opacity-40"
        >
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M12 20.5s-7-4-9.2-8.2C1.2 9.4 2.6 6 6 6c2 0 3.2 1.3 4 2.6C10.8 7.3 12 6 14 6c3.4 0 4.8 3.4 3.2 6.3C19.9 16.5 12 20.5 12 20.5z" />
          </svg>
        </button>
      </div>

      <p className="text-center text-xs tracking-wide text-ink-400">
        Swipe or drag — right to show interest, left to pass.
      </p>
    </div>
  );
}
