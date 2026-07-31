# Agent Memory Index

- [Platform overhaul decisions](platform-overhaul.md) — single source of truth for levels/branches/subjects; student pages now fetch from DB not hardcoded branch-data.ts
- [Seed catalog script](seed-catalog-notes.md) — how to run scripts/seed-catalog.ts in this pnpm workspace (pg module resolution quirk)
- [Protected content links](protected-content-links.md) — student routes must return /api/files proxy paths, never raw external PDF links; videos via hardened in-app player only
