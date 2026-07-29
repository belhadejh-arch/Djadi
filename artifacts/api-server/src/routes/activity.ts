/**
 * Activity routes (auth required)
 * POST /api/activity        — record a lesson view
 * GET  /api/activity/recent — last N items for current user (default 5)
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db, activityTable } from "@workspace/db";
import { requireAuth } from "../middlewares/require-auth";
import { z } from "zod/v4";

const router: IRouter = Router();
router.use(requireAuth);

router.get("/recent", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const limit = Math.min(parseInt(String(req.query.limit ?? "5")), 20);
  const rows = await db.select().from(activityTable)
    .where(eq(activityTable.userId, userId))
    .orderBy(desc(activityTable.viewedAt))
    .limit(limit);
  res.json(rows);
});

const RecordBody = z.object({
  lessonId: z.number().int(),
  lessonTitle: z.string().optional(),
  subjectName: z.string().optional(),
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const parsed = RecordBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { lessonId, lessonTitle, subjectName } = parsed.data;

  // Upsert: update viewedAt if already exists for this user+lesson
  const [existing] = await db.select().from(activityTable)
    .where(eq(activityTable.userId, userId))
    // find the most recent entry for same lesson
    .orderBy(desc(activityTable.viewedAt))
    .limit(1);

  // Insert new entry (keep history)
  const [row] = await db.insert(activityTable).values({
    userId, lessonId, lessonTitle: lessonTitle ?? null, subjectName: subjectName ?? null,
  }).returning();

  // Keep only last 50 entries per user (cleanup)
  const allRows = await db.select({ id: activityTable.id }).from(activityTable)
    .where(eq(activityTable.userId, userId))
    .orderBy(desc(activityTable.viewedAt));
  if (allRows.length > 50) {
    const toDelete = allRows.slice(50);
    for (const r of toDelete) {
      await db.delete(activityTable).where(eq(activityTable.id, r.id));
    }
  }

  res.status(201).json(row);
});

export default router;
