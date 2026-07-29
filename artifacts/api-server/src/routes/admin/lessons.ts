import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, lessonsTable, subjectsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const LessonBody = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  subjectId: z.number().int(),
  grade: z.string().min(1),
  duration: z.number().int().default(30),
  type: z.enum(["video", "pdf", "link"]).default("pdf"),
  description: z.string().nullable().optional(),
  pdfUrl: z.string().url().nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
  linkUrl: z.string().url().nullable().optional(),
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { subjectId } = req.query as { subjectId?: string };
  let query = db
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
      pdfUrl: lessonsTable.pdfUrl,
      videoUrl: lessonsTable.videoUrl,
      linkUrl: lessonsTable.linkUrl,
      createdAt: lessonsTable.createdAt,
    })
    .from(lessonsTable)
    .leftJoin(subjectsTable, eq(lessonsTable.subjectId, subjectsTable.id));

  if (subjectId) {
    query = query.where(eq(lessonsTable.subjectId, parseInt(subjectId))) as typeof query;
  }

  const rows = await query.orderBy(lessonsTable.createdAt);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id));
  if (!row) { res.status(404).json({ error: "Lesson not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = LessonBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(lessonsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = LessonBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(lessonsTable).set(parsed.data).where(eq(lessonsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Lesson not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(lessonsTable).where(eq(lessonsTable.id, id));
  res.json({ success: true });
});

export default router;
