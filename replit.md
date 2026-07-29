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

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
