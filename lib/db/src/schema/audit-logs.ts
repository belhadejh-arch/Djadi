import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => usersTable.id, { onDelete: "set null" }),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),   // CREATE | UPDATE | DELETE | LOGIN | LOGOUT | RESTORE
  entity: text("entity").notNull(),   // users | lessons | subjects | backup | …
  entityId: text("entity_id"),
  detail: text("detail"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLogsTable.$inferSelect;
