import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const languageSettingsTable = pgTable("language_settings", {
  id: serial("id").primaryKey(),
  langCode: text("lang_code").notNull(), // ar | fr | ...
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLanguageSettingSchema = createInsertSchema(languageSettingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLanguageSetting = z.infer<typeof insertLanguageSettingSchema>;
export type LanguageSetting = typeof languageSettingsTable.$inferSelect;
