/**
 * Integration tests for admin → student data sync.
 *
 * These hit the real Express app (supertest) against the dev database and
 * verify that:
 *  - the public routes (/api/review-channels, /api/baccalaureates) return the
 *    expected response shape and ordering
 *  - items created through the admin routes immediately appear on the
 *    corresponding public route
 *  - deleted items disappear from the public route (empty/absent state)
 *
 * All rows created by the tests are cleaned up afterwards.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  pool,
  usersTable,
  sessionsTable,
  subjectsTable,
  reviewChannelsTable,
  reviewChannelVideosTable,
  baccalaureatePapersTable,
} from "@workspace/db";
import app from "../../app";

const SESSION_COOKIE = "djadi_session";

let adminUserId: number;
let sessionId: string;
let adminCookie: string;
let testSubjectId: number;

const createdChannelIds: number[] = [];
const createdPaperIds: number[] = [];

beforeAll(async () => {
  // Create a throwaway super_admin + session directly in the DB so we can
  // call the admin routes without going through the login flow.
  const [admin] = await db
    .insert(usersTable)
    .values({
      fullName: "Test Admin (integration)",
      email: `test-admin-${randomUUID()}@example.test`,
      passwordHash: "x",
      role: "super_admin",
      isActive: true,
    })
    .returning();
  adminUserId = admin!.id;

  sessionId = randomUUID();
  await db.insert(sessionsTable).values({
    id: sessionId,
    userId: adminUserId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  adminCookie = `${SESSION_COOKIE}=${sessionId}`;

  const [subject] = await db
    .insert(subjectsTable)
    .values({
      name: "IT-Test Subject",
      nameAr: "مادة اختبار",
      nameFr: "Matière test",
      grade: "troisieme",
      color: "#123456",
      icon: "book",
    })
    .returning();
  testSubjectId = subject!.id;
});

afterAll(async () => {
  if (createdChannelIds.length) {
    await db
      .delete(reviewChannelsTable)
      .where(inArray(reviewChannelsTable.id, createdChannelIds));
  }
  if (createdPaperIds.length) {
    await db
      .delete(baccalaureatePapersTable)
      .where(inArray(baccalaureatePapersTable.id, createdPaperIds));
  }
  await db.delete(subjectsTable).where(eq(subjectsTable.id, testSubjectId));
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  await db.delete(usersTable).where(eq(usersTable.id, adminUserId));
  await pool.end();
});

describe("GET /api/review-channels (public)", () => {
  it("returns 200 with an array of channels in the expected shape", async () => {
    const res = await request(app).get("/api/review-channels");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const c of res.body) {
      expect(c).toMatchObject({
        id: expect.any(Number),
        channelName: expect.any(String),
        teacherName: expect.any(String),
        sortOrder: expect.any(Number),
      });
      expect(Array.isArray(c.videos)).toBe(true);
    }
  });

  it("orders channels by sortOrder and channel videos by sortOrder", async () => {
    const res = await request(app).get("/api/review-channels");
    const orders = res.body.map((c: { sortOrder: number }) => c.sortOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    for (const c of res.body) {
      const vOrders = c.videos.map((v: { sortOrder: number }) => v.sortOrder);
      expect(vOrders).toEqual([...vOrders].sort((a, b) => a - b));
    }
  });
});

describe("admin → public sync: review channels", () => {
  it("rejects admin route without a session", async () => {
    const res = await request(app)
      .post("/api/admin/review-channels")
      .send({ channelName: "x", teacherName: "y" });
    expect(res.status).toBe(401);
  });

  it("a channel created via the admin route appears immediately on the public route", async () => {
    const create = await request(app)
      .post("/api/admin/review-channels")
      .set("Cookie", adminCookie)
      .send({
        channelName: "IT-Test Channel",
        teacherName: "أستاذ الاختبار",
        subjectId: testSubjectId,
        sortOrder: 9999,
      });
    expect(create.status).toBe(201);
    const channelId = create.body.id as number;
    createdChannelIds.push(channelId);

    const pub = await request(app).get("/api/review-channels");
    const found = pub.body.find((c: { id: number }) => c.id === channelId);
    expect(found).toBeDefined();
    expect(found).toMatchObject({
      channelName: "IT-Test Channel",
      teacherName: "أستاذ الاختبار",
      subjectId: testSubjectId,
      subjectName: "مادة اختبار", // joined from subjects (Arabic name)
    });
    // Newly created channel has no videos yet (empty state)
    expect(found.videos).toEqual([]);
  });

  it("a video added via the admin route appears under the channel on the public route, ordered", async () => {
    const channelId = createdChannelIds[0]!;
    const v2 = await request(app)
      .post(`/api/admin/review-channels/${channelId}/videos`)
      .set("Cookie", adminCookie)
      .send({ title: "B", titleAr: "ب", videoUrl: "https://example.com/b", sortOrder: 2 });
    const v1 = await request(app)
      .post(`/api/admin/review-channels/${channelId}/videos`)
      .set("Cookie", adminCookie)
      .send({ title: "A", titleAr: "أ", videoUrl: "https://example.com/a", sortOrder: 1 });
    expect(v1.status).toBe(201);
    expect(v2.status).toBe(201);

    const pub = await request(app).get("/api/review-channels");
    const found = pub.body.find((c: { id: number }) => c.id === channelId);
    expect(found.videos.map((v: { title: string }) => v.title)).toEqual(["A", "B"]);
  });

  it("a channel deleted via the admin route disappears from the public route", async () => {
    const create = await request(app)
      .post("/api/admin/review-channels")
      .set("Cookie", adminCookie)
      .send({ channelName: "IT-Temp", teacherName: "temp", sortOrder: 9998 });
    const id = create.body.id as number;

    const del = await request(app)
      .delete(`/api/admin/review-channels/${id}`)
      .set("Cookie", adminCookie);
    expect(del.status).toBe(200);

    const pub = await request(app).get("/api/review-channels");
    expect(pub.body.some((c: { id: number }) => c.id === id)).toBe(false);
  });
});

describe("GET /api/baccalaureates (public)", () => {
  it("returns 200 with an array of papers in the expected shape", async () => {
    const res = await request(app).get("/api/baccalaureates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const p of res.body) {
      expect(p).toMatchObject({
        id: expect.any(Number),
        year: expect.any(Number),
        link: expect.any(String),
      });
      // public shape must not leak extra fields beyond the selected columns
      expect(Object.keys(p).sort()).toEqual(
        ["branchId", "id", "link", "subjectId", "title", "year"],
      );
    }
  });

  it("orders papers by year descending", async () => {
    const res = await request(app).get("/api/baccalaureates");
    const years = res.body.map((p: { year: number }) => p.year);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });
});

describe("admin → public sync: baccalaureates", () => {
  it("papers created via the admin route appear immediately on the public route", async () => {
    for (const year of [2091, 2092]) {
      const create = await request(app)
        .post("/api/admin/baccalaureates")
        .set("Cookie", adminCookie)
        .send({
          year,
          subjectId: testSubjectId,
          title: `IT-Test Paper ${year}`,
          link: "https://example.com/paper.pdf",
        });
      expect(create.status).toBe(201);
      createdPaperIds.push(create.body.id as number);
    }

    const pub = await request(app).get("/api/baccalaureates");
    const mine = pub.body.filter((p: { id: number }) => createdPaperIds.includes(p.id));
    expect(mine).toHaveLength(2);
    // desc ordering: 2092 before 2091
    expect(mine.map((p: { year: number }) => p.year)).toEqual([2092, 2091]);
    expect(mine[0]).toMatchObject({
      title: "IT-Test Paper 2092",
      link: "https://example.com/paper.pdf",
      subjectId: testSubjectId,
    });
  });

  it("a paper deleted via the admin route disappears from the public route", async () => {
    const id = createdPaperIds.pop()!;
    const del = await request(app)
      .delete(`/api/admin/baccalaureates/${id}`)
      .set("Cookie", adminCookie);
    expect(del.status).toBe(200);

    const pub = await request(app).get("/api/baccalaureates");
    expect(pub.body.some((p: { id: number }) => p.id === id)).toBe(false);
  });
});
