import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, lessonsTable, subjectsTable } from "@workspace/db";
import { GetLessonParams, ListLessonsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/lessons", async (req: Request, res: Response): Promise<void> => {
  const query = ListLessonsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const subjectId = query.data.subjectId;

  const rows = subjectId
    ? await db
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
        .where(eq(lessonsTable.subjectId, subjectId))
    : await db
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
        .leftJoin(subjectsTable, eq(lessonsTable.subjectId, subjectsTable.id));

  res.json(
    rows.map((r) => ({
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
    }))
  );
});

router.get("/lessons/:id", async (req: Request, res: Response): Promise<void> => {
  const params = GetLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
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
    .where(eq(lessonsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.json({
    id: row.id,
    title: row.title,
    titleAr: row.titleAr,
    subjectId: row.subjectId,
    subjectName: row.subjectName ?? null,
    grade: row.grade,
    duration: row.duration,
    type: row.type,
    description: row.description ?? null,
    createdAt: row.createdAt,
  });
});

export default router;
