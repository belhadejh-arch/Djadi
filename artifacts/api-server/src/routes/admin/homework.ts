import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, homeworkTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const HomeworkBody = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  subjectId: z.number().int().nullable().optional(),
  grade: z.string().min(1),
  semester: z.string().default("1"),
  link: z.string().url(),
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(homeworkTable).orderBy(homeworkTable.createdAt);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(homeworkTable).where(eq(homeworkTable.id, id));
  if (!row) { res.status(404).json({ error: "Homework not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = HomeworkBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(homeworkTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = HomeworkBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(homeworkTable).set(parsed.data).where(eq(homeworkTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Homework not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(homeworkTable).where(eq(homeworkTable.id, id));
  res.json({ success: true });
});

export default router;
