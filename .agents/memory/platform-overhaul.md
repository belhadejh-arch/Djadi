---
name: Platform Overhaul — Djadi Academy → Mounassata Djadi
description: Key decisions and structure from the complete platform overhaul + auth fixes
---

## Completed overhaul summary

**Platform rename**: "أكاديمية جادي / Djadi Academy" → "منصة جعدي / Mounassata Djadi" applied throughout all frontend pages, layouts, admin pages, and API files. Logo image still contains old name (can't change image content).

**Language system**: `t(ar, fr, en?)` — 3-arg signature, `en` optional (falls back to fr). `useLang()` exposes `{ lang, setLang, t }`. `cycleLang()` in app-layout cycles ar→fr→en via bottom-bar globe button.

**Branch data** (`src/lib/branch-data.ts`): Replaced PE (التربية البدنية) with Amazigh (اللغة الأمازيغية) across all 6 branches. Economics renamed to "الاقتصاد والمانجمنت". Physics renamed to "العلوم الفيزيائية". Islamic renamed to "العلوم الإسلامية". Arts branches use "الأدب العربي" (not "اللغة العربية"). All branches now include Amazigh with coeff 1.

**New DB tables added** (schema files in `lib/db/src/schema/`):
- `homework` — واجبات منزلية (like exams/tests but with semester field)
- `favorites` — per-user bookmarks for lesson/exam/test/homework/baccalaureate
- `activity` — lesson view history per user (max 50 per user)

**New API routes** (all registered in `artifacts/api-server/src/routes/index.ts`):
- `GET/POST/DELETE /api/favorites` — toggle favorites for current user
- `GET /api/activity/recent`, `POST /api/activity` — last activity tracking
- `GET /api/content/exams|tests|homework` — student-facing filtered content
- Admin: `/api/admin/homework` — full CRUD

**New frontend pages/components**:
- `src/pages/favorites.tsx` — favorites list with type filter + PDF viewer
- `src/pages/admin/homework.tsx` — admin CRUD for homework
- `src/components/pdf-viewer.tsx` — full-screen in-app PDF overlay (no external browser)
- `src/components/favorite-button.tsx` — toggles favorite, reads from query cache
- `src/components/last-activity.tsx` — recent lesson views widget on student dashboard
- `src/pages/subject-detail.tsx` — rewritten: 4 square content-type cards, semester tabs, API-fetched exams/tests/homework, PDF viewer integration

## Auth & deployment fixes

**`credentials: "include"` added to customFetch** — without this, cookies are never sent cross-origin. Fixed in `lib/api-client-react/src/custom-fetch.ts`.

**Admin auto-seed** — `artifacts/api-server/src/lib/seed-admin.ts` runs at startup when `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars are set and no super_admin exists yet. Called from `index.ts` after server starts listening.

**OpenAPI User schema** — added `role: string` field to the `User` schema in `lib/api-spec/openapi.yaml`. Regenerate with `pnpm --filter @workspace/api-spec run codegen` after any spec change.

**Vercel deployment** — `artifacts/djadi-academy/vercel.json` must have the real Render URL (not `YOUR-RENDER-URL`). The rewrite proxies `/api/*` to Render so cookies stay same-origin. This is the PRIMARY reason registration/login fail on Vercel.

**CORS** — `artifacts/api-server/src/app.ts` supports comma-separated `FRONTEND_URL` for multiple allowed origins. Set `FRONTEND_URL=https://your-vercel-app.vercel.app` on Render.

**Vite proxy port** — `artifacts/djadi-academy/vite.config.ts` reads `API_PORT` env var (fallback 8080) for the dev proxy target. API server runs on port 8080 locally.

**Why:**
- Cookie-based auth requires `credentials: "include"` for cross-origin fetches
- Vercel proxy approach avoids cross-origin cookie issues entirely
- `vercel.json` placeholder was the root cause of all auth failures in production

**Database NOTE**: `NEON_DATABASE_URL` is set as a Replit env var (not secret). Schema was pushed via `pnpm --filter @workspace/db run push`. New tables (homework, favorites, activity, audit_logs) are all created.
