import { useCallback, useState } from 'react';
import { useFurnitureDeck } from './hooks/useFurnitureDeck.js';
import SwipeDeck from './components/SwipeDeck.jsx';
import InterestModal from './components/InterestModal.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import EmptyState from './components/EmptyState.jsx';
import Spinner from './components/Spinner.jsx';

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

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-8 pt-6">
      {/* Header */}
      <header className="mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            🛋️
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Swipe &amp; Sit
          </h1>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          Find furniture you love — swipe right to reach out.
        </p>
      </header>

      {/* Category filter */}
      <div className="mb-5 shrink-0">
        <CategoryFilter
          value={category}
          onChange={changeCategory}
          disabled={status === 'loading'}
        />
      </div>

      {/* Main deck area */}
      <main className="flex flex-1 items-center justify-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Spinner label="Loading furniture" />
            <p className="text-sm">Loading furniture…</p>
          </div>
        )}

        {status === 'error' && (
          <EmptyState
            icon="⚠️"
            title="Couldn't load items"
            message={error?.message ?? 'Something went wrong.'}
            action={
              <button
                type="button"
                onClick={reset}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Try again
              </button>
            }
          />
        )}

        {status === 'ready' && isEmpty && (
          <EmptyState
            icon="🎉"
            title="You're all caught up"
            message="No more items to show right now. Check back later or start over."
            action={
              <button
                type="button"
                onClick={reset}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
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
    </div>
  );
}
