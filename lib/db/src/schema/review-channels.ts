import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";

export const reviewChannelsTable = pgTable("review_channels", {
  id: serial("id").primaryKey(),
  channelName: text("channel_name").notNull(),
  teacherName: text("teacher_name").notNull(),
  subjectId: integer("subject_id")
    .references(() => subjectsTable.id, { onDelete: "set null" }),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviewChannelVideosTable = pgTable("review_channel_videos", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id")
    .notNull()
    .references(() => reviewChannelsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  videoUrl: text("video_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReviewChannelSchema = createInsertSchema(reviewChannelsTable).omit({ id: true, createdAt: true });
export const insertReviewChannelVideoSchema = createInsertSchema(reviewChannelVideosTable).omit({ id: true, createdAt: true });

export type InsertReviewChannel = z.infer<typeof insertReviewChannelSchema>;
export type InsertReviewChannelVideo = z.infer<typeof insertReviewChannelVideoSchema>;
export type ReviewChannel = typeof reviewChannelsTable.$inferSelect;
export type ReviewChannelVideo = typeof reviewChannelVideosTable.$inferSelect;
