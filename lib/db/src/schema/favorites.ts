import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Favorites table — stores bookmarked items per user.
 * itemType: "lesson" | "exam" | "test" | "homework" | "baccalaureate"
 * sortOrder: user-defined ordering within each itemType group (null = original insertion order)
 */
export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(),   // "lesson" | "exam" | "test" | "homework" | "baccalaureate"
  itemId: integer("item_id").notNull(),
  itemTitle: text("item_title"),           // cached title for quick display
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sortOrder: integer("sort_order"),        // nullable; user-defined order within type
});

export type Favorite = typeof favoritesTable.$inferSelect;
