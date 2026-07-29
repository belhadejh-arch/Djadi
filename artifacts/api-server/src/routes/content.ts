/**
 * Student-facing content routes (read-only, auth required)
 * GET /api/content/exams?subjectId=&grade=&semester=
 * GET /api/content/tests?subjectId=&grade=&semester=
 * GET /api/content/homework?subjectId=&grade=&semester=
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, examsTable, testsTable, homeworkTable } from "@workspace/db";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();
router.use(requireAuth);

router.get("/exams", async (req: Request, res: Response): Promise<void> => {
  const { subjectId, grade } = req.query as Record<string, string>;
  const sid = subjectId ? parseInt(subjectId) : null;
  const conditions = [
    ...(sid ? [eq(examsTable.subjectId, sid)] : []),
    ...(grade ? [eq(examsTable.grade, grade)] : []),
  ];
  const rows = await db.select().from(examsTable)
    .where(conditions.length === 1 ? conditions[0] : conditions.length > 1 ? and(...conditions) : undefined)
    .orderBy(examsTable.createdAt);
  res.json(rows);
});

router.get("/tests", async (req: Request, res: Response): Promise<void> => {
  const { subjectId, grade } = req.query as Record<string, string>;
  const sid = subjectId ? parseInt(subjectId) : null;
  const conditions = [
    ...(sid ? [eq(testsTable.subjectId, sid)] : []),
    ...(grade ? [eq(testsTable.grade, grade)] : []),
  ];
  const rows = await db.select().from(testsTable)
    .where(conditions.length === 1 ? conditions[0] : conditions.length > 1 ? and(...conditions) : undefined)
    .orderBy(testsTable.createdAt);
  res.json(rows);
});

router.get("/homework", async (req: Request, res: Response): Promise<void> => {
  const { subjectId, grade } = req.query as Record<string, string>;
  const sid = subjectId ? parseInt(subjectId) : null;
  const conditions = [
    ...(sid ? [eq(homeworkTable.subjectId, sid)] : []),
    ...(grade ? [eq(homeworkTable.grade, grade)] : []),
  ];
  const rows = await db.select().from(homeworkTable)
    .where(conditions.length === 1 ? conditions[0] : conditions.length > 1 ? and(...conditions) : undefined)
    .orderBy(homeworkTable.createdAt);
  res.json(rows);
});

export default router;
