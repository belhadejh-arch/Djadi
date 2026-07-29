import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, levelsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const LevelBody = z.object({
  nameAr: z.string().min(1),
  nameFr: z.string().min(1),
  code: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(levelsTable).orderBy(levelsTable.sortOrder);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(levelsTable).where(eq(levelsTable.id, id));
  if (!row) { res.status(404).json({ error: "Level not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = LevelBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(levelsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = LevelBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(levelsTable).set(parsed.data).where(eq(levelsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Level not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(levelsTable).where(eq(levelsTable.id, id));
  res.json({ success: true });
});

export default router;
