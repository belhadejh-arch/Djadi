import { Router, type IRouter, type Request, type Response } from "express";
import { eq, ilike, or, count, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { z } from "zod/v4";
import { hashPassword } from "../../lib/auth";
import { logAudit } from "../../lib/audit";

const router: IRouter = Router();

// List + search users
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  let query = db.select().from(usersTable);
  let countQuery = db.select({ total: count() }).from(usersTable);

  if (search) {
    const like = `%${search}%`;
    const condition = or(ilike(usersTable.fullName, like), ilike(usersTable.email, like));
    query = query.where(condition) as typeof query;
    countQuery = countQuery.where(condition) as typeof countQuery;
  }

  const [users, [{ total }]] = await Promise.all([
    query.limit(limitNum).offset(offset).orderBy(usersTable.createdAt),
    countQuery,
  ]);

  res.json({
    data: users.map((u: typeof usersTable.$inferSelect) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      grade: u.grade,
      role: u.role,
      isActive: u.isActive,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
    })),
    total,
    page: pageNum,
    limit: limitNum,
  });
});

// User stats
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  const [totalRow] = await db.select({ total: count() }).from(usersTable);
  const [activeRow] = await db.select({ total: count() }).from(usersTable).where(eq(usersTable.isActive, true));
  const [adminRow] = await db.select({ total: count() }).from(usersTable).where(eq(usersTable.role, "super_admin"));

  const byGrade = await db
    .select({ grade: usersTable.grade, total: count() })
    .from(usersTable)
    .groupBy(usersTable.grade);

  res.json({
    total: totalRow?.total ?? 0,
    active: activeRow?.total ?? 0,
    inactive: (totalRow?.total ?? 0) - (activeRow?.total ?? 0),
    admins: adminRow?.total ?? 0,
    byGrade,
  });
});

// Get single user
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    grade: user.grade,
    role: user.role,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

const CreateUserBody = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  grade: z.string().optional(),
  role: z.enum(["student", "super_admin"]).default("student"),
});

// Create user
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { fullName, email, password, grade, role } = parsed.data;

  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing) { res.status(409).json({ error: "Email already registered" }); return; }

  const passwordHash = hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({ fullName, email: email.toLowerCase(), passwordHash, grade, role })
    .returning();

  await logAudit(req, "CREATE", "users", user!.id, `Created user ${email}`);
  res.status(201).json({ id: user!.id, fullName: user!.fullName, email: user!.email, role: user!.role });
});

const UpdateUserBody = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  grade: z.string().nullable().optional(),
  role: z.enum(["student", "super_admin"]).optional(),
  isActive: z.boolean().optional(),
});

// Update user
router.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { password, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { ...rest };
  if (password) updates.passwordHash = hashPassword(password);

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await logAudit(req, "UPDATE", "users", id, `Updated user ${user.email}`);
  res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, isActive: user.isActive });
});

// Delete user
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  await logAudit(req, "DELETE", "users", id);
  res.json({ success: true });
});

// Activate user
router.post("/:id/activate", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(usersTable).set({ isActive: true }).where(eq(usersTable.id, id));
  res.json({ success: true });
});

// Deactivate user
router.post("/:id/deactivate", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(usersTable).set({ isActive: false }).where(eq(usersTable.id, id));
  res.json({ success: true });
});

export default router;
