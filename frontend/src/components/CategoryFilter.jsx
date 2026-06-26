import { CATEGORIES } from '../config.js';

/**
 * Horizontal, scrollable row of category filters rendered as quiet underlined
 * tabs. "All" clears the filter. Single-select toolbar with aria-pressed state.
 */
export default function CategoryFilter({ value, onChange, disabled = false }) {
  const options = [{ value: null, label: 'All' }, ...CATEGORIES];

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex gap-6 overflow-x-auto border-b border-line"
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
              'shrink-0 -mb-px border-b-2 pb-2 pt-1 text-sm tracking-wide transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500',
              'disabled:opacity-50',
              selected
                ? 'border-clay-500 font-medium text-ink-900'
                : 'border-transparent text-ink-400 hover:text-ink-700',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
