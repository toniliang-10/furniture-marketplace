---
name: static-images-security
description: How furniture placeholder images are served from Spring static/ and the Spring Security catch-all that silently 401s them
metadata:
  type: project
---

Placeholder furniture images live at `backend/src/main/resources/static/images/furniture/*.png` (bed1/2, chair1/2, desk1/2, sofa1/2, table1/2 — all .png). `DataSeeder.java` stores absolute URLs `http://localhost:8080/images/furniture/<name>.png` in each item's `imageUrl`. Filenames match the seed data exactly. Absolute (not relative) URL is intentional: there is no Vite proxy, so a relative `/images/...` would resolve against the Vite origin (5173) and 404.

**The trap:** `SecurityConfig` ends with `.anyRequest().authenticated()`. Static resources like `/images/**` are NOT auto-permitted by Spring Security — they fall through to the catch-all and return 401. The browser `<img>` onError then silently falls back to a loremflickr stock photo (`FurnitureCard.jsx` `buildImageSources`), so the bug LOOKS like "wrong images" rather than "blocked images".

**Why:** Discovered 2026-06-26 when user reported placeholder images not displaying. Root cause = Spring Security blocking static paths, not a path/filename mismatch and not CORS.

**Fix applied:** added `.requestMatchers(HttpMethod.GET, "/images/**").permitAll()` to SecurityConfig.

**How to apply:** Any time the backend serves new static assets, confirm the path is permitAll in SecurityConfig. If frontend images mysteriously fall back to stock photos, check for a 401 on the static URL before suspecting the URL/filename.
