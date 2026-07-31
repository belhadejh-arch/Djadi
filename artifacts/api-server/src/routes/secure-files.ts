/**
 * Protected PDF/file proxy.
 *
 * Students never receive the original external URL (Google Drive, etc.).
 * Instead the student-facing routes return an internal path like
 * `/api/files/lesson/12`. This route:
 *   1. requires an authenticated session (401 otherwise)
 *   2. looks up the real external URL server-side
 *   3. converts Google Drive share links to direct-download form
 *   4. fetches the file and streams it to the browser
 * with headers that prevent caching and cross-site embedding.
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "node:stream";
import { lookup } from "node:dns/promises";
import net from "node:net";
import { eq } from "drizzle-orm";
import {
  db,
  lessonsTable,
  examsTable,
  testsTable,
  homeworkTable,
  baccalaureatePapersTable,
  reviewChannelVideosTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

/** Convert common Google Drive share URLs to a direct-download URL. */
export function toDirectDownloadUrl(url: string): string {
  // https://drive.google.com/file/d/<ID>/view?usp=sharing
  const filed = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (filed) {
    return `https://drive.google.com/uc?export=download&confirm=t&id=${filed[1]}`;
  }
  // https://drive.google.com/open?id=<ID>  or  .../uc?id=<ID>
  const openId = url.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/);
  if (openId) {
    return `https://drive.google.com/uc?export=download&confirm=t&id=${openId[1]}`;
  }
  // https://docs.google.com/document/d/<ID>/... → export as PDF
  const docs = url.match(/docs\.google\.com\/document\/d\/([\w-]+)/);
  if (docs) {
    return `https://docs.google.com/document/d/${docs[1]}/export?format=pdf`;
  }
  return url;
}

// ─── SSRF protection ─────────────────────────────────────────────────────────
// The proxy only ever fetches HTTPS URLs on the default port, with no IP
// literals, no credentials in the URL, and no hostnames that resolve to
// private/reserved address space. Redirects are followed manually (bounded)
// and every hop is re-validated against the same policy.

/** True if the IPv4/IPv6 address is private, loopback, link-local or reserved. */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a, b, c] = parts as [number, number, number];
    return (
      a === 0 || // 0.0.0.0/8
      a === 10 || // 10.0.0.0/8
      a === 127 || // loopback
      (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 (CGNAT)
      (a === 169 && b === 254) || // link-local / cloud metadata
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 0 && (c === 0 || c === 2)) || // 192.0.0.0/24 + 192.0.2.0/24
      (a === 192 && b === 168) || // 192.168.0.0/16
      (a === 198 && (b === 18 || b === 19)) || // benchmarking
      a >= 224 // multicast + reserved
    );
  }
  const lower = ip.toLowerCase();
  // IPv4-mapped IPv6 (::ffff:1.2.3.4)
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIp(mapped[1]!);
  return (
    lower === "::" ||
    lower === "::1" || // loopback
    lower.startsWith("fc") || lower.startsWith("fd") || // fc00::/7 ULA
    lower.startsWith("fe8") || lower.startsWith("fe9") ||
    lower.startsWith("fea") || lower.startsWith("feb") // fe80::/10 link-local
  );
}

/**
 * Validate an upstream URL against the proxy policy (without DNS).
 * Returns an error string, or null when the URL is acceptable.
 */
export function validateUpstreamUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "Invalid URL";
  }
  if (url.protocol !== "https:") return "Only HTTPS sources are allowed";
  if (url.port && url.port !== "443") return "Non-default ports are not allowed";
  if (url.username || url.password) return "Credentials in URL are not allowed";
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host)) return "IP-literal hosts are not allowed";
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".")) {
    return "Host is not allowed";
  }
  return null;
}

/** Full check: policy + DNS resolution must not hit private/reserved space. */
async function assertSafeUpstream(raw: string): Promise<string | null> {
  const policyError = validateUpstreamUrl(raw);
  if (policyError) return policyError;
  const { hostname } = new URL(raw);
  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    return "Host could not be resolved";
  }
  if (addresses.length === 0) return "Host could not be resolved";
  if (addresses.some((a) => isPrivateIp(a.address))) {
    return "Host resolves to a private address";
  }
  return null;
}

const MAX_REDIRECTS = 5;

/**
 * Fetch with manual, bounded redirects — every hop is validated against the
 * SSRF policy before being requested.
 */
async function safeFetch(startUrl: string, range?: string): Promise<globalThis.Response | { error: string }> {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const unsafe = await assertSafeUpstream(current);
    if (unsafe) return { error: unsafe };

    const resp = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
      headers: {
        // Some hosts refuse requests without a UA
        "User-Agent": "Mozilla/5.0 (compatible; DjadiAcademy/1.0)",
        Accept: "application/pdf,application/octet-stream,*/*",
        // Forward Range so <video> seeking works through the proxy
        ...(range ? { Range: range } : {}),
      },
    });

    if (resp.status >= 300 && resp.status < 400) {
      const location = resp.headers.get("location");
      // Drain the redirect body so the connection can be reused
      resp.body?.cancel().catch(() => {});
      if (!location) return { error: "Redirect without location" };
      current = new URL(location, current).toString();
      continue;
    }
    return resp;
  }
  return { error: "Too many redirects" };
}

