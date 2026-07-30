import { Router, type IRouter, type Request, type Response } from "express";
import { db, levelsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/levels", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(levelsTable).orderBy(levelsTable.sortOrder);
  res.json(rows);
});

export default router;
