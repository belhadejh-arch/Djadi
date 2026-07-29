import app from "./app";
import { logger } from "./lib/logger";
import { seedAdminIfNeeded } from "./lib/seed-admin";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Seed super_admin from env vars if ADMIN_EMAIL + ADMIN_PASSWORD are set
  // and no admin exists yet. Safe to call on every startup.
  seedAdminIfNeeded().catch((e) => logger.error({ err: e }, "seedAdminIfNeeded threw"));
});
