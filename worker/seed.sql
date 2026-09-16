-- TTIN sample data (mirrors the legacy Mongo seed).
-- Apply with: npx wrangler d1 execute ttin-db --file=./seed.sql [--remote]
-- The admin password hash below is `Admin123!` hashed with PBKDF2-SHA256
-- (100k iterations) — the same scheme the Worker uses. Change it after first
-- login, or generate a new hash with worker/scripts/hash-password.mjs.

INSERT INTO users (id, name, email, password_hash, role, email_verified, created_at, updated_at)
VALUES (
  '5f1a2b3c4d5e6f7a8b9c0d1e',
  'TTIN Admin',
  'admin@thetimeisnow.com',
  'pbkdf2$100000$5B1OcU1qXQnCRtifQ7npVw==$yNZsGOD1XQ4jv+RXRRMRWPJoRcdsPnC9qgJOWrvf69s=',
  'admin', 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'
)
ON CONFLICT(email) DO NOTHING;

INSERT INTO products (id, name, description, price, category, images, tag, stock, is_active, download_url, sizes, colors, created_at, updated_at) VALUES
  ('650a1b2c3d4e5f6a7b8c9d01', 'UNASHAMED Classic Tee', 'Bold faith on premium cotton.', 28, 'merch', '[]', 'Bestseller', 50, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d02', 'The Time Is Now Tee', 'Movement statement tee.', 26, 'merch', '[]', '', 40, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d03', 'Seventh Man Hoodie', 'Warm hoodie for outreach nights.', 55, 'merch', '[]', '', 30, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d04', 'Bold Preacher Long Sleeve', 'Layer up and preach on.', 32, 'merch', '[]', '', 25, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d05', 'Faith Over Fear Tank', 'Summer outreach essential.', 22, 'merch', '[]', '', 35, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d06', 'Gospel Flame Tee', 'Vibrant design for street preaching.', 27, 'merch', '[]', '', 45, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d07', 'TTIN Snapback Cap', 'One size, embroidered logo.', 24, 'merch', '[]', '', 60, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d08', 'Unashamed Beanie', 'Winter preaching companion.', 20, 'merch', '[]', '', 40, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d09', 'Movement Bucket Hat', 'Sun-ready street style.', 22, 'merch', '[]', '', 30, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d0a', 'Outreach Tote Bag', 'Carry tracts and Bibles anywhere.', 18, 'merch', '[]', '', 50, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d0b', 'Faith Phone Case', 'Universal fit case.', 15, 'merch', '[]', '', 100, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d0c', 'TTIN Water Bottle', 'Stay hydrated on the go.', 16, 'merch', '[]', '', 55, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d0d', 'Bold Wristband Pack (3)', 'Share the message daily.', 8, 'merch', '[]', '', 200, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d0e', 'Sticker Pack', '10 die-cut movement stickers.', 6, 'merch', '[]', '', 300, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d0f', 'TTIN Keychain', 'Metal keychain with logo.', 10, 'merch', '[]', '', 80, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d10', 'Unashamed Book', 'The movement story in print.', 18, 'digital', '[]', '', 999, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d11', '30-Day Bold Faith Devotional', 'PDF devotional series.', 0, 'digital', '[]', '', 999, 1, '/resources', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d12', 'Street Preaching Toolkit', 'Guides, scripts, and checklists.', 12, 'digital', '[]', '', 999, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d13', 'TTIN Wallpaper Pack', 'Mobile & desktop backgrounds.', 0, 'digital', '[]', '', 999, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d14', 'Open Air Guide', 'Step-by-step preaching guide.', 0, 'digital', '[]', '', 999, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d15', 'Bold Faith Journal', 'Printable journal pages.', 8, 'digital', '[]', '', 999, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d16', 'Gospel Tracts (50 pack)', 'Outreach tracts bundle.', 12, 'merch', '[]', '', 75, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d17', 'Witness Cards (25 pack)', 'Pocket-sized witness tools.', 9, 'merch', '[]', '', 90, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('650a1b2c3d4e5f6a7b8c9d18', 'Outreach Starter Kit', 'Tracts, wristbands, and guide.', 35, 'merch', '[]', 'Bundle', 20, 1, '', '[]', '[]', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
ON CONFLICT(id) DO NOTHING;

INSERT INTO resources (id, title, author, description, type, category, download_url, is_free, is_active, created_at, updated_at) VALUES
  ('660b1c2d3e4f5a6b7c8d9e01', 'Foxe''s Book of Martyrs', 'John Foxe', 'Classic account of Christian martyrs.', 'book', 'Church History & Martyrs for Christ', '/resources/Foxe''s Book of Martyrs.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e02', 'God''s Generals - The Revivalists', 'Roberts Liardon', 'Stories of revival pioneers.', 'book', 'Church History & Martyrs for Christ', '/resources/God''s Generals- The Revivalists.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e03', 'God''s Generals - Why They Succeeded and Why Some Failed', 'Roberts Liardon', 'Lessons from successful generals.', 'book', 'Church History & Martyrs for Christ', '/resources/God''s Generals- Why They Succeeded and Why Some Failed.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e04', 'Revival In The Hebrides', 'Duncan Campbell', 'Scottish revival narrative.', 'book', 'Church History & Martyrs for Christ', '/resources/Revival in the Hebrides.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e05', 'Tortured For Christ', 'Richard Wurmbrand', 'Underground church testimony.', 'book', 'Church History & Martyrs for Christ', '/resources/Tortured for Christ.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e06', 'I Went To Hell', 'Marilyn A. Katz', 'Near-death testimony.', 'book', 'Other Inspiration', '/resources/I Went To Hell.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e07', 'Kathryn Kuhlman - Her Spiritual Legacy', 'Roberts Liardon', 'Biography of the healing evangelist.', 'book', 'Other Inspiration', '/resources/Kathryn Kuhlman- Her Spiritual Legacy.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e08', 'Now That You Are Born Again', 'Chris Oyakhilome', 'Foundations for new believers.', 'book', 'TTIN Resources', '/resources/Now That You Are Born Again.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e09', 'Recreating Your World', 'Chris Oyakhilome', 'Kingdom mindset teaching.', 'book', 'TTIN Resources', '/resources/Recreating Your World.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e0a', 'The Power Of Tongues', 'Chris Oyakhilome', 'Teaching on prayer language.', 'book', 'TTIN Resources', '/resources/The Power of Tongues.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e0b', 'The Seven Spirits Of God', 'Chris Oyakhilome', 'Spiritual insight.', 'book', 'TTIN Resources', '/resources/The Seven Spirits of God.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e0c', 'When God Visits You', 'Chris Oyakhilome', 'Encountering God.', 'book', 'TTIN Resources', '/resources/When God Visits You.pdf', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e0d', '30-Day Bold Faith Devotional', 'TTIN', 'Daily boldness prompts.', 'devotional', 'TTIN Resources', 'https://drive.google.com/file/d/1Zej1g3M0KwKqIIGfDyheY1cv8txAvAko/view', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e0e', 'Street Preaching Guide', 'TTIN', 'Practical open-air guide.', 'guide', 'TTIN Resources', 'https://drive.google.com/file/d/1x1yTVu10QGLhsBsecY0C-AXj_oxwSGei/view', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e0f', 'Witnessing Toolkit', 'TTIN', 'Tools for everyday evangelism.', 'guide', 'TTIN Resources', 'https://drive.google.com/file/d/1f48cQfjKPsiLvnUlZKcSdOgYMvt1ioSy/view', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e10', 'Apologetics Quick Reference', 'TTIN', 'Answers for common objections.', 'guide', 'TTIN Resources', 'https://drive.google.com/file/d/1GIfK3x0fsSP_u_l1xHiHUuU-lt-V5GeL/view', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e11', 'Unashamed Podcast Intro', 'TTIN', 'Audio introduction to the series.', 'podcast', 'TTIN Resources', 'https://youtube.com/@TheTimeIsNow255', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('660b1c2d3e4f5a6b7c8d9e12', 'Why Boldness Matters', 'TTIN', 'Article on living unashamed.', 'article', 'TTIN Resources', 'https://thetimeisnow.org', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
ON CONFLICT(id) DO NOTHING;

INSERT INTO events (id, title, description, date, time, location, type, capacity, registered_count, is_active, created_at, updated_at) VALUES
  ('670c1d2e3f4a5b6c7d8e9f01', 'Global Boldness Conference', 'A gathering of unashamed believers worldwide.', '2026-12-15T09:00:00.000Z', '9:00 AM', 'Lagos, Nigeria', 'conference', 500, 0, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('670c1d2e3f4a5b6c7d8e9f02', 'Street Preaching Workshop', 'Hands-on training for open-air evangelism.', '2027-01-20T14:00:00.000Z', '2:00 PM', 'London, UK', 'workshop', 80, 0, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('670c1d2e3f4a5b6c7d8e9f03', 'Campus Outreach Day', 'University campuses across 16 nations.', '2026-10-30T10:00:00.000Z', '10:00 AM', 'Multiple Cities', 'outreach', 0, 0, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('670c1d2e3f4a5b6c7d8e9f04', 'Unashamed Online Prayer', 'Weekly prayer and testimony stream.', '2026-12-22T19:00:00.000Z', '7:00 PM', 'Zoom', 'online', 1000, 0, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
ON CONFLICT(id) DO NOTHING;

INSERT INTO testimonies (id, name, location, text, category, is_approved, is_featured, created_at, updated_at) VALUES
  ('680d1e2f3a4b5c6d7e8f9a01', 'James O.', 'Nigeria', 'I preached on a bus for the first time and three people prayed to receive Christ.', 'Evangelism', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('680d1e2f3a4b5c6d7e8f9a02', 'Sarah M.', 'United Kingdom', 'The resources gave me courage to share at my workplace.', 'Workplace', 1, 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('680d1e2f3a4b5c6d7e8f9a03', 'David K.', 'Kenya', 'Our youth group now preaches openly every Saturday.', 'Youth', 1, 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('680d1e2f3a4b5c6d7e8f9a04', 'Elena R.', 'Spain', 'God used a simple conversation at the mall to change a life.', 'Lifestyle', 1, 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('680d1e2f3a4b5c6d7e8f9a05', 'Michael T.', 'United States', 'Apologetics training helped me answer tough questions on campus.', 'Apologetics', 1, 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('680d1e2f3a4b5c6d7e8f9a06', 'Grace A.', 'Ghana', 'We formed a preaching team at our church after joining TTIN.', 'Evangelism', 1, 0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
ON CONFLICT(id) DO NOTHING;

INSERT INTO site_content (id, key, title, content, type, metadata, created_at, updated_at) VALUES
  ('690e1f2a3b4c5d6e7f8a9b01', 'hero', 'The Time Is Now', 'Bold faith for today''s generation.', 'hero', '{}', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('690e1f2a3b4c5d6e7f8a9b02', 'about', 'About', 'We are a global movement of unashamed believers.', 'about', '{}', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('690e1f2a3b4c5d6e7f8a9b03', 'mission', 'Mission', 'Empowering believers to live boldly.', 'mission', '{}', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('690e1f2a3b4c5d6e7f8a9b04', 'featured', 'Featured', 'Highlighted content and calls to action.', 'featured', '{}', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z')
ON CONFLICT(key) DO NOTHING;

INSERT INTO site_settings (id, allow_registration, pay_paypal, updated_at) VALUES (1, 1, 1, '2026-01-01T00:00:00.000Z') ON CONFLICT(id) DO UPDATE SET allow_registration = excluded.allow_registration, pay_paypal = excluded.pay_paypal, updated_at = excluded.updated_at;
