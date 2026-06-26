/**
 * Generic centered message used for empty / error / end-of-deck states.
 * `icon` is an emoji or short string; `action` renders an optional button.
 */
export default function EmptyState({ icon = '🛋️', title, message, action }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-3xl bg-white/70 p-8 text-center ring-1 ring-black/5">
      <span className="text-5xl" aria-hidden="true">
        {icon}
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {message && (
          <p className="mx-auto max-w-xs text-sm text-slate-500">{message}</p>
        )}
      </div>
      {action}
    </div>
  );
}
