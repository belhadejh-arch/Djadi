import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, examsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const ExamBody = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  subjectId: z.number().int().nullable().optional(),
  grade: z.string().min(1),
  link: z.string().url(),
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(examsTable).orderBy(examsTable.createdAt);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(examsTable).where(eq(examsTable.id, id));
  if (!row) { res.status(404).json({ error: "Exam not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = ExamBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(examsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = ExamBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(examsTable).set(parsed.data).where(eq(examsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Exam not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(examsTable).where(eq(examsTable.id, id));
  res.json({ success: true });
});

export default router;
