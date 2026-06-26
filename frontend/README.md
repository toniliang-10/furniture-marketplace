# Swipe & Sit — Furniture Marketplace (Frontend)

A buyer-facing, Tinder-style swipe deck for browsing furniture listings and
expressing interest. Built with **Vite + React + Tailwind CSS** and
**framer-motion** for the drag/spring gestures.

Swipe **right** (or tap the heart) to express interest in an item — this opens a
short form and POSTs to the backend, which emails the seller. Swipe **left** to
skip. Works with mouse drag, touch drag, on-screen buttons, and the
**Arrow Left / Arrow Right** keys.

## Prerequisites

- Node.js 18+ (developed on Node 24).
- The Spring Boot backend running on **http://localhost:8080**.
  - It must have the SMTP catcher (e.g. MailHog / Mailpit) configured so the
    seller-notification email actually fires when an interest is submitted.
  - CORS is already whitelisted for `http://localhost:5173`.

## Run it

```bash
npm install
npm run dev
```

Then open the printed URL (defaults to **http://localhost:5173**).

### Other scripts

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Configuration

The backend base URL is read from `VITE_API_BASE_URL` (see `.env`):

```bash
VITE_API_BASE_URL=http://localhost:8080
```

Copy `.env.example` to `.env` and adjust if your backend runs elsewhere.

## How it works / structure

```
src/
  main.jsx                 App entry
  App.jsx                  Page shell: header, filter, deck, modal, state wiring
  config.js                API base URL, category enum, page size
  index.css                Tailwind layers + base styles
  api/
    client.js              Centralized fetch logic (fetchFurniture, expressInterest, ApiError)
  hooks/
    useFurnitureDeck.js    Loads AVAILABLE items, tracks the top card, advance/reset
  components/
    SwipeDeck.jsx          Stacked draggable cards + skip/interest buttons + keyboard
    FurnitureCard.jsx      Presentational card (image fallback, price, badge, etc.)
    InterestModal.jsx      Interest form: validation, POST, success state
    CategoryFilter.jsx     Category chips mapped to the `category` query param
    EmptyState.jsx         Shared empty/error/end-of-deck view
    Spinner.jsx            Accessible loading spinner
  utils/
    format.js              Currency / category formatting, email validation
```

### Backend endpoints used

- `GET /api/furniture?status=AVAILABLE[&category=...]` — populate the deck
  (Spring `PagedModel`, items are in `content`).
- `POST /api/furniture/{id}/interest` — express interest
  (`{ buyerName, buyerEmail, message }`, returns 201).

Listing management, seller dashboard, and auth are intentionally out of scope —
this app is browse + express-interest only.

## Notes

- `imageUrl` can be null/empty (and the seed data uses placeholder URLs that
  don't resolve); the card shows a graceful "No photo" placeholder in that case.
- Network failures and non-2xx responses surface a friendly message; the form
  maps backend 400 field errors back onto the inputs.
