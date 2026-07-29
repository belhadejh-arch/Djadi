import { Router, type IRouter, type Request, type Response } from "express";
import { eq, count } from "drizzle-orm";
import { db, lessonsTable, subjectsTable, sessionsTable, usersTable } from "@workspace/db";

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

router.get("/dashboard/summary", async (req: Request, res: Response): Promise<void> => {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const grade = user.grade;

  // Get subjects for user's grade
  const subjects = grade
    ? await db.select().from(subjectsTable).where(eq(subjectsTable.grade, grade))
    : await db.select().from(subjectsTable);

  // Get total lesson count
  const [lessonCountRow] = await db.select({ value: count() }).from(lessonsTable);
  const totalLessons = lessonCountRow?.value ?? 0;

  // Get recent lessons (last 5)
  const recentRows = await db
    .select({
      id: lessonsTable.id,
      title: lessonsTable.title,
      titleAr: lessonsTable.titleAr,
      subjectId: lessonsTable.subjectId,
      subjectName: subjectsTable.name,
      grade: lessonsTable.grade,
      duration: lessonsTable.duration,
      type: lessonsTable.type,
      description: lessonsTable.description,
      createdAt: lessonsTable.createdAt,
    })
    .from(lessonsTable)
    .leftJoin(subjectsTable, eq(lessonsTable.subjectId, subjectsTable.id))
    .limit(5);

  const recentLessons = recentRows.map((r) => ({
    id: r.id,
    title: r.title,
    titleAr: r.titleAr,
    subjectId: r.subjectId,
    subjectName: r.subjectName ?? null,
    grade: r.grade,
    duration: r.duration,
    type: r.type,
    description: r.description ?? null,
    createdAt: r.createdAt,
  }));

  const subjectProgress = subjects.map((s) => ({
    subjectId: s.id,
    subjectName: s.name,
    subjectNameAr: s.nameAr,
    lessonCount: s.lessonCount,
    color: s.color,
  }));

  res.json({
    totalSubjects: subjects.length,
    totalLessons,
    recentLessons,
    subjectProgress,
  });
});

export default router;
