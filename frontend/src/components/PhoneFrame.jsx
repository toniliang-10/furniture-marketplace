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
export default function PhoneFrame({ children }) {
  return (
    <div className="md:flex md:min-h-[100dvh] md:items-center md:justify-center md:bg-paper-sunk md:py-8">
      {/* Device body. Transparent below md; dark bezel with side buttons at md+. */}
      <div className="relative md:rounded-[2.75rem] md:bg-ink-900 md:p-3 md:shadow-card md:ring-1 md:ring-black/5">
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
