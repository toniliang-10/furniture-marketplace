---
name: api-contract
description: API contract between React frontend (frontend/) and Spring Boot backend (backend/) — endpoints, JSON shapes, pagination, CORS, auth
metadata:
  type: project
---

Contract between `frontend/` (React+Vite, dev port 5173) and `backend/` (Spring Boot, port 8080, no context-path).

**Conventions:** JSON is camelCase on both sides. Enums (Category: SOFA/TABLE/CHAIR/BED/DESK/OTHER; ItemStatus: AVAILABLE/SOLD) are sent as their exact string names. Frontend `config.js` mirrors the Category enum; keep them in sync.

**Source of truth for the contract:** backend DTOs in `backend/.../dto/` (FurnitureResponse, InterestRequest/Response). Frontend caller lives in `frontend/src/api/client.js`.

**Endpoints:**
- `GET /api/furniture?category=&status=AVAILABLE&page=0&size=20&sort=` -> `PagedModel<FurnitureResponse>`. Controller uses `new PagedModel<>(page)` so JSON is `{ content: [...], page: { number, size, totalElements, totalPages } }`. Frontend reads `body.content` and `body.page`. Match confirmed.
- `POST /api/furniture/{id}/interest` body `{ buyerName, buyerEmail, message }` -> 201 `InterestResponse`. Matches `InterestRequest`. Frontend ignores the response body.

**CORS:** `WebConfig.corsConfigurationSource()` allows origins localhost:3000 and localhost:5173 for `/api/**` only. Vite is pinned to 5173 (`strictPort: true`) to match. Static `/images/**` is NOT under CORS, but `<img>` tags are no-cors so that's fine.

**Auth:** `SecurityConfig` permits GET `/api/furniture/**`, POST `/api/furniture/*/interest`, POST/GET `/api/sellers`, plus static `/images/**`. Everything else (create/update/delete listings) needs HTTP Basic (in-memory user: seller/password). `.anyRequest().authenticated()` is the catch-all — any NEW public path must be explicitly permitted or it 401s.

**How to apply:** When reviewing changes, verify new public endpoints/static paths are added to SecurityConfig's permitAll list, and any new frontend origin is added to WebConfig CORS.
