/**
 * Generic centered message used for empty / error / end-of-deck states.
 * `icon` is an optional React node (a line SVG); `action` renders an optional button.
 */
export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-card border border-line bg-paper-raised p-10 text-center shadow-soft">
      {icon && (
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-ink-400"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="space-y-2">
        <h2 className="font-display text-xl font-medium text-ink-900">{title}</h2>
        {message && (
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-ink-500">
            {message}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
