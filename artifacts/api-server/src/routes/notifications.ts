import { Router } from "express";
import { db, notificationsTable, usersTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const limit = Math.min(parseInt(req.query.limit as string) || 30, 50);

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit);

  const unreadResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));

  res.json({
    notifications,
    unreadCount: Number(unreadResult[0].count),
  });
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
  res.json({ success: true });
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const userId = req.session.userId!;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [notif] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)))
    .returning();
  if (!notif) { res.status(404).json({ error: "Not found" }); return; }
  res.json(notif);
});

router.delete("/notifications/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const userId = req.session.userId!;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(notificationsTable).where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)));
  res.json({ success: true });
});

export default router;
