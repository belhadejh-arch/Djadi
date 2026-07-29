import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { lessonsTable } from "./lessons";

/**
 * Last-activity log — one row per user×lesson view event.
 * Used to power the "last activity" widget on the dashboard.
 */
export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id")
    .references(() => lessonsTable.id, { onDelete: "cascade" }),
  lessonTitle: text("lesson_title"),
  subjectName: text("subject_name"),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Activity = typeof activityTable.$inferSelect;
