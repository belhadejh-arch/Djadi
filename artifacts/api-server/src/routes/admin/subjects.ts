import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, subjectsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const SubjectBody = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  nameFr: z.string().min(1),
  grade: z.string().min(1),
  branchId: z.number().int().nullable().optional(),
  color: z.string().min(1),
  icon: z.string().min(1),
  description: z.string().nullable().optional(),
  lessonCount: z.number().int().default(0),
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(subjectsTable).orderBy(subjectsTable.createdAt);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, id));
  if (!row) { res.status(404).json({ error: "Subject not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = SubjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(subjectsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = SubjectBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(subjectsTable).set(parsed.data).where(eq(subjectsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Subject not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(subjectsTable).where(eq(subjectsTable.id, id));
  res.json({ success: true });
});

export default router;
