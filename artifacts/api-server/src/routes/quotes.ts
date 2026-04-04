import { Router } from "express";
import { db, quotesTable, servicesTable, usersTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { CreateQuoteBody, GetQuoteParams, UpdateQuoteStatusParams, UpdateQuoteStatusBody, ListQuotesQueryParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router = Router();

function calcDimensions(width: number, height: number, unit: string) {
  const widthM = unit === "cm" ? width / 100 : width;
  const heightM = unit === "cm" ? height / 100 : height;
  const areaM2 = widthM * heightM;
  return { widthM, heightM, areaM2 };
}

router.get("/quotes", requireAuth, async (req, res): Promise<void> => {
  const params = ListQuotesQueryParams.safeParse(req.query);
  const page = params.success && params.data.page ? params.data.page : 1;
  const limit = params.success && params.data.limit ? params.data.limit : 20;
  const offset = (page - 1) * limit;
  const status = params.success ? params.data.status : undefined;

  const isAdmin = req.session.userRole === "admin";
  const userId = req.session.userId!;

  let query = db
    .select({
      quote: quotesTable,
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
    })
    .from(quotesTable)
    .leftJoin(usersTable, eq(quotesTable.userId, usersTable.id))
    .leftJoin(servicesTable, eq(quotesTable.serviceId, servicesTable.id))
    .$dynamic();

  const conditions = [];
  if (!isAdmin) conditions.push(eq(quotesTable.userId, userId));
  if (status) conditions.push(eq(quotesTable.status, status as any));
  if (conditions.length > 0) query = query.where(and(...conditions));

  const quotes = await query.orderBy(desc(quotesTable.createdAt)).limit(limit).offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotesTable)
    .where(isAdmin ? undefined : eq(quotesTable.userId, userId));

  res.json({
    quotes: quotes.map(({ quote, user, service }) => ({ ...quote, user, service })),
    total: Number(totalResult[0].count),
    page,
    limit,
  });
});

router.post("/quotes", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateQuoteBody.safeParse(req.body);
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

  const { widthM, heightM, areaM2 } = calcDimensions(widthInput, heightInput, unitInput);
  const estimatedPrice = areaM2 * unitPricePerM2;

  const [quote] = await db.insert(quotesTable).values({
    userId,
    serviceId,
    widthInput,
    heightInput,
    unitInput,
    widthM,
    heightM,
    areaM2,
    estimatedPrice,
    note: note ?? null,
    fileUrl: fileUrl ?? null,
    status: "pending",
  }).returning();

  res.status(201).json(quote);
});

router.get("/quotes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetQuoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const isAdmin = req.session.userRole === "admin";
  const userId = req.session.userId!;

  const [result] = await db
    .select({
      quote: quotesTable,
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
    })
    .from(quotesTable)
    .leftJoin(usersTable, eq(quotesTable.userId, usersTable.id))
    .leftJoin(servicesTable, eq(quotesTable.serviceId, servicesTable.id))
    .where(eq(quotesTable.id, params.data.id));

  if (!result) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }

  if (!isAdmin && result.quote.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json({ ...result.quote, user: result.user, service: result.service });
});

router.patch("/quotes/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateQuoteStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateQuoteStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [quote] = await db
    .update(quotesTable)
    .set({ status: body.data.status, adminResponse: body.data.adminResponse ?? null })
    .where(eq(quotesTable.id, params.data.id))
    .returning();

  if (!quote) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  res.json(quote);
});

export default router;
