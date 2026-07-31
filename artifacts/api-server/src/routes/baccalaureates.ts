import { Router, type IRouter, type Request, type Response } from "express";
import { desc } from "drizzle-orm";
import { db, baccalaureatePapersTable } from "@workspace/db";
import { internalFilePath } from "./secure-files";

const router: IRouter = Router();

// Public: list baccalaureate papers (student-facing).
// The raw external link is never exposed — students receive the internal
// protected path (/api/files/bac/:id) which requires an authenticated session.
router.get("/baccalaureates", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db
    .select({
      id: baccalaureatePapersTable.id,
      year: baccalaureatePapersTable.year,
      branchId: baccalaureatePapersTable.branchId,
      subjectId: baccalaureatePapersTable.subjectId,
      title: baccalaureatePapersTable.title,
    })
    .from(baccalaureatePapersTable)
    .orderBy(desc(baccalaureatePapersTable.year));
  res.json(rows.map((r) => ({ ...r, link: internalFilePath("bac", r.id) })));
});

export default router;
