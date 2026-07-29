import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, languageSettingsTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

const SettingBody = z.object({
  langCode: z.string().min(1),
  key: z.string().min(1),
  value: z.string().min(1),
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { langCode } = req.query as { langCode?: string };
  let query = db.select().from(languageSettingsTable);
  if (langCode) {
    query = query.where(eq(languageSettingsTable.langCode, langCode)) as typeof query;
  }
  const rows = await query.orderBy(languageSettingsTable.langCode);
  res.json(rows);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(languageSettingsTable).where(eq(languageSettingsTable.id, id));
  if (!row) { res.status(404).json({ error: "Setting not found" }); return; }
  res.json(row);
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = SettingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.insert(languageSettingsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = SettingBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db.update(languageSettingsTable).set(parsed.data).where(eq(languageSettingsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Setting not found" }); return; }
  res.json(row);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(languageSettingsTable).where(eq(languageSettingsTable.id, id));
  res.json({ success: true });
});

export default router;
