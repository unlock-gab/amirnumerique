import { pgTable, text, serial, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { serviceCategoriesTable } from "./service_categories";

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => serviceCategoriesTable.id, { onDelete: "set null" }),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  descriptionFr: text("description_fr"),
  descriptionAr: text("description_ar"),
  imageUrl: text("image_url"),
  publicPricePerM2: real("public_price_per_m2").notNull().default(0),
  clientPricePerM2: real("client_price_per_m2").notNull().default(0),
  subcontractorPricePerM2: real("subcontractor_price_per_m2").notNull().default(0),
  requiresFileUpload: boolean("requires_file_upload").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
