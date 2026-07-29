import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";

export const homeworkTable = pgTable("homework", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  subjectId: integer("subject_id")
    .references(() => subjectsTable.id, { onDelete: "set null" }),
  grade: text("grade").notNull(),
  semester: text("semester").notNull().default("1"),
  link: text("link").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHomeworkSchema = createInsertSchema(homeworkTable).omit({ id: true, createdAt: true });
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type Homework = typeof homeworkTable.$inferSelect;
