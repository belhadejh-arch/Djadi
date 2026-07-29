import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  usersTable,
  levelsTable,
  branchesTable,
  subjectsTable,
  lessonsTable,
  examsTable,
  testsTable,
  baccalaureatePapersTable,
  reviewChannelsTable,
  reviewChannelVideosTable,
  announcementsTable,
  notificationsTable,
  languageSettingsTable,
} from "@workspace/db";
import path from "path";
import fs from "fs/promises";
import { z } from "zod/v4";

const BACKUP_DIR = path.join(process.cwd(), "backups");

async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

const router: IRouter = Router();

// List backups
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  await ensureBackupDir();
  let files: string[] = [];
  try {
    files = await fs.readdir(BACKUP_DIR);
  } catch {
    res.json([]);
    return;
  }
  const backups = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const stat = await fs.stat(path.join(BACKUP_DIR, f));
        const id = f.replace(".json", "");
        return {
          id,
          filename: f,
          createdAt: stat.mtime.toISOString(),
          sizeBytes: stat.size,
        };
      })
  );
  backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(backups);
});

// Create backup
router.post("/create", async (_req: Request, res: Response): Promise<void> => {
  await ensureBackupDir();

  const [
    users,
    levels,
    branches,
    subjects,
    lessons,
    exams,
    tests,
    baccalaureates,
    channels,
    channelVideos,
    announcements,
    notifications,
    languageSettings,
  ] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(levelsTable),
    db.select().from(branchesTable),
    db.select().from(subjectsTable),
    db.select().from(lessonsTable),
    db.select().from(examsTable),
    db.select().from(testsTable),
    db.select().from(baccalaureatePapersTable),
    db.select().from(reviewChannelsTable),
    db.select().from(reviewChannelVideosTable),
    db.select().from(announcementsTable),
    db.select().from(notificationsTable),
    db.select().from(languageSettingsTable),
  ]);

  const backup = {
    version: 1,
    createdAt: new Date().toISOString(),
    data: {
      // Strip password hashes for security
      users: users.map(({ passwordHash: _ph, ...u }) => u),
      levels,
      branches,
      subjects,
      lessons,
      exams,
      tests,
      baccalaureates,
      channels,
      channelVideos,
      announcements,
      notifications,
      languageSettings,
    },
  };

  const id = `backup_${Date.now()}`;
  const filename = `${id}.json`;
  await fs.writeFile(
    path.join(BACKUP_DIR, filename),
    JSON.stringify(backup, null, 2),
    "utf-8"
  );

  res.json({ id, filename, createdAt: backup.createdAt });
});

// Download backup
router.get("/:id/download", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!/^backup_\d+$/.test(id)) {
    res.status(400).json({ error: "Invalid backup id" });
    return;
  }
  const filepath = path.join(BACKUP_DIR, `${id}.json`);
  try {
    await fs.access(filepath);
  } catch {
    res.status(404).json({ error: "Backup not found" });
    return;
  }
  const content = await fs.readFile(filepath, "utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${id}.json"`);
  res.setHeader("Content-Type", "application/octet-stream");
  res.send(content);
});

// Restore backup — accepts JSON body { data: { levels, branches, ... } }
const RestoreBody = z.object({
  version: z.number(),
  data: z.object({
    levels: z.array(z.any()).optional().default([]),
    branches: z.array(z.any()).optional().default([]),
    subjects: z.array(z.any()).optional().default([]),
    lessons: z.array(z.any()).optional().default([]),
    exams: z.array(z.any()).optional().default([]),
    tests: z.array(z.any()).optional().default([]),
    baccalaureates: z.array(z.any()).optional().default([]),
    channels: z.array(z.any()).optional().default([]),
    channelVideos: z.array(z.any()).optional().default([]),
    announcements: z.array(z.any()).optional().default([]),
    notifications: z.array(z.any()).optional().default([]),
    languageSettings: z.array(z.any()).optional().default([]),
  }),
});

router.post("/restore", async (req: Request, res: Response): Promise<void> => {
  const parsed = RestoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid backup format" });
    return;
  }

  const { data } = parsed.data;

  // Restore in FK-safe order inside a transaction
  await db.transaction(async (tx) => {
    // Clear in reverse FK order
    await tx.delete(reviewChannelVideosTable);
    await tx.delete(lessonsTable);
    await tx.delete(examsTable);
    await tx.delete(testsTable);
    await tx.delete(baccalaureatePapersTable);
    await tx.delete(reviewChannelsTable);
    await tx.delete(subjectsTable);
    await tx.delete(branchesTable);
    await tx.delete(levelsTable);
    await tx.delete(announcementsTable);
    await tx.delete(notificationsTable);
    await tx.delete(languageSettingsTable);

    // Re-insert in FK-safe order
    if (data.levels.length)           await tx.insert(levelsTable).values(data.levels);
    if (data.branches.length)         await tx.insert(branchesTable).values(data.branches);
    if (data.subjects.length)         await tx.insert(subjectsTable).values(data.subjects);
    if (data.lessons.length)          await tx.insert(lessonsTable).values(data.lessons);
    if (data.exams.length)            await tx.insert(examsTable).values(data.exams);
    if (data.tests.length)            await tx.insert(testsTable).values(data.tests);
    if (data.baccalaureates.length)   await tx.insert(baccalaureatePapersTable).values(data.baccalaureates);
    if (data.channels.length)         await tx.insert(reviewChannelsTable).values(data.channels);
    if (data.channelVideos.length)    await tx.insert(reviewChannelVideosTable).values(data.channelVideos);
    if (data.announcements.length)    await tx.insert(announcementsTable).values(data.announcements);
    if (data.notifications.length)    await tx.insert(notificationsTable).values(data.notifications);
    if (data.languageSettings.length) await tx.insert(languageSettingsTable).values(data.languageSettings);
  });

  res.json({ success: true });
});

// Delete backup
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!/^backup_\d+$/.test(id)) {
    res.status(400).json({ error: "Invalid backup id" });
    return;
  }
  const filepath = path.join(BACKUP_DIR, `${id}.json`);
  await fs.unlink(filepath).catch(() => {});
  res.json({ success: true });
});

export default router;
