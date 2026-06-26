import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { expressInterest, ApiError } from '../api/client.js';
import { isValidEmail } from '../utils/format.js';

const EMPTY_FORM = { buyerName: '', buyerEmail: '', message: '' };

/**
 * Modal form for expressing interest in an item. Owns the POST request,
 * client-side validation, and the success confirmation. Calls onSubmitted
 * once the interest is recorded so the parent can advance the deck.
 *
 * Accessibility: role="dialog" + aria-modal, labelled by the title, focus moved
 * to the first field on open, Escape to close, basic focus trap, body scroll lock.
 */
export default function InterestModal({ item, onClose, onSubmitted }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  const titleId = useId();
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);

  // Move focus into the dialog and lock body scroll while open.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    firstFieldRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  // Auto-advance shortly after a successful submission.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => onSubmitted(), 1600);
    return () => clearTimeout(timer);
  }, [success, onSubmitted]);

  function validate() {
    const next = {};
    if (!form.buyerName.trim()) next.buyerName = 'Please enter your name.';
    if (!form.buyerEmail.trim()) {
      next.buyerEmail = 'Please enter your email.';
    } else if (!isValidEmail(form.buyerEmail)) {
      next.buyerEmail = 'Please enter a valid email address.';
    }
    if (!form.message.trim()) next.message = 'Please add a short message.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the field error as the user corrects it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await expressInterest(item.id, {
        buyerName: form.buyerName.trim(),
        buyerEmail: form.buyerEmail.trim(),
        message: form.message.trim(),
      });
      setSuccess(true);
    } catch (err) {
      // Map backend field errors (400) back onto the form when present.
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
      }
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Close on Escape; keep a minimal focus trap inside the dialog.
  function handleKeyDown(event) {
    if (event.key === 'Escape' && !submitting) {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => {
          // Close only when the backdrop itself is clicked (not the dialog).
          if (e.target === e.currentTarget && !submitting) onClose();
        }}
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={handleKeyDown}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-md rounded-t-card border border-line bg-paper-raised p-7 shadow-card sm:rounded-card"
        >
          {success ? (
            <SuccessView item={item} onClose={() => onSubmitted()} />
          ) : (
            <>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="overline">Express interest</p>
                  <h2
                    id={titleId}
                    className="mt-1.5 font-display text-2xl font-medium leading-tight text-ink-900"
                  >
                    {item.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  aria-label="Close"
                  className="-mr-1 -mt-1 rounded-full p-2 text-ink-400 transition-colors hover:bg-paper-sunk hover:text-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500 disabled:opacity-50"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <Field
                  ref={firstFieldRef}
                  id="buyerName"
                  label="Your name"
                  value={form.buyerName}
                  error={errors.buyerName}
                  onChange={(v) => updateField('buyerName', v)}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  disabled={submitting}
                />
                <Field
                  id="buyerEmail"
                  label="Your email"
                  type="email"
                  value={form.buyerEmail}
                  error={errors.buyerEmail}
                  onChange={(v) => updateField('buyerEmail', v)}
                  autoComplete="email"
                  placeholder="jane@example.com"
                  disabled={submitting}
                />
                <Field
                  id="message"
                  label="Message to the seller"
                  as="textarea"
                  value={form.message}
                  error={errors.message}
                  onChange={(v) => updateField('message', v)}
                  placeholder="Hi! Is this still available? I'd love to come take a look."
                  disabled={submitting}
                />

                {submitError && (
                  <p
                    role="alert"
                    className="border-l-2 border-red-400 bg-red-50/70 px-3 py-2 text-sm text-red-800"
                  >
                    {submitError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 rounded-sm border border-line-strong bg-paper-raised px-4 py-3 text-sm font-medium tracking-wide text-ink-700 transition-colors hover:bg-paper-sunk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-sm border border-ink-900 bg-ink-900 px-4 py-3 text-sm font-medium tracking-wide text-paper-raised transition-colors hover:bg-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500 disabled:opacity-60"
                  >
                    {submitting ? 'Sending…' : 'Send interest'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SuccessView({ item, onClose }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-clay-200 bg-clay-50 text-clay-600">
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-display text-2xl font-medium text-ink-900">
        Interest sent
      </h2>
      <p className="max-w-xs text-sm leading-relaxed text-ink-500">
        We&apos;ve let the seller of{' '}
        <span className="font-medium text-ink-700">{item.title}</span> know.
        They&apos;ll reach out to you by email.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-1 rounded-sm border border-ink-900 bg-ink-900 px-5 py-2.5 text-sm font-medium tracking-wide text-paper-raised transition-colors hover:bg-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500"
      >
        Continue browsing
      </button>
    </div>
  );
}

/**
 * Labelled text/textarea field with inline error messaging and aria wiring.
 * forwardRef lets the parent focus the first field when the modal opens.
 */
const Field = forwardRef(function Field(
  { id, label, as = 'input', error, value, onChange, ...rest },
  ref
) {
  const errorId = `${id}-error`;
  const common = {
    id,
    ref,
    value,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error ? errorId : undefined,
    onChange: (e) => onChange(e.target.value),
    className: [
      'w-full rounded-sm border bg-paper px-3.5 py-2.5 text-sm text-ink-900 transition-colors',
      'placeholder:text-ink-400',
      'focus:outline-none focus:bg-paper-raised',
      error
        ? 'border-red-400 focus:border-red-500'
        : 'border-line-strong focus:border-clay-500',
    ].join(' '),
  };
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-overline text-ink-500"
      >
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea rows={3} {...common} {...rest} />
      ) : (
        <input {...common} {...rest} />
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});
