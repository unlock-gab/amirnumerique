-- ============================================================
-- Amir Numerique — Database Initialisation Script
-- Runs automatically on first PostgreSQL container start
-- ============================================================

-- ENUMS (safe to re-run)
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('visitor','client','subcontractor','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE preferred_language AS ENUM ('fr','ar');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE account_status AS ENUM ('active','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE unit_input AS ENUM ('cm','m');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending_on_delivery','paid','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending','confirmed','in_progress','printing','ready','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE quote_status AS ENUM ('pending','responded','accepted','refused','converted_to_order');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE subcontractor_request_status AS ENUM ('pending','reviewed','accepted','refused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  password_hash   TEXT NOT NULL,
  role            user_role         NOT NULL DEFAULT 'client',
  preferred_language preferred_language NOT NULL DEFAULT 'fr',
  account_status  account_status    NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- SERVICE CATEGORIES
CREATE TABLE IF NOT EXISTS service_categories (
  id            SERIAL PRIMARY KEY,
  name_fr       TEXT NOT NULL,
  name_ar       TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description_fr TEXT,
  description_ar TEXT,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id                        SERIAL PRIMARY KEY,
  category_id               INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
  name_fr                   TEXT NOT NULL,
  name_ar                   TEXT NOT NULL,
  slug                      TEXT NOT NULL UNIQUE,
  description_fr            TEXT,
  description_ar            TEXT,
  image_url                 TEXT,
  public_price_per_m2       REAL NOT NULL DEFAULT 0,
  client_price_per_m2       REAL NOT NULL DEFAULT 0,
  subcontractor_price_per_m2 REAL NOT NULL DEFAULT 0,
  requires_file_upload      BOOLEAN NOT NULL DEFAULT false,
  active                    BOOLEAN NOT NULL DEFAULT true,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  order_number     TEXT NOT NULL UNIQUE,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  service_id       INTEGER NOT NULL REFERENCES services(id),
  width_input      REAL NOT NULL,
  height_input     REAL NOT NULL,
  unit_input       unit_input NOT NULL,
  width_m          REAL NOT NULL,
  height_m         REAL NOT NULL,
  area_m2          REAL NOT NULL,
  unit_price_per_m2 REAL NOT NULL,
  displayed_price  REAL NOT NULL,
  final_price      REAL NOT NULL,
  quantity         INTEGER NOT NULL DEFAULT 1,
  file_url         TEXT,
  notes            TEXT,
  admin_note       TEXT,
  status           order_status   NOT NULL DEFAULT 'pending',
  payment_status   payment_status NOT NULL DEFAULT 'pending_on_delivery',
  category         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QUOTES
CREATE TABLE IF NOT EXISTS quotes (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  service_id      INTEGER NOT NULL REFERENCES services(id),
  width_input     REAL NOT NULL,
  height_input    REAL NOT NULL,
  unit_input      TEXT NOT NULL DEFAULT 'm',
  width_m         REAL NOT NULL,
  height_m        REAL NOT NULL,
  area_m2         REAL NOT NULL,
  estimated_price REAL,
  note            TEXT,
  file_url        TEXT,
  status          quote_status NOT NULL DEFAULT 'pending',
  admin_response  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PORTFOLIO
CREATE TABLE IF NOT EXISTS portfolio_items (
  id             SERIAL PRIMARY KEY,
  title_fr       TEXT NOT NULL,
  title_ar       TEXT NOT NULL,
  description_fr TEXT,
  description_ar TEXT,
  image_url      TEXT NOT NULL,
  category       TEXT,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  id    SERIAL PRIMARY KEY,
  key   TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

-- ADMIN LOGS
CREATE TABLE IF NOT EXISTS admin_logs (
  id          SERIAL PRIMARY KEY,
  admin_id    INTEGER NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  details     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBCONTRACTOR REQUESTS
CREATE TABLE IF NOT EXISTS subcontractor_requests (
  id               SERIAL PRIMARY KEY,
  full_name        TEXT NOT NULL,
  company_name     TEXT NOT NULL,
  phone            TEXT NOT NULL,
  city             TEXT NOT NULL,
  activity_type    TEXT NOT NULL,
  estimated_volume TEXT NOT NULL,
  message          TEXT,
  status           subcontractor_request_status NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS order_status_history (
  id                  SERIAL PRIMARY KEY,
  order_id            INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status              TEXT NOT NULL,
  changed_by_user_id  INTEGER REFERENCES users(id),
  note                TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'info',
  title      TEXT NOT NULL,
  message    TEXT,
  link       TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_orders_user_id           ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id           ON quotes(user_id);

-- DEFAULT ADMIN USER  (admin@amirnumerique.dz / admin123456)
INSERT INTO users (full_name, email, password_hash, role, account_status)
VALUES (
  'Administrateur',
  'admin@amirnumerique.dz',
  '$2b$10$yt6vg/n.FXG.6nZRVF6gxeoVgrketM2WkfZkxyM1ICnUpui7hMXqy',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- DEFAULT SETTINGS
INSERT INTO settings (key, value) VALUES
  ('company_name',      'Amir Numerique'),
  ('company_whatsapp',  '213xxxxxxxxx'),
  ('company_email',     'contact@amirnumerique.dz'),
  ('company_address',   'Algérie'),
  ('company_phone',     '+213xxxxxxxxx')
ON CONFLICT (key) DO NOTHING;
