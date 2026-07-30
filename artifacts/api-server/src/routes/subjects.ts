import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq, isNull, or } from "drizzle-orm";
import { db, subjectsTable, sessionsTable, usersTable } from "@workspace/db";
import { GetSubjectParams } from "@workspace/api-zod";

const router: IRouter = Router();
const SESSION_COOKIE = "djadi_session";

async function getUserGrade(req: Request): Promise<string | null> {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) return null;

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  if (!session || session.expiresAt < new Date()) return null;

  const [user] = await db
    .select({ grade: usersTable.grade })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));

  return user?.grade ?? null;
}

router.get("/subjects", async (req: Request, res: Response): Promise<void> => {
  const grade = await getUserGrade(req);
  const branchIdParam = req.query.branchId;
  const branchId =
    branchIdParam !== undefined && !isNaN(parseInt(String(branchIdParam)))
      ? parseInt(String(branchIdParam))
      : null;

  const conditions = [];
  if (grade) conditions.push(eq(subjectsTable.grade, grade));
  if (branchId !== null) {
    conditions.push(
      or(isNull(subjectsTable.branchId), eq(subjectsTable.branchId, branchId))!
    );
  }

  const subjects =
    conditions.length > 0
      ? await db
          .select()
          .from(subjectsTable)
          .where(and(...conditions))
      : await db.select().from(subjectsTable);

  res.json(subjects.map((s) => ({
    id: s.id,
    name: s.name,
    nameAr: s.nameAr,
    nameFr: s.nameFr,
    grade: s.grade,
    color: s.color,
    icon: s.icon,
    lessonCount: s.lessonCount,
    description: s.description ?? null,
  })));
});

router.get("/subjects/:id", async (req: Request, res: Response): Promise<void> => {
  const params = GetSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [subject] = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.id, params.data.id));

  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }

  res.json({
    id: subject.id,
    name: subject.name,
    nameAr: subject.nameAr,
    nameFr: subject.nameFr,
    grade: subject.grade,
    color: subject.color,
    icon: subject.icon,
    lessonCount: subject.lessonCount,
    description: subject.description ?? null,
  });
});

export default router;