type FileKind = "lesson" | "exam" | "test" | "homework" | "bac" | "lesson-video" | "channel-video";

const KINDS: ReadonlySet<string> = new Set([
  "lesson", "exam", "test", "homework", "bac", "lesson-video", "channel-video",
]);

/** Internal protected path for a stored external link. */
export function internalFilePath(kind: FileKind, id: number): string {
  return `/api/files/${kind}/${id}`;
}

/** Extract a YouTube video id from common URL shapes; null if not YouTube. */
export function extractYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1]! : null;
}

/**
 * Mask a stored video URL so the original external link never reaches the
 * browser:
 *  - YouTube → contained youtube-nocookie embed URL (no watch/share link)
 *  - anything else → internal protected proxy path (auth required)
 */
export function maskVideoUrl(kind: "lesson-video" | "channel-video", id: number, url: string): string {
  const ytId = extractYoutubeId(url);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1&fs=0&iv_load_policy=3&controls=1`;
  }
  return internalFilePath(kind, id);
}

async function lookupExternalUrl(kind: FileKind, id: number): Promise<string | null> {
  switch (kind) {
    case "lesson": {
      const [row] = await db
        .select({ pdfUrl: lessonsTable.pdfUrl, linkUrl: lessonsTable.linkUrl })
        .from(lessonsTable)
        .where(eq(lessonsTable.id, id));
      return row?.pdfUrl ?? row?.linkUrl ?? null;
    }
    case "exam": {
      const [row] = await db
        .select({ link: examsTable.link })
        .from(examsTable)
        .where(eq(examsTable.id, id));
      return row?.link ?? null;
    }
    case "test": {
      const [row] = await db
        .select({ link: testsTable.link })
        .from(testsTable)
        .where(eq(testsTable.id, id));
      return row?.link ?? null;
    }
    case "homework": {
      const [row] = await db
        .select({ link: homeworkTable.link })
        .from(homeworkTable)
        .where(eq(homeworkTable.id, id));
      return row?.link ?? null;
    }
    case "bac": {
      const [row] = await db
        .select({ link: baccalaureatePapersTable.link })
        .from(baccalaureatePapersTable)
        .where(eq(baccalaureatePapersTable.id, id));
      return row?.link ?? null;
    }
    case "lesson-video": {
      const [row] = await db
        .select({ videoUrl: lessonsTable.videoUrl })
        .from(lessonsTable)
        .where(eq(lessonsTable.id, id));
      return row?.videoUrl ?? null;
    }
    case "channel-video": {
      const [row] = await db
        .select({ videoUrl: reviewChannelVideosTable.videoUrl })
        .from(reviewChannelVideosTable)
        .where(eq(reviewChannelVideosTable.id, id));
      return row?.videoUrl ?? null;
    }
  }
}

router.get(
  "/files/:kind/:id",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    const kind = req.params.kind as string;
    const id = Number(req.params.id);

    if (!KINDS.has(kind) || !Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid file reference" });
      return;
    }

    const externalUrl = await lookupExternalUrl(kind as FileKind, id);
    if (!externalUrl || !/^https?:\/\//i.test(externalUrl)) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const fetchUrl = toDirectDownloadUrl(externalUrl);

    let result: globalThis.Response | { error: string };
    try {
      result = await safeFetch(fetchUrl, req.headers.range);
    } catch {
      res.status(502).json({ error: "Failed to fetch file" });
      return;
    }

    if (!(result instanceof globalThis.Response)) {
      // SSRF policy rejection — never fetched
      res.status(502).json({ error: "File source is not allowed" });
      return;
    }

    const upstream = result;
    if (!upstream.ok || !upstream.body) {
      res.status(502).json({ error: "Failed to fetch file" });
      return;
    }

    const upstreamType = upstream.headers.get("content-type") ?? "";
    // Google Drive returns an HTML interstitial for files it cannot stream
    // directly (e.g. permission wall). Surface a clear error instead of
    // rendering Google's page inside the viewer.
    if (upstreamType.includes("text/html")) {
      res.status(502).json({ error: "File is not directly accessible" });
      return;
    }
    const contentType = upstreamType || "application/pdf";

    res.status(upstream.status); // 200, or 206 for range responses
    res.setHeader("Content-Type", contentType);
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) res.setHeader("Content-Range", contentRange);
    const acceptRanges = upstream.headers.get("accept-ranges");
    if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Only allow embedding from our own app (blocks hotlinking the proxy)
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
    const len = upstream.headers.get("content-length");
    if (len) res.setHeader("Content-Length", len);

    const nodeStream = Readable.fromWeb(upstream.body as never);
    nodeStream.on("error", () => {
      if (!res.headersSent) res.status(502);
      res.end();
    });
    nodeStream.pipe(res);
  },
);

export default router;
