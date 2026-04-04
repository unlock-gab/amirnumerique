import { Router } from "express";
import { db, ordersTable, quotesTable, usersTable, servicesTable } from "@workspace/db";
import { sql, eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router = Router();

router.get("/stats/dashboard", requireAdmin, async (req, res): Promise<void> => {
  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      pendingOrders: sql<number>`count(*) filter (where order_status = 'pending')`,
      totalRevenue: sql<number>`coalesce(sum(final_price), 0)`,
    })
    .from(ordersTable);

  const [quoteStats] = await db
    .select({
      totalQuotes: sql<number>`count(*)`,
      pendingQuotes: sql<number>`count(*) filter (where status = 'pending')`,
    })
    .from(quotesTable);

  const [userStats] = await db
    .select({ totalUsers: sql<number>`count(*)` })
    .from(usersTable);

  const [serviceStats] = await db
    .select({ totalServices: sql<number>`count(*)` })
    .from(servicesTable);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthlyRevenue] = await db
    .select({ revenue: sql<number>`coalesce(sum(final_price), 0)` })
    .from(ordersTable)
    .where(sql`created_at >= ${startOfMonth}`);

  res.json({
    totalOrders: Number(orderStats.totalOrders),
    pendingOrders: Number(orderStats.pendingOrders),
    totalRevenue: Number(orderStats.totalRevenue),
    totalUsers: Number(userStats.totalUsers),
    totalQuotes: Number(quoteStats.totalQuotes),
    pendingQuotes: Number(quoteStats.pendingQuotes),
    totalServices: Number(serviceStats.totalServices),
    revenueThisMonth: Number(monthlyRevenue.revenue),
  });
});

router.get("/stats/client", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const [orderStats] = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      pendingOrders: sql<number>`count(*) filter (where order_status = 'pending')`,
      totalSpent: sql<number>`coalesce(sum(final_price), 0)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.userId, userId));

  const [quoteStats] = await db
    .select({
      totalQuotes: sql<number>`count(*)`,
      pendingQuotes: sql<number>`count(*) filter (where status = 'pending')`,
    })
    .from(quotesTable)
    .where(eq(quotesTable.userId, userId));

  res.json({
    totalOrders: Number(orderStats.totalOrders),
    pendingOrders: Number(orderStats.pendingOrders),
    totalSpent: Number(orderStats.totalSpent),
    totalQuotes: Number(quoteStats.totalQuotes),
    pendingQuotes: Number(quoteStats.pendingQuotes),
  });
});

router.get("/stats/orders-by-status", requireAdmin, async (req, res): Promise<void> => {
  const results = await db
    .select({
      status: ordersTable.orderStatus,
      count: sql<number>`count(*)`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.orderStatus);

  res.json(results.map(r => ({ status: r.status, count: Number(r.count) })));
});

router.get("/stats/recent-orders", requireAdmin, async (req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  res.json(orders);
});

export default router;
