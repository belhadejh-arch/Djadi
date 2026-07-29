/**
 * Automatically creates the super_admin account at server startup
 * when ADMIN_EMAIL and ADMIN_PASSWORD environment variables are set
 * AND no super_admin exists yet.
 *
 * Set these on Render (env vars, not in code):
 *   ADMIN_EMAIL    — admin account email
 *   ADMIN_PASSWORD — admin account password
 *   ADMIN_NAME     — (optional) display name, defaults to "المدير العام"
 */
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { hashPassword } from "./auth";
import { logger } from "./logger";

export async function seedAdminIfNeeded(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    // Env vars not set — skip silently (normal in dev without creds)
    return;
  }

  const name = process.env.ADMIN_NAME ?? "المدير العام";

  try {
    // Check if a super_admin already exists (any email)
    const [existing] = await db
      .select({ id: usersTable.id, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.role, "super_admin"));

    if (existing) {
      logger.info({ email: existing.email }, "super_admin already exists — skipping seed");
      return;
    }

    // No admin exists — create one
    await db.insert(usersTable).values({
      fullName: name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role: "super_admin",
      isActive: true,
    });

    logger.info({ email }, "✅  super_admin account created from env vars");
  } catch (err) {
    // Log but don't crash the server — DB may not be migrated yet
    logger.error({ err }, "⚠️  Failed to seed super_admin (DB may need migration)");
  }
}
