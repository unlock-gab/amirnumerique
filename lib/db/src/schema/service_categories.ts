import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceCategoriesTable = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  descriptionFr: text("description_fr"),
  descriptionAr: text("description_ar"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type ServiceCategory = typeof serviceCategoriesTable.$inferSelect;
