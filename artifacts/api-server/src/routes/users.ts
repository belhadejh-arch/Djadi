import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { UpdateGradeBody } from "@workspace/api-zod";

const router: IRouter = Router();
const SESSION_COOKIE = "djadi_session";

async function getAuthUser(req: Request): Promise<typeof usersTable.$inferSelect | null> {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) return null;

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  if (!session || session.expiresAt < new Date()) return null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));

  return user ?? null;
}

router.patch("/users/grade", async (req: Request, res: Response): Promise<void> => {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = UpdateGradeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ grade: parsed.data.grade })
    .where(eq(usersTable.id, user.id))
    .returning();

  if (!updated) {
    res.status(500).json({ error: "Failed to update grade" });
    return;
  }

  res.json({
    id: updated.id,
    fullName: updated.fullName,
    email: updated.email,
    grade: updated.grade ?? null,
    avatarUrl: updated.avatarUrl ?? null,
    createdAt: updated.createdAt,
  });
});

export default router;
