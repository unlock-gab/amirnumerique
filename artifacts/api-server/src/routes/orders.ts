import { Router } from "express";
import { db, ordersTable, servicesTable, usersTable, orderStatusHistoryTable, serviceCategoriesTable, notificationsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams, UpdateOrderStatusParams, UpdateOrderStatusBody, ListOrdersQueryParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router = Router();

async function notifyAdmins(payload: { type: string; title: string; message: string; link?: string }) {
  try {
    const admins = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "admin"));
    if (admins.length > 0) {
      await db.insert(notificationsTable).values(admins.map(a => ({
        userId: a.id, type: payload.type, title: payload.title, message: payload.message, link: payload.link ?? null,
      })));
    }
  } catch {}
}

async function notifyUser(userId: number, payload: { type: string; title: string; message: string; link?: string }) {
  try {
    await db.insert(notificationsTable).values({
      userId, type: payload.type, title: payload.title, message: payload.message, link: payload.link ?? null,
    });
  } catch {}
}

const STATUS_NOTIF_LABELS: Record<string, string> = {
  confirmed:   "confirmée",
  in_progress: "en préparation",
  printing:    "en impression",
  ready:       "prête — récupérez-la !",
  delivered:   "livrée",
  cancelled:   "annulée",
};

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `AN-${year}-${rand}`;
}

function calcDimensions(width: number, height: number, unit: string) {
  const widthM = unit === "cm" ? width / 100 : width;
  const heightM = unit === "cm" ? height / 100 : height;
  const areaM2 = widthM * heightM;
  return { widthM, heightM, areaM2 };
}

const orderSelectFields = {
  order: ordersTable,
  user: {
    id: usersTable.id,
    fullName: usersTable.fullName,
    email: usersTable.email,
    phone: usersTable.phone,
    role: usersTable.role,
    preferredLanguage: usersTable.preferredLanguage,
    accountStatus: usersTable.accountStatus,
    createdAt: usersTable.createdAt,
  },
  service: servicesTable,
  category: {
    id: serviceCategoriesTable.id,
    nameFr: serviceCategoriesTable.nameFr,
    nameAr: serviceCategoriesTable.nameAr,
    slug: serviceCategoriesTable.slug,
  },
};

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? params.data.page : 1;
  const limit = params.success && params.data.limit ? params.data.limit : 20;
  const offset = (page - 1) * limit;
  const status = params.success ? params.data.status : undefined;

  const isAdmin = req.session.userRole === "admin";
  const userId = req.session.userId!;

  let query = db
    .select(orderSelectFields)
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(servicesTable, eq(ordersTable.serviceId, servicesTable.id))
    .leftJoin(serviceCategoriesTable, eq(servicesTable.categoryId, serviceCategoriesTable.id))
    .$dynamic();

  const conditions = [];
  if (!isAdmin) conditions.push(eq(ordersTable.userId, userId));
  if (status) conditions.push(eq(ordersTable.orderStatus, status as any));
  if (conditions.length > 0) query = query.where(and(...conditions));

  const orders = await query.orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(isAdmin ? undefined : eq(ordersTable.userId, userId));

  const total = Number(totalResult[0].count);

  res.json({
    orders: orders.map(({ order, user, service, category }) => ({ ...order, user, service, category })),
    total,
    page,
    limit,
  });
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { serviceId, widthInput, heightInput, unitInput, note, fileUrl } = parsed.data;
  const userId = req.session.userId!;
  const userRole = req.session.userRole || "client";

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceId));
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  let unitPricePerM2 = service.publicPricePerM2;
  if (userRole === "client") unitPricePerM2 = service.clientPricePerM2;
  if (userRole === "subcontractor") unitPricePerM2 = service.subcontractorPricePerM2;
  if (userRole === "admin") unitPricePerM2 = service.clientPricePerM2;

  const { widthM, heightM, areaM2 } = calcDimensions(widthInput, heightInput, unitInput);
  const finalPrice = areaM2 * unitPricePerM2;

  const [order] = await db.insert(ordersTable).values({
    orderNumber: generateOrderNumber(),
    userId,
    serviceId,
    widthInput,
    heightInput,
    unitInput,
    widthM,
    heightM,
    areaM2,
    unitPricePerM2,
    displayedPrice: finalPrice,
    finalPrice,
    note: note ?? null,
    fileUrl: fileUrl ?? null,
    paymentMethod: "payment_on_delivery",
    paymentStatus: "pending_on_delivery",
    orderStatus: "pending",
  }).returning();

  await db.insert(orderStatusHistoryTable).values({
    orderId: order.id,
    status: "pending",
    changedByUserId: userId,
    note: "Commande créée",
  });

  notifyAdmins({
    type: "order_new",
    title: "Nouvelle commande",
    message: `Commande ${order.orderNumber} en attente de confirmation.`,
    link: `/admin/orders/${order.id}`,
  });

  res.status(201).json(order);
});

