import { randomBytes, pbkdf2Sync, randomUUID } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return derived === hash;
}

export function generateSessionId(): string {
  return randomUUID();
}

export function sessionExpiresAt(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30); // 30 days
  return date;
}
