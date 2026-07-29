import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, announcementsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const AnnouncementBody = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  content: z.string().min(1),
  contentAr: z.string().min(1),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
});

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(announcementsTable).orderBy(announcementsTable.createdAt);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id));
  if (!row) { res.status(404).json({ error: "Announcement not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = AnnouncementBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { startsAt, endsAt, ...rest } = parsed.data;
  const [row] = await db.insert(announcementsTable).values({
    ...rest,
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
  }).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AnnouncementBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { startsAt, endsAt, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { ...rest };
  if (startsAt !== undefined) updates.startsAt = startsAt ? new Date(startsAt) : null;
  if (endsAt !== undefined) updates.endsAt = endsAt ? new Date(endsAt) : null;
  const [row] = await db.update(announcementsTable).set(updates).where(eq(announcementsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Announcement not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  res.json({ success: true });
});

export default router;
