import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, baccalaureatePapersTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const PaperBody = z.object({
  year: z.number().int().min(1990).max(2100),
  grade: z.string().min(1).default("troisieme"),
  subjectId: z.number().int().nullable().optional(),
  branchId: z.number().int().nullable().optional(),
  title: z.string().nullable().optional(),
  // legacy text fields — kept for backward compat, auto-derived when possible
  subject: z.string().default(""),
  subjectAr: z.string().default(""),
  link: z.string().url(),
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(baccalaureatePapersTable).orderBy(baccalaureatePapersTable.year);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(baccalaureatePapersTable).where(eq(baccalaureatePapersTable.id, id));
  if (!row) { res.status(404).json({ error: "Paper not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = PaperBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(baccalaureatePapersTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = PaperBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(baccalaureatePapersTable).set(parsed.data).where(eq(baccalaureatePapersTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Paper not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(baccalaureatePapersTable).where(eq(baccalaureatePapersTable.id, id));
  res.json({ success: true });
});

export default router;
