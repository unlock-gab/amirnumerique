import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const subcontractorRequestStatusEnum = pgEnum("subcontractor_request_status", [
  "pending",
  "reviewed",
  "accepted",
  "refused",
]);

export const subcontractorRequestsTable = pgTable("subcontractor_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  activityType: text("activity_type").notNull(),
  estimatedVolume: text("estimated_volume").notNull(),
  message: text("message"),
  status: subcontractorRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubcontractorRequestSchema = createInsertSchema(subcontractorRequestsTable).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubcontractorRequest = z.infer<typeof insertSubcontractorRequestSchema>;
export type SubcontractorRequest = typeof subcontractorRequestsTable.$inferSelect;
