import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  createSeller,
  createFurniture,
  uploadImage,
  ApiError,
} from '../api/client.js';
import { isValidEmail } from '../utils/format.js';
import { CATEGORIES } from '../config.js';

const EMPTY_FORM = {
  title: '',
  price: '',
  category: '',
  description: '',
  sellerName: '',
  sellerEmail: '',
  confirmEmail: '',
};

// Accepted image types and max size — mirrored on the backend (FileStorageService).
const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Modal form for listing a furniture item for sale. Owns a two-step POST flow
 * (create seller, then create the item with the returned sellerId), client-side
 * validation, and the success confirmation. Calls onSubmitted once the listing
 * is created so the parent can refresh the deck.
 *
 * Accessibility: role="dialog" + aria-modal, labelled by the title, focus moved
 * to the first field on open, Escape to close, basic focus trap, body scroll lock.
 */
export default function SellModal({ onClose, onSubmitted }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  const titleId = useId();
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const fileInputRef = useRef(null);

  // Revoke the object URL used for the local preview when it changes/unmounts.
  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

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
    if (!form.title.trim()) next.title = 'Please enter a title.';

    if (!form.price.trim()) {
      next.price = 'Please enter a price.';
    } else {
      const numeric = Number(form.price);
      if (!Number.isFinite(numeric) || numeric <= 0) {
        next.price = 'Enter a price greater than 0.';
      }
    }

    if (!form.category) next.category = 'Please choose a category.';

    if (!form.sellerName.trim()) next.sellerName = 'Please enter your name.';

    if (!form.sellerEmail.trim()) {
      next.sellerEmail = 'Please enter your email.';
    } else if (!isValidEmail(form.sellerEmail)) {
      next.sellerEmail = 'Please enter a valid email address.';
    }

    if (!form.confirmEmail.trim()) {
      next.confirmEmail = 'Please confirm your email.';
    } else if (form.confirmEmail.trim() !== form.sellerEmail.trim()) {
      next.confirmEmail = 'Emails do not match.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear the field error as the user corrects it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please choose a PNG, JPEG, WebP, or GIF image.',
      }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image is too large. Maximum size is 8 MB.',
      }));
      return;
    }

    setErrors((prev) => (prev.image ? { ...prev, image: undefined } : prev));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // previous URL is revoked by the effect
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setErrors((prev) => (prev.image ? { ...prev, image: undefined } : prev));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Step A: if an image was chosen, upload it first and capture its URL.
      let imageUrl;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        imageUrl = uploaded.url;
      }

      // Step B: create the seller and capture the returned id.
      const seller = await createSeller({
        name: form.sellerName.trim(),
        email: form.sellerEmail.trim(),
      });

      // Step C: create the listing with that sellerId. If this fails after the
      // seller was created, we do NOT roll back — duplicates are acceptable, so
      // we surface the error and let the user retry.
      await createFurniture({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        category: form.category,
        imageUrl,
        sellerId: seller.id,
      });

      setSuccess(true);
    } catch (err) {
      // Map backend field errors (400) back onto the form when present. Seller
      // keys: name/email; furniture keys: title/price/category. Re-key the
      // seller's "name"/"email" onto our seller* fields so they show inline.
      if (err instanceof ApiError && err.fieldErrors) {
        const { name, email, ...rest } = err.fieldErrors;
        setErrors((prev) => ({
          ...prev,
          ...rest,
          ...(name ? { sellerName: name } : {}),
          ...(email ? { sellerEmail: email } : {}),
        }));
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
          className="max-h-[92%] w-full max-w-md overflow-y-auto rounded-t-card border border-line bg-paper-raised p-7 shadow-card sm:rounded-card"
        >
          {success ? (
            <SuccessView title={form.title.trim()} onClose={() => onSubmitted()} />
          ) : (
            <>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="overline">List an item</p>
                  <h2
                    id={titleId}
                    className="mt-1.5 font-display text-2xl font-medium leading-tight text-ink-900"
                  >
                    Sell your furniture
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
                  id="title"
                  label="Title"
                  value={form.title}
                  error={errors.title}
                  onChange={(v) => updateField('title', v)}
                  placeholder="Mid-century walnut sideboard"
                  disabled={submitting}
                />
                <Field
                  id="price"
                  label="Price (USD)"
                  value={form.price}
                  error={errors.price}
                  onChange={(v) => updateField('price', v)}
                  inputMode="decimal"
                  placeholder="450"
                  disabled={submitting}
                />
                <Field
                  id="category"
                  label="Category"
                  as="select"
                  value={form.category}
                  error={errors.category}
                  onChange={(v) => updateField('category', v)}
                  disabled={submitting}
                >
                  <option value="" disabled>
                    Select a category…
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Field>
                <Field
                  id="description"
                  label="Description"
                  as="textarea"
                  value={form.description}
                  error={errors.description}
                  onChange={(v) => updateField('description', v)}
                  placeholder="Condition, dimensions, pickup details…"
                  disabled={submitting}
                />
                <div>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-overline text-ink-500">
                    Photo (optional)
                  </span>
                  {imagePreview ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Selected furniture preview"
                        className="h-16 w-16 shrink-0 rounded-sm border border-line-strong object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink-700">
                          {imageFile?.name}
                        </p>
                        <button
                          type="button"
                          onClick={clearImage}
                          disabled={submitting}
                          className="mt-0.5 text-xs font-medium text-clay-600 underline-offset-2 hover:underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                      aria-describedby={errors.image ? 'image-error' : undefined}
                      className={[
                        'flex w-full items-center justify-center gap-2 rounded-sm border border-dashed bg-paper px-3.5 py-4 text-sm transition-colors',
                        'hover:bg-paper-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500 disabled:opacity-50',
                        errors.image
                          ? 'border-red-400 text-red-700'
                          : 'border-line-strong text-ink-500',
                      ].join(' ')}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
                      </svg>
                      Upload a photo
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="sr-only"
                  />
                  {errors.image && (
                    <p id="image-error" className="mt-1.5 text-xs text-red-600">
                      {errors.image}
                    </p>
                  )}
                </div>
                <Field
                  id="sellerName"
                  label="Your name"
                  value={form.sellerName}
                  error={errors.sellerName}
                  onChange={(v) => updateField('sellerName', v)}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  disabled={submitting}
                />
                <Field
                  id="sellerEmail"
                  label="Your email"
                  type="email"
                  value={form.sellerEmail}
                  error={errors.sellerEmail}
                  onChange={(v) => updateField('sellerEmail', v)}
                  autoComplete="email"
                  placeholder="jane@example.com"
                  disabled={submitting}
                />
                <Field
                  id="confirmEmail"
                  label="Confirm email"
                  type="email"
                  value={form.confirmEmail}
                  error={errors.confirmEmail}
                  onChange={(v) => updateField('confirmEmail', v)}
                  autoComplete="email"
                  placeholder="jane@example.com"
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
                    {submitting ? 'Listing…' : 'List item'}
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

function SuccessView({ title, onClose }) {
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
        Listing submitted
      </h2>
      <p className="max-w-xs text-sm leading-relaxed text-ink-500">
        <span className="font-medium text-ink-700">{title}</span> is now live in
        the marketplace. Buyers can find it in the deck and reach out to you by
        email.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-1 rounded-sm border border-ink-900 bg-ink-900 px-5 py-2.5 text-sm font-medium tracking-wide text-paper-raised transition-colors hover:bg-ink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500"
      >
        Done
      </button>
    </div>
  );
}

/**
 * Labelled text/textarea/select field with inline error messaging and aria
 * wiring. forwardRef lets the parent focus the first field when the modal opens.
 */
const Field = forwardRef(function Field(
  { id, label, as = 'input', error, value, onChange, children, ...rest },
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
      ) : as === 'select' ? (
        <select {...common} {...rest}>
          {children}
        </select>
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
