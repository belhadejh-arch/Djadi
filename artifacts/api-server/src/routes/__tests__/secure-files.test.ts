/**
 * Tests for the protected file proxy (/api/files/:kind/:id).
 *
 *  - unauthenticated requests are rejected (401)
 *  - SSRF policy: stored links pointing at localhost, IP literals,
 *    private/reserved ranges, non-HTTPS schemes, custom ports or
 *    credentialed URLs are never fetched (502, no content leak)
 *  - trusted external HTTPS hosts pass URL validation
 *  - Google Drive share links are rewritten to direct-download form
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
  baccalaureatePapersTable,
  subjectsTable,
  lessonsTable,
  reviewChannelsTable,
  reviewChannelVideosTable,
} from "@workspace/db";
import app from "../../app";
import { toDirectDownloadUrl, validateUpstreamUrl, isPrivateIp, maskVideoUrl } from "../secure-files";

const SESSION_COOKIE = "djadi_session";

let userId: number;
let sessionId: string;
let cookie: string;
const paperIds: number[] = [];

async function createPaper(link: string): Promise<number> {
  const [row] = await db
    .insert(baccalaureatePapersTable)
    .values({ year: 2099, title: "ssrf-test", link })
    .returning();
  paperIds.push(row!.id);
  return row!.id;
}

beforeAll(async () => {
  const [user] = await db
    .insert(usersTable)
    .values({
      fullName: "Test Student (secure-files)",
      email: `test-student-${randomUUID()}@example.test`,
      passwordHash: "x",
      role: "student",
      isActive: true,
    })
    .returning();
  userId = user!.id;
  sessionId = randomUUID();
  await db.insert(sessionsTable).values({
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  cookie = `${SESSION_COOKIE}=${sessionId}`;
});

afterAll(async () => {
  if (paperIds.length) {
    await db
      .delete(baccalaureatePapersTable)
      .where(inArray(baccalaureatePapersTable.id, paperIds));
  }
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  await pool.end();
});

describe("GET /api/files/:kind/:id — auth", () => {
  it("returns 401 without a session", async () => {
    const res = await request(app).get("/api/files/bac/1");
    expect(res.status).toBe(401);
  });

  it("rejects unknown kinds and bad ids", async () => {
    const bad1 = await request(app).get("/api/files/evil/1").set("Cookie", cookie);
    expect(bad1.status).toBe(400);
    const bad2 = await request(app).get("/api/files/bac/abc").set("Cookie", cookie);
    expect(bad2.status).toBe(400);
  });

  it("returns 404 for a missing row", async () => {
    const res = await request(app).get("/api/files/bac/999999").set("Cookie", cookie);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/files/:kind/:id — SSRF policy (blocked targets, never fetched)", () => {
  const blocked = [
    "https://localhost/secret",
    "https://127.0.0.1/secret",
    "https://[::1]/secret",
    "https://169.254.169.254/latest/meta-data/",
    "https://10.0.0.5/internal",
    "https://192.168.1.1/router",
    "http://example.com/plain-http.pdf", // non-HTTPS
    "https://example.com:8443/custom-port.pdf", // non-default port
    "https://user:pass@example.com/creds.pdf", // credentials in URL
    "https://intranet/no-dot-host",
  ];

  for (const link of blocked) {
    it(`blocks ${link}`, async () => {
      const id = await createPaper(link);
      const res = await request(app).get(`/api/files/bac/${id}`).set("Cookie", cookie);
      expect(res.status).toBe(502);
      expect(res.body).toEqual({ error: "File source is not allowed" });
    });
  }
});

describe("upstream URL policy (unit)", () => {
  it("accepts trusted HTTPS hosts", () => {
    expect(validateUpstreamUrl("https://drive.google.com/uc?export=download&id=abc")).toBeNull();
    expect(validateUpstreamUrl("https://docs.google.com/document/d/abc/export?format=pdf")).toBeNull();
    expect(validateUpstreamUrl("https://example.com/file.pdf")).toBeNull();
  });

  it("rejects IP literals, localhost, non-https, ports and credentials", () => {
    expect(validateUpstreamUrl("https://127.0.0.1/x")).not.toBeNull();
    expect(validateUpstreamUrl("https://[::1]/x")).not.toBeNull();
    expect(validateUpstreamUrl("https://localhost/x")).not.toBeNull();
    expect(validateUpstreamUrl("http://example.com/x")).not.toBeNull();
    expect(validateUpstreamUrl("ftp://example.com/x")).not.toBeNull();
    expect(validateUpstreamUrl("https://example.com:8080/x")).not.toBeNull();
    expect(validateUpstreamUrl("https://u:p@example.com/x")).not.toBeNull();
    expect(validateUpstreamUrl("not a url")).not.toBeNull();
  });

  it("classifies private/reserved IPs correctly", () => {
    for (const ip of [
      "127.0.0.1", "10.1.2.3", "192.168.0.1", "172.16.0.1", "172.31.255.255",
      "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "::1",
      "fd00::1", "fe80::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1",
    ]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
    for (const ip of ["8.8.8.8", "142.250.72.1", "172.32.0.1", "192.0.78.1", "2607:f8b0::1"]) {
      expect(isPrivateIp(ip), ip).toBe(false);
    }
  });
});

describe("student responses never leak raw video URLs", () => {
  it("GET /api/lessons/:id/content masks pdf and video URLs", async () => {
    const [subject] = await db
      .insert(subjectsTable)
      .values({
        name: "SF-Test Subject",
        nameAr: "مادة",
        nameFr: "Matière",
        grade: "troisieme",
        color: "#123456",
        icon: "book",
      })
      .returning();
    const [lesson] = await db
      .insert(lessonsTable)
      .values({
        title: "SF-Test Lesson",
        titleAr: "درس",
        subjectId: subject!.id,
        grade: "troisieme",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        pdfUrl: "https://example.com/secret-lesson.pdf",
      })
      .returning();

    try {
      const res = await request(app)
        .get(`/api/lessons/${lesson!.id}/content`)
        .set("Cookie", cookie);
      expect(res.status).toBe(200);
      const body = JSON.stringify(res.body);
      expect(body).not.toContain("example.com");
      expect(body).not.toContain("youtube.com/watch");
      expect(res.body.pdfUrl).toBe(`/api/files/lesson/${lesson!.id}`);
      expect(res.body.videoUrl).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    } finally {
      await db.delete(lessonsTable).where(eq(lessonsTable.id, lesson!.id));
      await db.delete(subjectsTable).where(eq(subjectsTable.id, subject!.id));
    }
  });

  it("GET /api/review-channels masks every video URL", async () => {
    const [channel] = await db
      .insert(reviewChannelsTable)
      .values({ channelName: "SF-Test Channel", teacherName: "t", sortOrder: 9990 })
      .returning();
    const [ytVideo] = await db
      .insert(reviewChannelVideosTable)
      .values({
        channelId: channel!.id,
        title: "yt",
        titleAr: "يوتيوب",
        videoUrl: "https://youtu.be/dQw4w9WgXcQ",
        sortOrder: 1,
      })
      .returning();
    const [fileVideo] = await db
      .insert(reviewChannelVideosTable)
      .values({
        channelId: channel!.id,
        title: "mp4",
        titleAr: "ملف",
        videoUrl: "https://example.com/secret.mp4",
        sortOrder: 2,
      })
      .returning();

    try {
      const res = await request(app).get("/api/review-channels");
      expect(res.status).toBe(200);
      const body = JSON.stringify(res.body);
      expect(body).not.toContain("youtu.be");
      expect(body).not.toContain("example.com");
      const found = res.body.find((c: { id: number }) => c.id === channel!.id);
      expect(found.videos[0].videoUrl).toContain(
        "youtube-nocookie.com/embed/dQw4w9WgXcQ"
      );
      expect(found.videos[1].videoUrl).toBe(`/api/files/channel-video/${fileVideo!.id}`);
      expect(ytVideo!.id).toBeGreaterThan(0);
    } finally {
      await db.delete(reviewChannelsTable).where(eq(reviewChannelsTable.id, channel!.id));
    }
  });
});

describe("video URL masking (unit)", () => {
  it("converts YouTube links to contained nocookie embeds (no watch/share link)", () => {
    for (const raw of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    ]) {
      const masked = maskVideoUrl("channel-video", 7, raw);
      expect(masked).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
      expect(masked).not.toContain("watch");
      expect(masked).toContain("fs=0");
    }
  });

  it("routes non-YouTube videos through the protected proxy path", () => {
    expect(maskVideoUrl("channel-video", 7, "https://example.com/video.mp4"))
      .toBe("/api/files/channel-video/7");
    expect(maskVideoUrl("lesson-video", 3, "https://cdn.example.com/a.webm"))
      .toBe("/api/files/lesson-video/3");
  });
});

describe("Google Drive URL rewriting (unit)", () => {
  it("rewrites share links to direct download", () => {
    expect(toDirectDownloadUrl("https://drive.google.com/file/d/ABC_123-xyz/view?usp=sharing"))
      .toBe("https://drive.google.com/uc?export=download&confirm=t&id=ABC_123-xyz");
    expect(toDirectDownloadUrl("https://drive.google.com/open?id=ABC_123"))
      .toBe("https://drive.google.com/uc?export=download&confirm=t&id=ABC_123");
    expect(toDirectDownloadUrl("https://docs.google.com/document/d/DOC_1/edit"))
      .toBe("https://docs.google.com/document/d/DOC_1/export?format=pdf");
  });

  it("leaves other URLs untouched", () => {
    expect(toDirectDownloadUrl("https://example.com/file.pdf")).toBe("https://example.com/file.pdf");
  });
});
