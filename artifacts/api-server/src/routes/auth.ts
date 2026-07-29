import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { hashPassword, verifyPassword, generateSessionId, sessionExpiresAt } from "../lib/auth";
import { authLimiter } from "../middlewares/rate-limit";

const router: IRouter = Router();

const SESSION_COOKIE = "djadi_session";

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // cross-origin (Vercel ↔ Render) requires sameSite:"none" + secure:true
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    grade: user.grade ?? null,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
    createdAt: user.createdAt,
  };
}

router.post("/auth/register", authLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fullName, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values({ fullName, email: email.toLowerCase(), passwordHash })
    .returning();

  if (!user) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }

  const sessionId = generateSessionId();
  await db.insert(sessionsTable).values({
    id: sessionId,
    userId: user.id,
    expiresAt: sessionExpiresAt(),
  });

  res.cookie(SESSION_COOKIE, sessionId, cookieOptions());
  res.status(201).json({ user: formatUser(user) });
});

router.post("/auth/login", authLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account is deactivated" });
    return;
  }

  const sessionId = generateSessionId();
  await db.insert(sessionsTable).values({
    id: sessionId,
    userId: user.id,
    expiresAt: sessionExpiresAt(),
  });

  res.cookie(SESSION_COOKIE, sessionId, cookieOptions());
  res.json({ user: formatUser(user) });
});

router.post("/auth/logout", async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  }
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.json({ success: true });
});

router.get("/auth/me", async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (!sessionId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  if (!session || session.expiresAt < new Date()) {
    res.status(401).json({ error: "Session expired" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account is deactivated" });
    return;
  }

  res.json(formatUser(user));
});

export default router;
