import express, { type Express } from "express";
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
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(generalLimiter);

app.use("/api", router);

export default app;
