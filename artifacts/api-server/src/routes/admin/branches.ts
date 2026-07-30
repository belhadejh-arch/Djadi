import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, branchesTable, levelsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const BranchBody = z.object({
  nameAr: z.string().min(1),
  nameFr: z.string().min(1),
  code: z.string().min(1),
  levelIds: z.array(z.number().int()).min(1, "يجب اختيار مستوى واحد على الأقل"),
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
      levelIds: branchesTable.levelIds,
      sortOrder: branchesTable.sortOrder,
      createdAt: branchesTable.createdAt,
      levelNameAr: levelsTable.nameAr,
      levelNameFr: levelsTable.nameFr,
    })
    .from(branchesTable)
    .leftJoin(levelsTable, eq(branchesTable.levelId, levelsTable.id))
    .orderBy(branchesTable.sortOrder);

  // Ensure levelIds is always populated (backward compat for rows created before the column existed)
  const result = rows.map((r) => ({
    ...r,
    levelIds: r.levelIds && r.levelIds.length > 0 ? r.levelIds : [r.levelId],
  }));

  res.json(result);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(branchesTable).where(eq(branchesTable.id, id));
  if (!row) { res.status(404).json({ error: "Branch not found" }); return; }
  const levelIds = row.levelIds && row.levelIds.length > 0 ? row.levelIds : [row.levelId];
  res.json({ ...row, levelIds });
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = BranchBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { levelIds, ...rest } = parsed.data;
  const [row] = await db.insert(branchesTable).values({
    ...rest,
    levelId: levelIds[0],
    levelIds,
  }).returning();
  res.status(201).json({ ...row, levelIds: row.levelIds && row.levelIds.length > 0 ? row.levelIds : [row.levelId] });
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = BranchBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { levelIds, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (levelIds) {
    updateData.levelId = levelIds[0];
    updateData.levelIds = levelIds;
  }
  const [row] = await db.update(branchesTable).set(updateData).where(eq(branchesTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Branch not found" }); return; }
  res.json({ ...row, levelIds: row.levelIds && row.levelIds.length > 0 ? row.levelIds : [row.levelId] });
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(branchesTable).where(eq(branchesTable.id, id));
  res.json({ success: true });
});

export default router;
