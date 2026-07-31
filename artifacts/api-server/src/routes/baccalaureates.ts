import { Router, type IRouter, type Request, type Response } from "express";
import { desc } from "drizzle-orm";
import { db, baccalaureatePapersTable } from "@workspace/db";

const router: IRouter = Router();

// Public: list baccalaureate papers (student-facing)
router.get("/baccalaureates", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db
    .select({
      id: baccalaureatePapersTable.id,
      year: baccalaureatePapersTable.year,
      branchId: baccalaureatePapersTable.branchId,
      subjectId: baccalaureatePapersTable.subjectId,
      title: baccalaureatePapersTable.title,
      link: baccalaureatePapersTable.link,
    })
    .from(baccalaureatePapersTable)
    .orderBy(desc(baccalaureatePapersTable.year));
  res.json(rows);
});

export default router;
