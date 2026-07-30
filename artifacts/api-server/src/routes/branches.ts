import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, branchesTable, levelsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/branches", async (req: Request, res: Response): Promise<void> => {
  const { levelCode } = req.query;

  let rows = await db.select().from(branchesTable).orderBy(branchesTable.sortOrder);

  if (levelCode && typeof levelCode === "string") {
    const [level] = await db
      .select({ id: levelsTable.id })
      .from(levelsTable)
      .where(eq(levelsTable.code, levelCode));

    if (!level) {
      res.json([]);
      return;
    }

    rows = rows.filter((b) => {
      const ids =
        b.levelIds && b.levelIds.length > 0 ? b.levelIds : [b.levelId];
      return ids.includes(level.id);
    });
  }

  res.json(
    rows.map((b) => ({
      ...b,
      levelIds:
        b.levelIds && b.levelIds.length > 0 ? b.levelIds : [b.levelId],
    }))
  );
});

export default router;
