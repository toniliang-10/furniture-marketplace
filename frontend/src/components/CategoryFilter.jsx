import { CATEGORIES } from '../config.js';

/**
 * Horizontal, scrollable row of category chips. "All" clears the filter.
 * Implemented as a single-select toolbar with aria-pressed state.
 */
export default function CategoryFilter({ value, onChange, disabled = false }) {
  const options = [{ value: null, label: 'All' }, ...CATEGORIES];

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={[
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
              'disabled:opacity-50',
              selected
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
