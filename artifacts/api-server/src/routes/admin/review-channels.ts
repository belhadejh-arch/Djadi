import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, reviewChannelsTable, reviewChannelVideosTable, subjectsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const ChannelBody = z.object({
  channelName: z.string().min(1),
  teacherName: z.string().min(1),
  subjectId: z.number().int().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

const VideoBody = z.object({
  title: z.string().min(1),
  titleAr: z.string().min(1),
  videoUrl: z.string().url(),
  sortOrder: z.number().int().default(0),
});

// List channels
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db
    .select({
      id: reviewChannelsTable.id,
      channelName: reviewChannelsTable.channelName,
      teacherName: reviewChannelsTable.teacherName,
      subjectId: reviewChannelsTable.subjectId,
      subjectName: subjectsTable.name,
      imageUrl: reviewChannelsTable.imageUrl,
      sortOrder: reviewChannelsTable.sortOrder,
      createdAt: reviewChannelsTable.createdAt,
    })
    .from(reviewChannelsTable)
    .leftJoin(subjectsTable, eq(reviewChannelsTable.subjectId, subjectsTable.id))
    .orderBy(reviewChannelsTable.sortOrder);
  res.json(rows);
});

// Get channel with videos
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [channel] = await db.select().from(reviewChannelsTable).where(eq(reviewChannelsTable.id, id));
  if (!channel) { res.status(404).json({ error: "Channel not found" }); return; }
  const videos = await db.select().from(reviewChannelVideosTable)
    .where(eq(reviewChannelVideosTable.channelId, id))
    .orderBy(reviewChannelVideosTable.sortOrder);
  res.json({ ...channel, videos });
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = ChannelBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(reviewChannelsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = ChannelBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(reviewChannelsTable).set(parsed.data).where(eq(reviewChannelsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Channel not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(reviewChannelsTable).where(eq(reviewChannelsTable.id, id));
  res.json({ success: true });
});

// Videos sub-resource
router.post("/:id/videos", async (req: Request, res: Response): Promise<void> => {
  const channelId = parseInt(String(req.params.id));
  if (isNaN(channelId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = VideoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(reviewChannelVideosTable).values({ ...parsed.data, channelId }).returning();
  res.status(201).json(row);
});

router.patch("/:id/videos/:videoId", async (req: Request, res: Response): Promise<void> => {
  const videoId = parseInt(String(req.params.videoId));
  if (isNaN(videoId)) { res.status(400).json({ error: "Invalid video id" }); return; }
  const parsed = VideoBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(reviewChannelVideosTable).set(parsed.data).where(eq(reviewChannelVideosTable.id, videoId)).returning();
  if (!row) { res.status(404).json({ error: "Video not found" }); return; }
  res.json(row);
});

router.delete("/:id/videos/:videoId", async (req: Request, res: Response): Promise<void> => {
  const videoId = parseInt(String(req.params.videoId));
  if (isNaN(videoId)) { res.status(400).json({ error: "Invalid video id" }); return; }
  await db.delete(reviewChannelVideosTable).where(eq(reviewChannelVideosTable.id, videoId));
  res.json({ success: true });
});

export default router;
