import { Router, type IRouter, type Request, type Response } from "express";
import { desc, count, eq, gte } from "drizzle-orm";
import { db, auditLogsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { page = "1", limit = "50", action, entity } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  let query = db.select().from(auditLogsTable);
  let countQuery = db.select({ total: count() }).from(auditLogsTable);

  if (action) {
    query = query.where(eq(auditLogsTable.action, action)) as typeof query;
    countQuery = countQuery.where(eq(auditLogsTable.action, action)) as typeof countQuery;
  }
  if (entity) {
    query = query.where(eq(auditLogsTable.entity, entity)) as typeof query;
    countQuery = countQuery.where(eq(auditLogsTable.entity, entity)) as typeof countQuery;
  }

  const [logs, [{ total }]] = await Promise.all([
    query.orderBy(desc(auditLogsTable.createdAt)).limit(limitNum).offset(offset),
    countQuery,
  ]);

  res.json({ data: logs, total, page: pageNum, limit: limitNum });
});

router.delete("/clear", async (_req: Request, res: Response): Promise<void> => {
  // Keep last 30 days only
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  await db.delete(auditLogsTable).where(gte(auditLogsTable.createdAt, cutoff));
  await db.delete(auditLogsTable);
  res.json({ success: true });
});

export default router;
