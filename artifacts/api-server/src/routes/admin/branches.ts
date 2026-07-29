import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, branchesTable, levelsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const BranchBody = z.object({
  nameAr: z.string().min(1),
  nameFr: z.string().min(1),
  code: z.string().min(1),
  levelId: z.number().int(),
  sortOrder: z.number().int().default(0),
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db
    .select({
      id: branchesTable.id,
      nameAr: branchesTable.nameAr,
      nameFr: branchesTable.nameFr,
      code: branchesTable.code,
      levelId: branchesTable.levelId,
      sortOrder: branchesTable.sortOrder,
      createdAt: branchesTable.createdAt,
      levelNameAr: levelsTable.nameAr,
      levelNameFr: levelsTable.nameFr,
    })
    .from(branchesTable)
    .leftJoin(levelsTable, eq(branchesTable.levelId, levelsTable.id))
    .orderBy(branchesTable.sortOrder);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(branchesTable).where(eq(branchesTable.id, id));
  if (!row) { res.status(404).json({ error: "Branch not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = BranchBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(branchesTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = BranchBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(branchesTable).set(parsed.data).where(eq(branchesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Branch not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(branchesTable).where(eq(branchesTable.id, id));
  res.json({ success: true });
});

export default router;
