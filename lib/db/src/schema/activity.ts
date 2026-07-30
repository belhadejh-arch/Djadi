import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { lessonsTable } from "./lessons";

/**
 * Last-activity log — one row per user × content-view event.
 * contentType: "lesson" | "exam" | "test" | "homework"
 * contentId: the ID of the content item (lessonId for lessons)
 * lessonId: kept for backward-compat FK (null when contentType ≠ "lesson")
 */
export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id")
    .references(() => lessonsTable.id, { onDelete: "cascade" }),
  lessonTitle: text("lesson_title"),   // generic: title of any content type
  subjectName: text("subject_name"),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  contentType: text("content_type").default("lesson"),   // "lesson"|"exam"|"test"|"homework"
  contentId: integer("content_id"),                       // nullable; no FK – covers all types
});

export type Activity = typeof activityTable.$inferSelect;
