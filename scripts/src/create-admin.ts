/**
 * Creates or resets the super_admin account.
 * Usage:
 *   DATABASE_URL=<your-db-url> pnpm tsx scripts/src/create-admin.ts
 *
 * Set ADMIN_EMAIL / ADMIN_PASSWORD env vars to override defaults.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { randomBytes, pbkdf2Sync } from "crypto";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error("❌  Set DATABASE_URL before running this script.");
  process.exit(1);
}

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@djadi.dz";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Djadi@2025!";
const ADMIN_NAME     = process.env.ADMIN_NAME     ?? "المدير العام";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

const pool = new Pool({ connectionString });
const db   = drizzle(pool, { schema: { usersTable } });

async function main() {
  const [existing] = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.email, ADMIN_EMAIL.toLowerCase()));

  if (existing) {
    // Update role and reset password
    await db
      .update(usersTable)
      .set({ role: "super_admin", passwordHash: hashPassword(ADMIN_PASSWORD), isActive: true })
      .where(eq(usersTable.id, existing.id));
    console.log(`✅  Updated existing user → role=super_admin`);
  } else {
    await db.insert(usersTable).values({
      fullName:     ADMIN_NAME,
      email:        ADMIN_EMAIL.toLowerCase(),
      passwordHash: hashPassword(ADMIN_PASSWORD),
      role:         "super_admin",
      isActive:     true,
    });
    console.log(`✅  Created super_admin account`);
  }

  console.log(`\n📧  Email   : ${ADMIN_EMAIL}`);
  console.log(`🔑  Password: ${ADMIN_PASSWORD}`);
  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
