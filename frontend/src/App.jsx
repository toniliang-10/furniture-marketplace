import { useCallback, useState } from 'react';
import { useFurnitureDeck } from './hooks/useFurnitureDeck.js';
import SwipeDeck from './components/SwipeDeck.jsx';
import InterestModal from './components/InterestModal.jsx';
import SellModal from './components/SellModal.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import EmptyState from './components/EmptyState.jsx';
import Spinner from './components/Spinner.jsx';

// Shared restrained-button class for the empty/error state actions.
const primaryAction =
  'rounded-sm border border-ink-900 bg-ink-900 px-5 py-2.5 text-sm font-medium tracking-wide text-paper-raised transition-colors hover:bg-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500';

function AlertIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const {
    category,
    changeCategory,
    topCard,
    nextCard,
    status,
    error,
    advance,
    reset,
    isEmpty,
  } = useFurnitureDeck();

  // The item whose interest modal is open (null = closed).
  const [interestItem, setInterestItem] = useState(null);
  // Whether the "Sell an item" modal is open.
  const [sellOpen, setSellOpen] = useState(false);

  const handleInterest = useCallback((item) => {
    if (item) setInterestItem(item);
  }, []);

  const handleSkip = useCallback(
    (item) => {
      if (item) advance(item.id);
    },
    [advance]
  );

  const handleSubmitted = useCallback(() => {
    if (interestItem) advance(interestItem.id);
    setInterestItem(null);
  }, [advance, interestItem]);

  // After a successful listing, close the modal and reload the deck so the new
  // item can appear in the active category.
  const handleSellSubmitted = useCallback(() => {
    setSellOpen(false);
    reset();
  }, [reset]);

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-10 pt-8 md:min-h-full md:pt-12">
      {/* Masthead */}
      <header className="mb-7 shrink-0 text-center">
        <p className="overline">Considered Furniture, Resold</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink-900">
          Maison
        </h1>
        <div
          className="mx-auto mt-3 h-px w-12 bg-line-strong"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => setSellOpen(true)}
          className="mx-auto mt-4 rounded-sm border border-line-strong bg-paper-raised px-4 py-1.5 text-xs font-medium uppercase tracking-overline text-ink-600 transition-colors hover:bg-paper-sunk hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500"
        >
          Sell an item
        </button>
      </header>

      {/* Category filter */}
      <div className="mb-7 shrink-0">
        <CategoryFilter
          value={category}
          onChange={changeCategory}
          disabled={status === 'loading'}
        />
      </div>

      {/* Main deck area */}
      <main className="flex flex-1 items-center justify-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 text-ink-500">
            <Spinner label="Loading furniture" />
            <p className="text-sm tracking-wide">Loading the collection…</p>
          </div>
        )}

        {status === 'error' && (
          <EmptyState
            icon={<AlertIcon />}
            title="Unable to load"
            message={error?.message ?? 'Something went wrong.'}
            action={
              <button type="button" onClick={reset} className={primaryAction}>
                Try again
              </button>
            }
          />
        )}

        {status === 'ready' && isEmpty && (
          <EmptyState
            icon={<CheckIcon />}
            title="You've seen everything"
            message="There are no more pieces to show right now. Check back later, or start again from the top."
            action={
              <button type="button" onClick={reset} className={primaryAction}>
                Start over
              </button>
            }
          />
        )}

        {status === 'ready' && !isEmpty && (
          <SwipeDeck
            topCard={topCard}
            nextCard={nextCard}
            onSkip={handleSkip}
            onInterest={handleInterest}
            interactionsDisabled={Boolean(interestItem)}
          />
        )}
      </main>

      {interestItem && (
        <InterestModal
          item={interestItem}
          onClose={() => setInterestItem(null)}
          onSubmitted={handleSubmitted}
        />
      )}

      {sellOpen && (
        <SellModal
          onClose={() => setSellOpen(false)}
          onSubmitted={handleSellSubmitted}
        />
      )}
    </div>
  );
}
