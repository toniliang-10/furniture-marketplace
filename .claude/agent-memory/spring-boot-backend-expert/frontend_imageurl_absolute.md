---
name: frontend-imageurl-absolute
description: FurnitureItem.imageUrl must be an absolute backend URL, not a relative path, because frontend runs on a different origin with no proxy
metadata:
  type: project
---

`FurnitureCard.jsx` uses `item.imageUrl` directly as `<img src>`. The frontend (Vite, localhost:5173) has NO dev proxy to the backend (localhost:8080). A relative path like `/images/furniture/sofa1.png` would resolve against 5173 and 404.

**Why:** Static files placed under `backend/src/main/resources/static/` are served by Spring at the backend origin (8080), but the browser is on 5173.

**How to apply:** Any `imageUrl` pointing at backend-served static assets must be the full absolute URL, e.g. `http://localhost:8080/images/furniture/sofa1.png`. Furniture default/template images live at `backend/src/main/resources/static/images/furniture/` (bed1/2, chair1/2, desk1/2, sofa1/2, table1/2 .png). See [[project-stack]].
