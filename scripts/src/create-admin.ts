/**
 * Creates or resets the super_admin account.
 * Usage:
 *   NEON_DATABASE_URL=<your-db-url> pnpm --filter @workspace/scripts run create-admin
 *
 * Override defaults with env vars:
 *   ADMIN_EMAIL    (default: admin@djadi.dz)
 *   ADMIN_PASSWORD (default: Djadi@2025!)
 *   ADMIN_NAME     (default: المدير العام)
 */
import { eq } from "drizzle-orm";
import { db, pool, usersTable } from "@workspace/db";
import { randomBytes, pbkdf2Sync } from "crypto";

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? "admin@djadi.dz";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Djadi@2025!";
const ADMIN_NAME     = process.env.ADMIN_NAME     ?? "المدير العام";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const [existing] = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.email, ADMIN_EMAIL.toLowerCase()));

  if (existing) {
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
