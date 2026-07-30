/**
 * Activity routes (auth required)
 * POST /api/activity        — record a content view (lesson / exam / test / homework)
 * GET  /api/activity/recent — last viewed item per content type for current user
 * GET  /api/activity/last   — single most-recent item overall (for "continue" button)
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db, activityTable } from "@workspace/db";
import { requireAuth } from "../middlewares/require-auth";
import { z } from "zod/v4";

const router: IRouter = Router();
router.use(requireAuth);

// ── GET /recent — last viewed item per contentType ────────────────────────────
router.get("/recent", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;

  // Fetch last 100 to reliably pick the most recent per type
  const rows = await db.select().from(activityTable)
    .where(eq(activityTable.userId, userId))
    .orderBy(desc(activityTable.viewedAt))
    .limit(100);

  // Return last item per contentType (lesson, exam, test, homework)
  const TYPES = ["lesson", "exam", "test", "homework"] as const;
  const perType: Record<string, typeof rows[0]> = {};
  for (const row of rows) {
    const type = row.contentType ?? "lesson";
    if (!perType[type]) perType[type] = row;
  }

  const result = TYPES.map((t) => perType[t] ?? null).filter(Boolean);
  res.json(result);
});

// ── POST /  — record a content view ──────────────────────────────────────────
const RecordBody = z.object({
  // Lesson-legacy fields (kept for backward compat)
  lessonId:    z.number().int().optional(),
  lessonTitle: z.string().optional(),
  subjectName: z.string().optional(),
  // Generic fields for all content types
  contentType: z.enum(["lesson", "exam", "test", "homework"]).optional().default("lesson"),
  contentId:   z.number().int().optional(),
  contentTitle: z.string().optional(),
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const parsed = RecordBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { lessonId, lessonTitle, subjectName, contentType, contentId, contentTitle } = parsed.data;

  const resolvedType  = contentType ?? "lesson";
  const resolvedId    = contentId ?? lessonId ?? null;
  const resolvedTitle = contentTitle ?? lessonTitle ?? null;
  // lessonId FK only valid when it's a real lesson
  const resolvedLessonId = resolvedType === "lesson" ? (lessonId ?? contentId ?? null) : null;

  const [row] = await db.insert(activityTable).values({
    userId,
    lessonId:    resolvedLessonId,
    lessonTitle: resolvedTitle,
    subjectName: subjectName ?? null,
    contentType: resolvedType,
    contentId:   resolvedId,
  }).returning();

  // Keep only last 100 entries per user
  const allRows = await db.select({ id: activityTable.id }).from(activityTable)
    .where(eq(activityTable.userId, userId))
    .orderBy(desc(activityTable.viewedAt));
  if (allRows.length > 100) {
    const toDelete = allRows.slice(100);
    for (const r of toDelete) {
      await db.delete(activityTable).where(eq(activityTable.id, r.id));
    }
  }

  res.status(201).json(row);
});

export default router;
