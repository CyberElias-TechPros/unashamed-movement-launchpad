-- Migrations for databases created before 2026-09-16.
-- Fresh installs only need `schema.sql`; run this only on an existing D1 that
-- predates these columns/tables. Safe to re-run only per-statement if it
-- previously failed — SQLite has no `ADD COLUMN IF NOT EXISTS`, so wrap each
-- statement in a try or check the reported error if it already exists.
--
--   npx wrangler d1 execute ttin-db --remote --file=./migrations.sql

-- Contacts inbox: read/unread state.
ALTER TABLE contacts ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0;

-- Orders: refund bookkeeping (status stays within the existing CHECK set).
ALTER TABLE orders ADD COLUMN refunded_at TEXT;
ALTER TABLE orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';

-- Secure digital-product download tokens (table is new — IF NOT EXISTS is safe).
CREATE TABLE IF NOT EXISTS order_downloads (
  token TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  max_downloads INTEGER NOT NULL DEFAULT 10,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_downloads_order ON order_downloads (order_id);

-- PayPal is now the primary payment provider — enable it on existing sites.
UPDATE site_settings SET pay_paypal = 1, updated_at = '2026-09-16T00:00:00.000Z' WHERE id = 1;
