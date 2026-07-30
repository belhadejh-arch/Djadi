/**
 * Favorites routes (auth required)
 * GET    /api/favorites             — list favorites for current user (sorted)
 * POST   /api/favorites             — toggle (add/remove) a favorite
 * DELETE /api/favorites/:id         — remove by favorite id
 * PATCH  /api/favorites/reorder     — update sort order for a content type
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq, asc, desc } from "drizzle-orm";
import { db, favoritesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/require-auth";
import { z } from "zod/v4";

const router: IRouter = Router();
router.use(requireAuth);

// ── GET / ─────────────────────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const rows = await db.select().from(favoritesTable)
    .where(eq(favoritesTable.userId, userId))
    .orderBy(asc(favoritesTable.sortOrder), asc(favoritesTable.createdAt));
  res.json(rows);
});

// ── POST / (toggle) ───────────────────────────────────────────────────────────
const ToggleBody = z.object({
  itemType:  z.enum(["lesson", "exam", "test", "homework", "baccalaureate"]),
  itemId:    z.number().int(),
  itemTitle: z.string().optional(),
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const parsed = ToggleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { itemType, itemId, itemTitle } = parsed.data;

  const [existing] = await db.select().from(favoritesTable).where(
    and(
      eq(favoritesTable.userId, userId),
      eq(favoritesTable.itemType, itemType),
      eq(favoritesTable.itemId, itemId),
    )
  );

  if (existing) {
    await db.delete(favoritesTable).where(eq(favoritesTable.id, existing.id));
    res.json({ favorited: false, id: existing.id });
  } else {
    // Compute next sortOrder for this type (place at end)
    const existing = await db.select({ sortOrder: favoritesTable.sortOrder })
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.itemType, itemType)))
      .orderBy(desc(favoritesTable.sortOrder))
      .limit(1);
    const nextOrder = (existing[0]?.sortOrder ?? -1) + 1;

    const [row] = await db.insert(favoritesTable).values({
      userId, itemType, itemId, itemTitle: itemTitle ?? null, sortOrder: nextOrder,
    }).returning();
    res.status(201).json({ favorited: true, ...row });
  }
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(favoritesTable).where(and(eq(favoritesTable.id, id), eq(favoritesTable.userId, userId)));
  res.json({ success: true });
});

// ── PATCH /reorder ────────────────────────────────────────────────────────────
const ReorderBody = z.object({
  itemType:   z.enum(["lesson", "exam", "test", "homework", "baccalaureate"]),
  orderedIds: z.array(z.number().int()).min(1),
});

router.patch("/reorder", async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).authUser.id;
  const parsed = ReorderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { orderedIds } = parsed.data;

  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(favoritesTable)
      .set({ sortOrder: i })
      .where(and(eq(favoritesTable.id, orderedIds[i]), eq(favoritesTable.userId, userId)));
  }

  res.json({ success: true });
});

export default router;
