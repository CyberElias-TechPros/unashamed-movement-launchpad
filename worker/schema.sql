-- TTIN D1 schema (Cloudflare D1 / SQLite).
-- Apply with: npx wrangler d1 execute ttin-db --file=./schema.sql [--remote]

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  email_verified INTEGER NOT NULL DEFAULT 0,
  email_verification_token TEXT,
  email_verification_expires INTEGER,
  reset_password_token TEXT,
  reset_password_expires INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_role_created ON users (role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_password_token);
CREATE INDEX IF NOT EXISTS idx_users_verify_token ON users (email_verification_token);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('merch', 'digital')),
  images TEXT NOT NULL DEFAULT '[]',
  tag TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  download_url TEXT NOT NULL DEFAULT '',
  sizes TEXT NOT NULL DEFAULT '[]',
  colors TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products (is_active, category);
CREATE INDEX IF NOT EXISTS idx_products_created ON products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items TEXT NOT NULL DEFAULT '[]',
  total_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT '',
  payment_id TEXT NOT NULL DEFAULT '',
  idempotency_key TEXT UNIQUE,
  shipping_address TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders (payment_id);

CREATE TABLE IF NOT EXISTS testimonies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other' CHECK (category IN ('Evangelism', 'Youth', 'Apologetics', 'Lifestyle', 'Workplace', 'Other')),
  image TEXT NOT NULL DEFAULT '',
  is_approved INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_testimonies_approved_created ON testimonies (is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonies_featured ON testimonies (is_approved, is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonies_category ON testimonies (category, is_approved);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('book', 'devotional', 'guide', 'article', 'podcast')),
  category TEXT NOT NULL DEFAULT 'Other Inspiration',
  file_url TEXT NOT NULL DEFAULT '',
  external_url TEXT NOT NULL DEFAULT '',
  download_url TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  is_free INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_resources_active_type ON resources (is_active, type);
CREATE INDEX IF NOT EXISTS idx_resources_active_category ON resources (is_active, category);
CREATE INDEX IF NOT EXISTS idx_resources_downloads ON resources (download_count DESC);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  episode TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_videos_active_order ON videos (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_videos_created ON videos (created_at DESC);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  end_date TEXT,
  time TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('conference', 'workshop', 'outreach', 'online', 'meetup')),
  image TEXT NOT NULL DEFAULT '',
  registration_url TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 0,
  registered_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_active_date ON events (is_active, date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (type, is_active);

CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  attendee_name TEXT NOT NULL DEFAULT '',
  attendee_email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_event_regs_event ON event_registrations (event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_regs_unique ON event_registrations (event_id, attendee_email);

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  donor_name TEXT NOT NULL DEFAULT 'Anonymous',
  donor_email TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  type TEXT NOT NULL DEFAULT 'one-time' CHECK (type IN ('one-time', 'monthly')),
  message TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT '',
  payment_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations (created_at DESC);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts (created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subs_active ON newsletter_subscribers (active, created_at DESC);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  approved INTEGER NOT NULL DEFAULT 0,
  rejected INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON reviews (product_id, approved);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews (approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews (created_at DESC);

CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'hero' CHECK (type IN ('hero', 'about', 'values', 'cta', 'stats', 'mission', 'featured')),
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'The Time Is Now',
  tagline TEXT NOT NULL DEFAULT 'Bold faith for today''s generation',
  site_url TEXT NOT NULL DEFAULT 'https://thetimeisnow.org',
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  favicon_url TEXT NOT NULL DEFAULT '',
  theme_mode TEXT NOT NULL DEFAULT 'default' CHECK (theme_mode IN ('default', 'bw-purple', 'minimal')),
  primary_color TEXT NOT NULL DEFAULT '#7c3aed',
  accent_color TEXT NOT NULL DEFAULT '#fbbf24',
  allow_newsletter INTEGER NOT NULL DEFAULT 1,
  allow_registration INTEGER NOT NULL DEFAULT 0,
  moderate_reviews INTEGER NOT NULL DEFAULT 1,
  moderate_testimonials INTEGER NOT NULL DEFAULT 1,
  maintenance_mode INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  social_twitter TEXT NOT NULL DEFAULT '',
  social_instagram TEXT NOT NULL DEFAULT '',
  social_youtube TEXT NOT NULL DEFAULT '',
  social_tiktok TEXT NOT NULL DEFAULT '',
  email_from TEXT NOT NULL DEFAULT '',
  smtp_host TEXT NOT NULL DEFAULT '',
  smtp_port TEXT NOT NULL DEFAULT '587',
  pay_stripe INTEGER NOT NULL DEFAULT 1,
  pay_paypal INTEGER NOT NULL DEFAULT 0,
  pay_paystack INTEGER NOT NULL DEFAULT 1,
  pay_flutterwave INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  value INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics_events (category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events (created_at DESC);

CREATE TABLE IF NOT EXISTS back_in_stock (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_back_in_stock_unique ON back_in_stock (product_id, email);
