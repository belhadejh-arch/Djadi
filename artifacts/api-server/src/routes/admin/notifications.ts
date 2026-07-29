import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const NotificationBody = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  body: z.string().min(1),
  bodyAr: z.string().min(1),
  targetType: z.enum(["all", "level", "branch", "subject"]).default("all"),
  targetId: z.number().int().nullable().optional(),
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(notificationsTable).orderBy(notificationsTable.createdAt);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id));
  if (!row) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json(row);
});

// Send (create + mark as sent)
router.post("/send", async (req: Request, res: Response): Promise<void> => {
  const parsed = NotificationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(notificationsTable).values({
    ...parsed.data,
    sentAt: new Date(),
  }).returning();
  res.status(201).json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
  res.json({ success: true });
});

export default router;
