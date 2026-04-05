import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runInitSql() {
  const candidates = [
    path.resolve("/app/init.sql"),
    path.resolve(process.cwd(), "../../init.sql"),
    path.resolve(process.cwd(), "init.sql"),
  ];
  const sqlFile = candidates.find((f) => fs.existsSync(f));
  if (!sqlFile) {
    logger.info("init.sql not found — skipping DB init");
    return;
  }
  try {
    const sql = fs.readFileSync(sqlFile, "utf8");
    await pool.query(sql);
    logger.info({ file: sqlFile }, "DB initialised via init.sql");
  } catch (err) {
    logger.error({ err }, "init.sql execution failed");
  }
}

async function seedAdmin() {
  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@amirnumerique.dz"],
    );
    if (existing.rowCount === 0) {
      const hash = await bcrypt.hash("admin123456", 10);
      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, account_status)
         VALUES ($1, $2, $3, $4, $5)`,
        ["Administrateur", "admin@amirnumerique.dz", hash, "admin", "active"],
      );
      logger.info("Admin user created");
    }
  } catch (err) {
    logger.warn({ err }, "Could not seed admin user");
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await runInitSql();
  await seedAdmin();
});
