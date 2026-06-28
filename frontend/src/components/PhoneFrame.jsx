/**
 * PhoneFrame
 *
 * Decorative phone mockup wrapper. On large screens (md+) it renders the app
 * inside a tasteful device body — dark bezel, dynamic-island speaker, side
 * buttons — centered on a soft paper backdrop, with the "screen" sized to a
 * realistic ~390×844 phone. Below md it is a transparent pass-through: the app
 * fills the viewport edge-to-edge exactly as it does today.
 *
 * Why the nested screen / scroll structure (this is the load-bearing part):
 *  - `.screen` carries a transform at md+ (`translateZ(0)`). A transformed
 *    ancestor becomes the *containing block* for `position: fixed` descendants,
 *    so the app's fixed modal overlays (InterestModal / SellModal) are visually
 *    contained INSIDE the phone screen on desktop instead of covering the whole
 *    browser window. Combined with `overflow-hidden` + rounded corners, the dark
 *    modal backdrops are also masked to the device's rounded screen.
 *  - `.screen` itself does NOT scroll; the inner scroll area does. Keeping the
 *    transformed/clipping element separate from the scroll element means the
 *    fixed overlays stay pinned to the *visible* screen even after the user has
 *    scrolled the app content (a fixed child of a scroll container would
 *    otherwise drift with the scroll offset under a transformed ancestor).
 *
 * Accessibility: all chrome (bezel, island, buttons) is purely decorative and
 * marked aria-hidden / pointer-events-none. `children` are rendered exactly once
 * (no duplicate tree), so app state, effects and network calls are not doubled,
 * and tab order / focus management inside the app are left completely untouched.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
function InfoIcon() {
  return (
    <svg
      className="mt-px h-4 w-4 shrink-0 text-clay-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}

/**
 * BackendNotice
 *
 * Info callouts about the Render free-tier backend, rendered in the page area
 * AROUND the phone — a sidebar column beside the device body on desktop, stacked
 * above the phone on mobile (no horizontal room for a side placement).
 * Intentionally OUTSIDE the phone screen so they aren't clipped by the device
 * frame or covered by the in-app modals. Two stacked callouts:
 *   1. cold-start wake time (~55s)
 *   2. outbound SMTP is blocked, so emails don't reach the recipient's inbox
 */
function BackendNotice() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-5 pt-6 md:absolute md:right-full md:top-1/2 md:ml-0 md:mr-6 md:w-[260px] md:max-w-none md:-translate-y-1/2 md:px-0 md:pt-0">
      <div className="flex items-start gap-2.5 rounded-card border border-line bg-paper-raised px-4 py-3 shadow-soft">
        <InfoIcon />
        <p className="text-xs leading-relaxed text-ink-500">
          <span className="font-medium text-ink-700">Note:</span> The backend is
          hosted on Render&apos;s free tier and may take up to ~55 seconds to
          wake up on first load. Thanks for your patience!
        </p>
      </div>
      <div className="flex items-start gap-2.5 rounded-card border border-line bg-paper-raised px-4 py-3 shadow-soft">
        <InfoIcon />
        <p className="text-xs leading-relaxed text-ink-500">
          <span className="font-medium text-ink-700">Heads up:</span> Render&apos;s
          free tier blocks outbound SMTP, so notification emails won&apos;t
          reach the recipient&apos;s inbox.
        </p>
      </div>
    </div>
  );
}

export default function PhoneFrame({ children }) {
  return (
    <div className="md:flex md:min-h-[100dvh] md:items-center md:justify-center md:bg-paper-sunk md:py-8">
      {/* Device body. Transparent below md; dark bezel with side buttons at md+. */}
      <div className="relative md:rounded-[2.75rem] md:bg-ink-900 md:p-3 md:shadow-card md:ring-1 md:ring-black/5">
        {/* Cold-start notice — absolute sidebar beside the phone (desktop),
            normal-flow above the app (mobile). Absolute on desktop keeps it out
            of flow so the phone stays exactly centered. */}
        <BackendNotice />
        {/* Dynamic-island speaker — sits in the status-bar area above app content. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-5 z-20 hidden h-6 w-28 -translate-x-1/2 rounded-full bg-ink-900 md:block"
        />
        {/* Side buttons (silent switch + volume left, power right). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[3px] top-24 hidden h-8 w-[3px] rounded-l bg-ink-700 md:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[3px] top-36 hidden h-12 w-[3px] rounded-l bg-ink-700 md:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[3px] top-32 hidden h-16 w-[3px] rounded-r bg-ink-700 md:block"
        />

        {/* Screen: containing block for fixed overlays + rounded corner clip (md only). */}
        <div className="md:h-[844px] md:max-h-[92dvh] md:w-[390px] md:overflow-hidden md:rounded-[2.25rem] md:bg-paper md:[transform:translateZ(0)]">
          {/* Scroll area: the app's real scroll container on desktop. */}
          <div className="md:h-full md:overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
