import { Router } from "express";
import { db, serviceCategoriesTable, servicesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { z } from "zod";

const router = Router();

const CreateBody = z.object({
  nameFr: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().optional().default(0),
});

const UpdateBody = z.object({
  nameFr: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

router.get("/service-categories", async (req, res): Promise<void> => {
  const { active } = req.query;
  let categories;
  if (active === "true") {
    categories = await db.select().from(serviceCategoriesTable)
      .where(eq(serviceCategoriesTable.isActive, true))
      .orderBy(asc(serviceCategoriesTable.displayOrder), asc(serviceCategoriesTable.id));
  } else {
    categories = await db.select().from(serviceCategoriesTable)
      .orderBy(asc(serviceCategoriesTable.displayOrder), asc(serviceCategoriesTable.id));
  }
  res.json(categories);
});

router.post("/service-categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [category] = await db.insert(serviceCategoriesTable).values(parsed.data).returning();
  res.status(201).json(category);
});

router.get("/service-categories/slug/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const [category] = await db.select().from(serviceCategoriesTable)
    .where(eq(serviceCategoriesTable.slug, slug));
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(category);
});

router.get("/service-categories/:slug/services", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const [category] = await db.select().from(serviceCategoriesTable)
    .where(eq(serviceCategoriesTable.slug, slug));
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  const services = await db.select().from(servicesTable)
    .where(eq(servicesTable.categoryId, category.id));
  res.json(services);
});

router.get("/service-categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [category] = await db.select().from(serviceCategoriesTable)
    .where(eq(serviceCategoriesTable.id, id));
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(category);
});

router.put("/service-categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const parsed = UpdateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [category] = await db.update(serviceCategoriesTable)
    .set(parsed.data)
    .where(eq(serviceCategoriesTable.id, id))
    .returning();
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(category);
});

router.delete("/service-categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [category] = await db.delete(serviceCategoriesTable)
    .where(eq(serviceCategoriesTable.id, id))
    .returning();
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json({ success: true, message: "Category deleted" });
});

export default router;
