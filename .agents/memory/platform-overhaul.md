---
name: Platform Overhaul — Djadi Academy → Mounassata Djadi
description: Key decisions and structure from the complete platform overhaul + auth fixes + i18n system
---

## Completed overhaul summary

**Platform rename**: "أكاديمية جادي / Djadi Academy" → "منصة جعدي / Mounassata Djadi" applied throughout all frontend pages, layouts, admin pages, and API files. Logo image still contains old name (can't change image content).

**Language system**: Two translation APIs coexist:
- `t(ar, fr, en?)` — inline 3-arg signature (backward compat, existing call sites). `en` optional (falls back to fr).
- `tk(key: TranslationKey)` — key-based lookup from `src/lib/translations.ts` (preferred for new code; adding a new language only requires updating the catalog).
- `useLang()` exposes `{ lang, setLang, t, tk }`. `cycleLang()` in app-layout cycles ar→fr→en via globe button.
- Central catalog: `artifacts/djadi-academy/src/lib/translations.ts` — all string keys typed as `TranslationKey`.

**Why key-based tk() was added**: The inline `t()` approach requires touching every call site to add a new language. The centralized catalog means new languages only need one file changed.

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

**Session persistence (browser close/reopen)**: User object cached to `localStorage` key `djadi_user_cache` on every successful auth response. `ProtectedRoute` uses cached user as fallback on transient network errors (only redirects to login on definitive 401, not on network errors). Cache cleared on explicit logout. `cacheUser()`, `clearUserCache()` exported from `protected-route.tsx`.

**Why**: React Query cache is in-memory only — lost on browser restart. Cookie is 30-day persistent but React Query refetches on app load. Without the localStorage fallback, a brief server downtime on app load = user gets kicked to login screen.

**Admin auto-seed** — `artifacts/api-server/src/lib/seed-admin.ts` runs at startup when `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars are set and no super_admin exists yet. Called from `index.ts` after server starts listening.

**OpenAPI User schema** — added `role: string` field to the `User` schema in `lib/api-spec/openapi.yaml`. Regenerate with `pnpm --filter @workspace/api-spec run codegen` after any spec change.

**Vercel deployment** — `artifacts/djadi-academy/vercel.json` proxies `/api/*` → `https://djadiapp.onrender.com/api/*`. This keeps cookies same-origin on Vercel. Render service URL: `https://djadiapp.onrender.com`. Vercel frontend: `https://ss-woad.vercel.app`.

**CORS** — `artifacts/api-server/src/app.ts` supports comma-separated `FRONTEND_URL` for multiple allowed origins. Set `FRONTEND_URL=https://your-vercel-app.vercel.app` on Render.

**Vite proxy port** — `artifacts/djadi-academy/vite.config.ts` reads `API_PORT` env var (fallback 8080) for the dev proxy target. API server runs on port 8080 locally.

## Layout fixes

**Scroll model**: Both `AppLayout` and `AdminLayout` use `h-[100dvh] overflow-hidden` on the root container. Sidebar uses `h-full overflow-y-auto`; main content uses `flex-1 overflow-y-auto`. This creates a bounded viewport where only the content area scrolls, not the whole page.

**Why**: Previous `min-h-[100dvh]` root with `overflow-y-auto` on main created ambiguous nested-scroll behavior — both the page and the content area could scroll.

**Fixed `/favorites` missing layout**: Route was wrapped only in `ProtectedRoute`, not `ProtectedLayout`. Updated in `App.tsx` to use `<ProtectedLayout>` like all other protected routes.

**Why**: Without the layout wrapper, `/favorites` showed without the sidebar/bottom nav, breaking visual consistency.

## QueryClient tuning

`staleTime: 2 min`, `gcTime: 30 min`, `retry: 2` with exponential backoff. The longer gcTime means cached auth state survives normal tab switches and short navigation gaps.

## Database NOTE

`NEON_DATABASE_URL` is set as a Replit env var (not secret). Schema was pushed via `pnpm --filter @workspace/db run push`. New tables (homework, favorites, activity, audit_logs) are all created.
