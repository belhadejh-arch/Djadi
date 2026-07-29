import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const baccalaureatePapersTable = pgTable("baccalaureate_papers", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  subject: text("subject").notNull(),
  subjectAr: text("subject_ar").notNull(),
  grade: text("grade").notNull(),
  link: text("link").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBaccalaureatePaperSchema = createInsertSchema(baccalaureatePapersTable).omit({ id: true, createdAt: true });
export type InsertBaccalaureatePaper = z.infer<typeof insertBaccalaureatePaperSchema>;
export type BaccalaureatePaper = typeof baccalaureatePapersTable.$inferSelect;
