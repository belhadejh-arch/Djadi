---
name: Platform overhaul decisions
description: Key architecture and data decisions for Djadi Academy (منصة جعدي)
---

## Single Source of Truth — Admin ↔ Student sync

**Rule:** Levels, branches, and subjects live in one set of DB tables shared by both
the admin panel and student-facing pages. Never hardcode catalog data in the frontend.

**Why:** The original codebase had hardcoded `branch-data.ts` with grades/branches/subjects
in the student frontend, while the admin panel wrote to DB. The user explicitly required
real-time sync and a single source of truth.

**How to apply:**
- Student pages (`grade-select`, `branch-select`, `subjects`, `dashboard`) use the generated
  `useListLevels`, `useListBranches(params)`, `useListSubjects(params)` hooks from
  `@workspace/api-client-react`.
- Public API routes: `GET /api/levels`, `GET /api/branches?levelCode=X`,
  `GET /api/subjects?branchId=X` — all read from shared DB tables, no auth needed.
- The subjects route auto-filters by the authenticated user's grade (from session cookie);
  no grade param needed from the frontend.
- `branch-data.ts` is now dead code (unused by student pages); it can be removed later.
- DB was seeded with the original hardcoded data via `scripts/src/seed-levels-branches-subjects.ts`.

## Branch storage in localStorage

**Rule:** `use-branch.ts` stores `branchId` as a string in localStorage. New DB branches
have integer IDs. Parse with `parseInt()` before passing to API queries. Guard against
`NaN` (old string IDs like "tronc-sciences" will no longer match — treat as null).

## Icon field on subjects

Subjects use `icon` as a plain text/emoji string (e.g. "🧮", "📖"). Render directly inside
a colored div — no Lucide icon mapping needed.

## Rename

Platform was renamed from "منصة جعدي / Mounassata Djadi" — branding is "Djadi Academy".
