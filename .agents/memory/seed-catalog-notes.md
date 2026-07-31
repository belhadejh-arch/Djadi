---
name: Seed catalog script
description: How to run scripts/seed-catalog.ts in this pnpm workspace — pg module resolution quirk
---

## Rule
`scripts/seed-catalog.ts` imports `pg`. ESM resolves packages from the **file's location**, not CWD. `pg` is only declared in `lib/db/package.json`, so running the script directly from the workspace root fails with `ERR_MODULE_NOT_FOUND`.

## How to apply
Copy the script into `lib/db/src/`, run it, then delete the copy:

```bash
cp scripts/seed-catalog.ts lib/db/src/seed-catalog.ts
/home/runner/.npm/_npx/fd45a72a545557e9/node_modules/.bin/tsx lib/db/src/seed-catalog.ts
rm lib/db/src/seed-catalog.ts
```

`tsx` is not in PATH; run it via `npx -y tsx <file>` (cached npx paths change between sessions — do not hardcode them).

**Why:** pnpm virtual store — `node_modules/pg` is only symlinked inside `lib/db/node_modules`, not the workspace root. Node ESM walks up from the file's directory, so the file must live inside a package that declares `pg`.

## Constraints found in branches/subjects schema
- `levels` table: has unique constraint on `code` — `ON CONFLICT (code) DO UPDATE` works.
- `branches` table: **no** unique constraint on `code` — use `SELECT … WHERE code=$1` + conditional INSERT/UPDATE.
- `subjects` table: **no** unique constraint — use `SELECT … WHERE grade=$1 AND branch_id=$2 AND name=$3` + conditional INSERT.
