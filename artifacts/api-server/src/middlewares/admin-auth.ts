import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";

const SESSION_COOKIE = "djadi_session";

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: "Session expired" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (user.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden: admin access required" });
    return;
  }

  // Attach user to request for downstream handlers
  (req as any).adminUser = user;
  next();
}
