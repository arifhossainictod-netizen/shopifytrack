import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const configurations = pgTable("configurations", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeName: text("store_name").notNull(),
  shopDomain: text("shop_domain").notNull(),
  mode: text("mode").notNull(),
  platforms: text("platforms").array().notNull().default([]),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const downloads = pgTable("downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // 'package' | 'extension'
  label: text("label"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
