# Djadi Academy

A premium educational platform for Algerian secondary school students (1ère, 2ème, 3ème Secondaire) preparing for the Baccalaureate — bilingual Arabic/French, dark mode, Changa font.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/djadi-academy/src/` — React + Vite + Wouter + Tailwind v4
- API routes: `artifacts/api-server/src/routes/` — auth, users, subjects, lessons, dashboard
- DB schema: `lib/db/src/schema/` — users, sessions, subjects, lessons tables
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Logo asset: `attached_assets/IMG_0796_1785328682791.png`

## Admin Panel

Super Admin panel at `/admin` — requires `role = "super_admin"` on the user record.

Sections:
- **Users** — list, search, create, edit, delete, activate/deactivate + stats
- **Levels** — CRUD for grade levels (1ère, 2ème, 3ème secondaire)
- **Branches** — CRUD for branches (شعب) linked to levels
- **Subjects** — CRUD for subjects with grade/branch/color/icon
- **Lessons** — CRUD with PDF/video/link URL fields
- **Exams** (فروض) — link-only CRUD
- **Tests** (اختبارات) — link-only CRUD
- **Baccalaureates** — past bac papers with year, subject, link
- **Review Channels** — channel + videos management
- **Announcements** — bilingual (AR/FR), active/inactive, date range
- **Notifications** — send to all / level / branch / subject
- **Language Settings** — key-value translations per language code

API routes: all under `/api/admin/*`, protected by `requireAdmin` middleware.

To promote a user to super_admin, run:
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'your@email.com';
```

## Architecture decisions

- Admin panel uses a separate `AdminRoute` guard and `AdminLayout` — completely decoupled from the student app layout.
- Admin API routes import `zod/v4` (matching the rest of the project) and live under `artifacts/api-server/src/routes/admin/`.
- New DB tables: `levels`, `branches`, `exams`, `tests`, `baccalaureate_papers`, `review_channels`, `review_channel_videos`, `announcements`, `notifications`, `language_settings`. Existing `users` table gained `role` and `is_active` columns; `lessons` gained `pdf_url`, `video_url`, `link_url`.
- Run `pnpm --filter @workspace/db run push` after connecting DATABASE_URL to apply the new schema.

## Product

Djadi Academy is a bilingual (Arabic/French) educational platform for Algerian secondary school students preparing for the Baccalaureate. Students select their level and branch, access subject-specific lessons (PDF, video, link), past bac papers, mock exams, review channels, and receive notifications.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Audit Logs need a DB migration** — after connecting `DATABASE_URL`, run `pnpm --filter @workspace/db run push` to create the `audit_logs` table before the admin audit-log page will populate.
- Rate limiting is **disabled in development** (`NODE_ENV !== "production"`) — it activates automatically on deployment.
- Session cookies use `secure: true` only in production (HTTPS). Locally they work over HTTP.
- Backup files are stored in `artifacts/api-server/backups/` — they persist across restarts but are not in the git repo (add to `.gitignore` if needed).

## Security layer (Feature 22)

- `helmet` — HTTP security headers on all API responses (HSTS in production)
- `express-rate-limit` — 15 attempts / 15 min on login & register (production only)
- `requireAuth` middleware (`middlewares/require-auth.ts`) — protects `/api/lessons/:id/content`
- Lesson content URLs (PDF/video/link) served only to authenticated users via `/api/lessons/:id/content`
- Session cookies: `httpOnly: true`, `secure: true` (production), `sameSite: lax`
- RBAC: `requireAdmin` middleware for all `/api/admin/*` routes
- Audit Logs: admin actions (CREATE/UPDATE/DELETE on users) logged to `audit_logs` table
- Admin panel: role check (`super_admin`) on both frontend and backend

## Performance layer (Feature 23)

- All page components lazy-loaded with `React.lazy()` + `Suspense` skeleton fallback
- React Query: `staleTime: 30s`, `gcTime: 5min` — avoids redundant network requests
- Dashboard stats: single parallel aggregation query for all counts
- API body size capped at 10 MB

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
