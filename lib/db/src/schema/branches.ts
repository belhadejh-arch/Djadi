import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { levelsTable } from "./levels";

export const branchesTable = pgTable("branches", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameFr: text("name_fr").notNull(),
  code: text("code").notNull(),
  levelId: integer("level_id")
    .notNull()
    .references(() => levelsTable.id, { onDelete: "cascade" }),
  /** All levels this branch appears in (levelId is derived as levelIds[0] for backward compat) */
  levelIds: integer("level_ids").array().notNull().default(sql`'{}'::integer[]`),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBranchSchema = createInsertSchema(branchesTable).omit({ id: true, createdAt: true });
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branchesTable.$inferSelect;
