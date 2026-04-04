import { Router } from "express";
import { db, portfolioItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePortfolioItemBody, UpdatePortfolioItemBody, GetPortfolioItemParams, UpdatePortfolioItemParams, DeletePortfolioItemParams, ListPortfolioQueryParams } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router = Router();

router.get("/portfolio", async (req, res): Promise<void> => {
  const params = ListPortfolioQueryParams.safeParse(req.query);
  let items = await db.select().from(portfolioItemsTable);

  if (params.success && params.data.featured === true) {
    items = items.filter((i) => i.isFeatured);
  }
  if (params.success && params.data.category) {
    items = items.filter((i) => i.category === params.data.category);
  }

  res.json(items);
});

router.post("/portfolio", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreatePortfolioItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(portfolioItemsTable).values(parsed.data).returning();
  res.status(201).json(item);
});

router.get("/portfolio/:id", async (req, res): Promise<void> => {
  const params = GetPortfolioItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.select().from(portfolioItemsTable).where(eq(portfolioItemsTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Portfolio item not found" });
    return;
  }
  res.json(item);
});

router.put("/portfolio/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdatePortfolioItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePortfolioItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(portfolioItemsTable)
    .set(parsed.data)
    .where(eq(portfolioItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Portfolio item not found" });
    return;
  }
  res.json(item);
});

router.delete("/portfolio/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeletePortfolioItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.delete(portfolioItemsTable).where(eq(portfolioItemsTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ success: true, message: "Deleted" });
});

export default router;
