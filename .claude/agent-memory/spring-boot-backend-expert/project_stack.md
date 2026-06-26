---
name: project-stack
description: Core stack facts for furniture-marketplace (Spring Boot 4.1.0 / Java 21 backend, React+Vite frontend, H2)
metadata:
  type: project
---

Backend: Spring Boot 4.1.0 parent, Java 21, Maven, single module under `backend/`. Jakarta namespaces apply (not javax). Uses spring-boot-starter-data-jpa, starter-mail, h2console.

Frontend: React + Vite (dev server fixed at port 5173, strictPort), separate origin from backend (localhost:8080). Backend CORS whitelists 5173. `VITE_API_BASE_URL=http://localhost:8080`.

Seeding: `backend/src/main/java/com/toni/furniture_marketplace/config/DataSeeder.java` is a `CommandLineRunner` that seeds via `SellerRepository.saveAll(...)` only when `sellerRepository.count()==0`. No data.sql exists.

**How to apply:** Default to Spring Boot 3.x/4.x idioms and Jakarta imports. Image/static assets served from backend must be referenced by frontend with absolute URLs — see [[frontend-imageurl-absolute]].
