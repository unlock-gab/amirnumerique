import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingParams, UpdateSettingBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router = Router();

router.get("/settings", async (req, res): Promise<void> => {
  const settings = await db.select().from(settingsTable);
  res.json(settings);
});

router.put("/settings/:key", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateSettingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateSettingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  // Upsert
  const [existing] = await db.select().from(settingsTable).where(eq(settingsTable.key, params.data.key));

  let setting;
  if (existing) {
    [setting] = await db
      .update(settingsTable)
      .set({ value: body.data.value })
      .where(eq(settingsTable.key, params.data.key))
      .returning();
  } else {
    [setting] = await db
      .insert(settingsTable)
      .values({ key: params.data.key, value: body.data.value })
      .returning();
  }

  res.json(setting);
});

export default router;
