/**
 * Favorites routes (auth required)
 * GET    /api/favorites          — list favorites for current user
 * POST   /api/favorites          — toggle (add/remove) a favorite
 * DELETE /api/favorites/:id      — remove by favorite id
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, favoritesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/require-auth";
import { z } from "zod/v4";

const router: IRouter = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const rows = await db.select().from(favoritesTable)
    .where(eq(favoritesTable.userId, userId))
    .orderBy(favoritesTable.createdAt);
  res.json(rows);
});

const ToggleBody = z.object({
  itemType: z.enum(["lesson", "exam", "test", "homework", "baccalaureate"]),
  itemId: z.number().int(),
  itemTitle: z.string().optional(),
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const parsed = ToggleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { itemType, itemId, itemTitle } = parsed.data;

  // Check if already favorited
  const [existing] = await db.select().from(favoritesTable).where(
    and(eq(favoritesTable.userId, userId), eq(favoritesTable.itemType, itemType), eq(favoritesTable.itemId, itemId))
  );

  if (existing) {
    // Remove favorite
    await db.delete(favoritesTable).where(eq(favoritesTable.id, existing.id));
    res.json({ favorited: false, id: existing.id });
  } else {
    // Add favorite
    const [row] = await db.insert(favoritesTable).values({
      userId, itemType, itemId, itemTitle: itemTitle ?? null,
    }).returning();
    res.status(201).json({ favorited: true, ...row });
  }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(favoritesTable).where(and(eq(favoritesTable.id, id), eq(favoritesTable.userId, userId)));
  res.json({ success: true });
});

export default router;
