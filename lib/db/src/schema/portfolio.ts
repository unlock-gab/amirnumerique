import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── OLD flat table (kept for backward compat) ──────────────────────────────
export const portfolioItemsTable = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  titleFr: text("title_fr").notNull(),
  titleAr: text("title_ar").notNull(),
  descriptionFr: text("description_fr"),
  descriptionAr: text("description_ar"),
  imageUrl: text("image_url").notNull(),
  category: text("category"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItemsTable).omit({ id: true, createdAt: true });
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItemsTable.$inferSelect;

// ─── NEW 3-level portfolio system ───────────────────────────────────────────

export const portfolioCategoriesTable = pgTable("portfolio_categories", {
  id: serial("id").primaryKey(),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  coverImage: text("cover_image"),
  descriptionFr: text("description_fr"),
  descriptionAr: text("description_ar"),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PortfolioCategory = typeof portfolioCategoriesTable.$inferSelect;

export const portfolioNichesTable = pgTable("portfolio_niches", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => portfolioCategoriesTable.id, { onDelete: "cascade" }),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull(),
  coverImage: text("cover_image"),
  descriptionFr: text("description_fr"),
  descriptionAr: text("description_ar"),
  displayOrder: integer("display_order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PortfolioNiche = typeof portfolioNichesTable.$inferSelect;

export const portfolioProjectsTable = pgTable("portfolio_projects", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => portfolioCategoriesTable.id, { onDelete: "cascade" }),
  nicheId: integer("niche_id").notNull().references(() => portfolioNichesTable.id, { onDelete: "cascade" }),
  titleFr: text("title_fr").notNull(),
  titleAr: text("title_ar").notNull(),
  slug: text("slug").notNull(),
  coverImage: text("cover_image"),
  descriptionFr: text("description_fr"),
  descriptionAr: text("description_ar"),
  projectDetails: text("project_details"),
  displayOrder: integer("display_order").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PortfolioProject = typeof portfolioProjectsTable.$inferSelect;
