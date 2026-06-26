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
          className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
        >
          {success ? (
            <SuccessView item={item} onClose={() => onSubmitted()} />
          ) : (
            <>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="text-lg font-bold text-slate-900">
                    I&apos;m interested
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    About{' '}
                    <span className="font-medium text-slate-700">
                      {item.title}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  aria-label="Close"
                  className="-mr-1 -mt-1 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50"
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
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {submitError}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60"
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
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-slate-900">Interest sent!</h2>
      <p className="max-w-xs text-sm text-slate-500">
        We&apos;ve let the seller of{' '}
        <span className="font-medium text-slate-700">{item.title}</span> know.
        They&apos;ll reach out by email.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        Next item
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
      'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition',
      'placeholder:text-slate-400',
      'focus:outline-none focus:ring-2 focus:ring-brand-500/40',
      error
        ? 'border-red-400 focus:border-red-400'
        : 'border-slate-200 focus:border-brand-500',
    ].join(' '),
  };
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea rows={3} {...common} {...rest} />
      ) : (
        <input {...common} {...rest} />
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});
