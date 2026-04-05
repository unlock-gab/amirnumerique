import { pgTable, text, serial, timestamp, real, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { servicesTable } from "./services";

export const unitInputEnum = pgEnum("unit_input", ["cm", "m"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending_on_delivery", "paid", "cancelled"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "in_progress", "printing", "ready", "delivered", "cancelled"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  serviceId: integer("service_id").notNull().references(() => servicesTable.id),
  widthInput: real("width_input").notNull(),
  heightInput: real("height_input").notNull(),
  unitInput: unitInputEnum("unit_input").notNull(),
  widthM: real("width_m").notNull(),
  heightM: real("height_m").notNull(),
  areaM2: real("area_m2").notNull(),
  unitPricePerM2: real("unit_price_per_m2").notNull(),
  displayedPrice: real("displayed_price").notNull(),
  finalPrice: real("final_price").notNull(),
  note: text("note"),
  fileUrl: text("file_url"),
  paymentMethod: text("payment_method").notNull().default("payment_on_delivery"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending_on_delivery"),
  orderStatus: orderStatusEnum("order_status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
