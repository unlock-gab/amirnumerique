import { Router } from "express";
import { db, subcontractorRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "../lib/auth";

const router = Router();

const CreateBody = z.object({
  fullName: z.string().min(2),
  companyName: z.string().min(1),
  phone: z.string().min(8),
  city: z.string().min(1),
  activityType: z.string().min(1),
  estimatedVolume: z.string().min(1),
  message: z.string().optional(),
});

const UpdateStatusBody = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "refused"]),
});

/* ── Public: submit a request ─────────────────────────────────────────── */
router.post("/subcontractor-requests", async (req, res): Promise<void> => {
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Données invalides", details: parsed.error.flatten() });
    return;
  }

  const [request] = await db
    .insert(subcontractorRequestsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(request);
});

/* ── Admin: list all requests ─────────────────────────────────────────── */
router.get("/subcontractor-requests", requireAdmin, async (req, res): Promise<void> => {
  const requests = await db
    .select()
    .from(subcontractorRequestsTable)
    .orderBy(desc(subcontractorRequestsTable.createdAt));

  res.json(requests);
});

/* ── Admin: get single ────────────────────────────────────────────────── */
router.get("/subcontractor-requests/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

  const [request] = await db
    .select()
    .from(subcontractorRequestsTable)
    .where(eq(subcontractorRequestsTable.id, id));

  if (!request) { res.status(404).json({ error: "Demande introuvable" }); return; }
  res.json(request);
});

/* ── Admin: update status ─────────────────────────────────────────────── */
router.patch("/subcontractor-requests/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "ID invalide" }); return; }

  const parsed = UpdateStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Statut invalide" }); return; }

  const [updated] = await db
    .update(subcontractorRequestsTable)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(subcontractorRequestsTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Demande introuvable" }); return; }
  res.json(updated);
});

export default router;
