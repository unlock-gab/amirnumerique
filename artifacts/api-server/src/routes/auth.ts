import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fullName, email, phone, password, preferredLanguage } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db.insert(usersTable).values({
    fullName,
    email,
    phone: phone ?? null,
    passwordHash,
    preferredLanguage: preferredLanguage ?? "fr",
    role: "client",
    accountStatus: "active",
  }).returning();

  req.session.userId = user.id;
  req.session.userRole = user.role;

  req.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Session save error on register");
      res.status(500).json({ error: "Session error" });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, message: "Registration successful" });
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.accountStatus === "suspended") {
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;
  req.session.userRole = user.role;

  req.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Session save error on login");
      res.status(500).json({ error: "Session error" });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, message: "Login successful" });
  });
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error({ err }, "Session destroy error");
    }
  });
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
