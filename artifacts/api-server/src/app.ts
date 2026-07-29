import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import helmet from "helmet";
import router from "./routes";
import { logger } from "./lib/logger";
import { generalLimiter } from "./middlewares/rate-limit";

const app: Express = express();

// ─── Security headers ──────────────────────────────────────────────────────
app.use(
  helmet({
    // Keep CSP off — the API server only serves JSON, no HTML
    contentSecurityPolicy: false,
    // HSTS: require HTTPS for 1 year (enable in production)
    strictTransportSecurity: process.env.NODE_ENV === "production"
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─── Logging ────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// ─── Core middleware ─────────────────────────────────────────────────────────
// Required when running behind a reverse proxy (Render, Replit) so secure
// cookies and rate limiting see the real client IP/protocol.
app.set("trust proxy", 1);
// FRONTEND_URL must be set on Render to the frontend domain (e.g. https://djadi.onrender.com).
// Supports comma-separated list for multiple allowed origins.
// Falls back to allowing any origin in development.
const rawFrontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = rawFrontendUrl
  ? rawFrontendUrl.split(",").map((u) => u.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: allowedOrigins
      ? (origin, cb) => {
          // Allow requests with no origin (curl, mobile, same-origin) or matching any allowed domain
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      : true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(generalLimiter);

app.use("/api", router);

// ─── Global JSON error handler ───────────────────────────────────────────────
// Must be last — catches any unhandled error and returns JSON (not HTML)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

export default app;