router.get("/orders/:id/history", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid order id" }); return; }

  const isAdmin = req.session.userRole === "admin";
  const userId = req.session.userId!;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (!isAdmin && order.userId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

  const history = await db
    .select({
      id: orderStatusHistoryTable.id,
      status: orderStatusHistoryTable.status,
      note: orderStatusHistoryTable.note,
      createdAt: orderStatusHistoryTable.createdAt,
      changedBy: { id: usersTable.id, fullName: usersTable.fullName },
    })
    .from(orderStatusHistoryTable)
    .leftJoin(usersTable, eq(orderStatusHistoryTable.changedByUserId, usersTable.id))
    .where(eq(orderStatusHistoryTable.orderId, id))
    .orderBy(desc(orderStatusHistoryTable.createdAt));

  res.json(history);
});

router.patch("/orders/:id/admin-note", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const adminNote: string | null = typeof req.body.adminNote === "string" ? req.body.adminNote : null;
  const [order] = await db.update(ordersTable).set({ adminNote }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(order);
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const isAdmin = req.session.userRole === "admin";
  const userId = req.session.userId!;

  const [result] = await db
    .select(orderSelectFields)
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(servicesTable, eq(ordersTable.serviceId, servicesTable.id))
    .leftJoin(serviceCategoriesTable, eq(servicesTable.categoryId, serviceCategoriesTable.id))
    .where(eq(ordersTable.id, params.data.id));

  if (!result) { res.status(404).json({ error: "Order not found" }); return; }
  if (!isAdmin && result.order.userId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

  res.json({ ...result.order, user: result.user, service: result.service, category: result.category });
});

router.patch("/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const body = UpdateOrderStatusBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!existing) { res.status(404).json({ error: "Order not found" }); return; }

  const updateData: any = { orderStatus: body.data.orderStatus };
  if (body.data.paymentStatus) updateData.paymentStatus = body.data.paymentStatus;

  const [order] = await db.update(ordersTable).set(updateData).where(eq(ordersTable.id, params.data.id)).returning();

  if (body.data.orderStatus && body.data.orderStatus !== existing.orderStatus) {
    const statusNotes: Record<string, string> = {
      confirmed: "Commande confirmée",
      in_progress: "Préparation en cours",
      printing: "Impression en cours",
      ready: "Commande prête",
      delivered: "Commande livrée",
      cancelled: "Commande annulée",
    };
    await db.insert(orderStatusHistoryTable).values({
      orderId: order.id,
      status: body.data.orderStatus,
      changedByUserId: req.session.userId!,
      note: statusNotes[body.data.orderStatus] ?? null,
    });

    const label = STATUS_NOTIF_LABELS[body.data.orderStatus];
    if (label) {
      notifyUser(existing.userId, {
        type: "order_update",
        title: `Commande ${label}`,
        message: `Votre commande ${existing.orderNumber} est ${label}.`,
        link: `/dashboard/orders/${order.id}`,
      });
    }
  }

  res.json(order);
});

export default router;
