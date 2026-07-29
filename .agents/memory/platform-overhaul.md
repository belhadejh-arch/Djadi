---
name: Platform Overhaul — Djadi Academy → Mounassata Djadi
description: Key decisions and structure from the complete platform overhaul
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

**Why:**
- User spec required homework as a 4th content type equal to lessons/exams/tests
- Favorites and last activity are standard student features per spec
- PDF must open inside app (not external browser) — use iframe overlay
- YouTube videos already embedded inline in review-channels page via full-screen iframe overlay

**Database NOTE**: DATABASE_URL secret not yet connected — API server starts but all DB features return errors until Postgres is connected. The new tables (homework, favorites, activity) will auto-migrate once DB is connected via Drizzle push.
