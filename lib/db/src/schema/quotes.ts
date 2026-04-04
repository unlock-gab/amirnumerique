import { pgTable, text, serial, timestamp, real, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { servicesTable } from "./services";

export const quoteStatusEnum = pgEnum("quote_status", ["pending", "responded", "accepted", "refused", "converted_to_order"]);

export const quotesTable = pgTable("quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id),
  widthInput: real("width_input").notNull(),
  heightInput: real("height_input").notNull(),
  unitInput: text("unit_input").notNull().default("m"),
  widthM: real("width_m").notNull(),
  heightM: real("height_m").notNull(),
  areaM2: real("area_m2").notNull(),
  estimatedPrice: real("estimated_price"),
  note: text("note"),
  fileUrl: text("file_url"),
  status: quoteStatusEnum("status").notNull().default("pending"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertQuoteSchema = createInsertSchema(quotesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotesTable.$inferSelect;
