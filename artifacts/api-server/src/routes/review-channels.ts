import { Router, type IRouter, type Request, type Response } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, reviewChannelsTable, reviewChannelVideosTable, subjectsTable } from "@workspace/db";
import { maskVideoUrl } from "./secure-files";

const router: IRouter = Router();

// Public: list review channels with their videos (student-facing)
router.get("/review-channels", async (_req: Request, res: Response): Promise<void> => {
  const channels = await db
    .select({
      id: reviewChannelsTable.id,
      channelName: reviewChannelsTable.channelName,
      teacherName: reviewChannelsTable.teacherName,
      subjectId: reviewChannelsTable.subjectId,
      subjectName: subjectsTable.nameAr,
      subjectColor: subjectsTable.color,
      imageUrl: reviewChannelsTable.imageUrl,
      sortOrder: reviewChannelsTable.sortOrder,
    })
    .from(reviewChannelsTable)
    .leftJoin(subjectsTable, eq(reviewChannelsTable.subjectId, subjectsTable.id))
    .orderBy(reviewChannelsTable.sortOrder);

  const ids = channels.map((c) => c.id);
  const videos = ids.length
    ? await db
        .select()
        .from(reviewChannelVideosTable)
        .where(inArray(reviewChannelVideosTable.channelId, ids))
        .orderBy(reviewChannelVideosTable.sortOrder)
    : [];

  // Mask video URLs: students never receive the raw stored link —
  // YouTube becomes a contained nocookie embed, others the protected proxy path.
  res.json(
    channels.map((c) => ({
      ...c,
      videos: videos
        .filter((v) => v.channelId === c.id)
        .map((v) => ({ ...v, videoUrl: maskVideoUrl("channel-video", v.id, v.videoUrl) })),
    }))
  );
});

export default router;
