/**
 * Content routes: editable site content, videos, resources, settings,
 * search, countries, analytics.
 */
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, Row } from '../types';
import { intToBool, parseJsonField, readJson, toApi } from '../types';
import { newId, orderBy, paginateQuery, parsePageParams, searchGroup, updateRow } from '../db';
import { isEmail, nowIso } from '../util';
import { requireAdmin, trackLimiter } from '../middleware';

type App = Hono<{ Bindings: Env }>;

// Shared with search results so JSON columns are parsed consistently.
import { serializeProduct } from './shop';

/* ------------------------------------------------------------------ */
/* Editable site content                                               */
/* ------------------------------------------------------------------ */

const serializeContent = (row: Row) => ({ ...toApi(row), metadata: parseJsonField(row.metadata, {}) });

export const contentRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  const defaults: Record<string, Record<string, unknown>> = {
    hero: {
      key: 'hero',
      title: 'UNASHAMED',
      content: '"Is your timidity worth someone else\'s eternity?"',
      type: 'hero',
      metadata: { blurb: 'A movement for Christians who refuse to stay silent. Be bold. Be unapologetic. Be unashamed.' },
    },
  };

  router.get('/', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM site_content ORDER BY key ASC').all<Row>();
    return c.json((results || []).map(serializeContent));
  });

  router.get('/:key', async (c) => {
    const key = c.req.param('key');
    const row = await c.env.DB.prepare('SELECT * FROM site_content WHERE key = ?').bind(key).first<Row>();
    if (!row) {
      if (defaults[key]) return c.json(defaults[key]);
      return c.json({ message: 'Not found' }, 404);
    }
    return c.json(serializeContent(row));
  });

  const upsert = async (c: Context<{ Bindings: Env }>) => {
    const body = await readJson(c);
    const key = String(body.key || c.req.param('key') || '').trim();
    if (!key) return c.json({ message: 'key is required' }, 400);
    const title = String(body.title || '');
    const content = String(body.content || '');
    const type = String(body.type || 'hero');
    const metadata = body.metadata !== undefined ? JSON.stringify(body.metadata) : '{}';

    await c.env.DB.prepare(
      `INSERT INTO site_content (id, key, title, content, type, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET title = excluded.title, content = excluded.content, type = excluded.type, metadata = excluded.metadata, updated_at = excluded.updated_at`
    )
      .bind(newId(), key, title, content, type, metadata, nowIso(), nowIso())
      .run();
    const row = await c.env.DB.prepare('SELECT * FROM site_content WHERE key = ?').bind(key).first<Row>();
    return c.json(serializeContent(row!));
  };

  router.post('/', requireAdmin, upsert);
  router.put('/:key', requireAdmin, upsert);

  router.delete('/:key', requireAdmin, async (c) => {
    await c.env.DB.prepare('DELETE FROM site_content WHERE key = ?').bind(c.req.param('key')).run();
    return c.json({ message: 'Removed' });
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Videos                                                              */
/* ------------------------------------------------------------------ */

const serializeVideo = (row: Row) => intToBool(toApi(row), ['is_active']);

export const videoRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  const filters = (q: URLSearchParams, publicOnly: boolean) => {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (publicOnly) clauses.push('is_active = 1');
    const isActive = q.get('isActive');
    if (!publicOnly && isActive !== null && isActive !== '') {
      clauses.push('is_active = ?');
      params.push(isActive === 'true' ? 1 : 0);
    }
    const search = searchGroup(q.get('search') || '', ['title', 'description', 'episode']);
    if (search.sql) {
      clauses.push(search.sql);
      params.push(...search.params);
    }
    return { sql: clauses.join(' AND '), params };
  };

  router.get('/', async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { order: 'sort_order', createdAt: 'created_at', title: 'title' }, 'sort_order ASC');
    const result = await paginateQuery(c.env.DB, filters(q, true), 'SELECT * FROM videos', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeVideo), pagination: result.pagination });
  });

  router.get('/feed', async (c) => {
    const { results } = await c.env.DB
      .prepare('SELECT * FROM videos WHERE is_active = 1 ORDER BY sort_order ASC')
      .all<Row>();
    return c.json((results || []).map(serializeVideo));
  });

  router.get('/admin/all', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { order: 'sort_order', createdAt: 'created_at', title: 'title' }, 'sort_order ASC');
    const result = await paginateQuery(c.env.DB, filters(q, false), 'SELECT * FROM videos', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeVideo), pagination: result.pagination });
  });

  router.post('/bulk-delete', requireAdmin, async (c) => {
    const { ids } = await c.req.json<{ ids?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`DELETE FROM videos WHERE id IN (${placeholders})`).bind(...ids).run();
    return c.json({ message: 'Videos deleted', deletedCount: res.meta.changes });
  });

  router.post('/bulk-update-status', requireAdmin, async (c) => {
    const { ids, isActive } = await c.req.json<{ ids?: unknown; isActive?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    if (typeof isActive !== 'boolean') return c.json({ message: 'isActive boolean required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`UPDATE videos SET is_active = ?, updated_at = ? WHERE id IN (${placeholders})`)
      .bind(isActive ? 1 : 0, nowIso(), ...ids)
      .run();
    return c.json({ message: 'Videos updated', modifiedCount: res.meta.changes });
  });

  router.get('/:id', async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(c.req.param('id')).first<Row>();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeVideo(row));
  });

  router.post('/', requireAdmin, async (c) => {
    const body = await readJson(c);
    const title = String(body.title || '').trim();
    const youtubeUrl = String(body.youtubeUrl || '').trim();
    if (!title || !youtubeUrl) return c.json({ message: 'Validation failed' }, 400);
    const id = newId();
    await c.env.DB.prepare(
      `INSERT INTO videos (id, title, description, episode, duration, youtube_url, thumbnail_url, is_active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        title,
        String(body.description || ''),
        String(body.episode || ''),
        String(body.duration || ''),
        youtubeUrl,
        String(body.thumbnailUrl || body.thumbnail || ''),
        body.isActive === false ? 0 : 1,
        Number(body.order ?? 0) || 0,
        nowIso(),
        nowIso()
      )
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first<Row>())!;
    return c.json(serializeVideo(row), 201);
  });

  router.put('/:id', requireAdmin, async (c) => {
    const id = c.req.param('id');
    const body = await readJson(c);
    const fields: Record<string, unknown> = {};
    if (body.title !== undefined) fields.title = String(body.title).trim();
    if (body.description !== undefined) fields.description = String(body.description);
    if (body.episode !== undefined) fields.episode = String(body.episode);
    if (body.duration !== undefined) fields.duration = String(body.duration);
    if (body.youtubeUrl !== undefined || body.url !== undefined) fields.youtube_url = String(body.youtubeUrl ?? body.url);
    if (body.thumbnailUrl !== undefined || body.thumbnail !== undefined) fields.thumbnail_url = String(body.thumbnailUrl ?? body.thumbnail);
    if (body.isActive !== undefined) fields.is_active = body.isActive === true ? 1 : 0;
    if (body.order !== undefined) fields.sort_order = Number(body.order) || 0;
    const upd = updateRow('videos', fields, 'id = ?', [id]);
    if (upd) await c.env.DB.prepare(upd.sql).bind(...upd.params).run();
    const row = await c.env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first<Row>();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeVideo(row));
  });

  router.delete('/:id', requireAdmin, async (c) => {
    await c.env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ message: 'Video removed' });
  });

  // Direct file upload (stored in R2, URL saved as the video source).
  router.post('/upload', requireAdmin, async (c) => {
    if (!c.env.MEDIA) return c.json({ message: 'Media storage (R2) is not configured' }, 503);
    const form = await c.req.formData().catch(() => null);
    const file = (form?.get('file') || form?.get('video')) as File | null;
    if (!file || typeof file === 'string') return c.json({ message: 'No file uploaded' }, 400);

    const ext = (file.name.split('.').pop() || 'mp4').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const key = `video-${Date.now()}-${Math.floor(Math.random() * 1e9)}.${ext}`;
    await c.env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'video/mp4' },
    });

    const id = newId();
    await c.env.DB.prepare(
      `INSERT INTO videos (id, title, description, episode, duration, youtube_url, thumbnail_url, is_active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, '', '', ?, ?, 1, 0, ?, ?)`
    )
      .bind(id, String(form?.get('title') || file.name), String(form?.get('description') || ''), `/api/uploads/${key}`, String(form?.get('thumbnail') || ''), nowIso(), nowIso())
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first<Row>())!;
    return c.json(serializeVideo(row), 201);
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Resources                                                           */
/* ------------------------------------------------------------------ */

const serializeResource = (row: Row) => {
  const api = intToBool(toApi(row), ['is_free', 'is_active']);
  // Legacy compat: `free` mirrors isFree; downloadUrl falls back like the Mongo transform.
  api.free = api.isFree;
  api.downloadUrl = api.downloadUrl || api.externalUrl || api.fileUrl || '';
  api.imageUrl = api.image;
  return api;
};

export const resourceRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  const filters = (q: URLSearchParams, publicOnly: boolean) => {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (publicOnly) clauses.push('is_active = 1');
    const type = q.get('type');
    if (type && type !== 'All') {
      clauses.push('type = ?');
      params.push(type);
    }
    const category = q.get('category');
    if (category && category !== 'All') {
      clauses.push('category = ?');
      params.push(category);
    }
    const isActive = q.get('isActive');
    if (!publicOnly && isActive !== null && isActive !== '') {
      clauses.push('is_active = ?');
      params.push(isActive === 'true' ? 1 : 0);
    }
    const free = q.get('free');
    if (free !== null && free !== '') {
      clauses.push('is_free = ?');
      params.push(free === 'true' ? 1 : 0);
    }
    const search = searchGroup(q.get('search') || '', ['title', 'description', 'author']);
    if (search.sql) {
      clauses.push(search.sql);
      params.push(...search.params);
    }
    return { sql: clauses.join(' AND '), params };
  };

  router.get('/', async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { createdAt: 'created_at', downloadCount: 'download_count', title: 'title' }, 'created_at DESC');
    const result = await paginateQuery(c.env.DB, filters(q, true), 'SELECT * FROM resources', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeResource), pagination: result.pagination });
  });

  router.get('/admin/all', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { createdAt: 'created_at', downloadCount: 'download_count', title: 'title' }, 'created_at DESC');
    const result = await paginateQuery(c.env.DB, filters(q, false), 'SELECT * FROM resources', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeResource), pagination: result.pagination });
  });

  router.post('/bulk-delete', requireAdmin, async (c) => {
    const { ids } = await c.req.json<{ ids?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`DELETE FROM resources WHERE id IN (${placeholders})`).bind(...ids).run();
    return c.json({ message: 'Resources deleted', deletedCount: res.meta.changes });
  });

  router.post('/bulk-update-status', requireAdmin, async (c) => {
    const { ids, isActive } = await c.req.json<{ ids?: unknown; isActive?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    if (typeof isActive !== 'boolean') return c.json({ message: 'isActive boolean required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`UPDATE resources SET is_active = ?, updated_at = ? WHERE id IN (${placeholders})`)
      .bind(isActive ? 1 : 0, nowIso(), ...ids)
      .run();
    return c.json({ message: 'Resources updated', modifiedCount: res.meta.changes });
  });

  router.post('/:id/download', async (c) => {
    const id = c.req.param('id');
    const res = await c.env.DB.prepare(
      'UPDATE resources SET download_count = download_count + 1 WHERE id = ? AND is_active = 1'
    )
      .bind(id)
      .run();
    if (res.meta.changes === 0) return c.json({ message: 'Not found' }, 404);
    const row = await c.env.DB.prepare('SELECT * FROM resources WHERE id = ?').bind(id).first<Row>();
    const downloadUrl = (row?.download_url || row?.external_url || row?.file_url || '') as string;
    return c.json({ downloadUrl, message: 'Download tracked', downloadCount: row?.download_count });
  });

  router.get('/:id/pdf-url', async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM resources WHERE id = ?').bind(c.req.param('id')).first<Row>();
    if (!row) return c.json({ message: 'Not found' }, 404);
    const pdfUrl = String(row.download_url || row.external_url || row.file_url || '');
    if (!pdfUrl) return c.json({ message: 'No PDF URL available' }, 404);
    return c.json({ pdfUrl });
  });

  router.get('/:id', async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM resources WHERE id = ?').bind(c.req.param('id')).first<Row>();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeResource(row));
  });

  router.post('/', requireAdmin, async (c) => {
    const body = await readJson(c);
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const type = String(body.type || '');
    if (!title || !description || !['book', 'devotional', 'guide', 'article', 'podcast'].includes(type)) {
      return c.json({ message: 'Validation failed' }, 400);
    }
    const id = newId();
    const isFree = body.isFree !== undefined ? (body.isFree === true ? 1 : 0) : body.free !== undefined ? (body.free === true ? 1 : 0) : 1;
    await c.env.DB.prepare(
      `INSERT INTO resources (id, title, author, description, type, category, file_url, external_url, download_url, image, is_free, price, download_count, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`
    )
      .bind(
        id,
        title,
        String(body.author || ''),
        description,
        type,
        String(body.category || 'Other Inspiration'),
        String(body.fileUrl || ''),
        String(body.externalUrl || ''),
        String(body.downloadUrl || ''),
        String(body.image || body.imageUrl || ''),
        isFree,
        Number(body.price ?? 0) || 0,
        body.isActive === false ? 0 : 1,
        nowIso(),
        nowIso()
      )
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM resources WHERE id = ?').bind(id).first<Row>())!;
    return c.json(serializeResource(row), 201);
  });

  router.put('/:id', requireAdmin, async (c) => {
    const id = c.req.param('id');
    const body = await readJson(c);
    const fields: Record<string, unknown> = {};
    if (body.title !== undefined) fields.title = String(body.title).trim();
    if (body.author !== undefined) fields.author = String(body.author);
    if (body.description !== undefined) fields.description = String(body.description);
    if (body.type !== undefined && ['book', 'devotional', 'guide', 'article', 'podcast'].includes(String(body.type))) fields.type = body.type;
    if (body.category !== undefined) fields.category = String(body.category);
    if (body.fileUrl !== undefined) fields.file_url = String(body.fileUrl);
    if (body.externalUrl !== undefined) fields.external_url = String(body.externalUrl);
    if (body.downloadUrl !== undefined) fields.download_url = String(body.downloadUrl);
    if (body.image !== undefined || body.imageUrl !== undefined) fields.image = String(body.image ?? body.imageUrl);
    if (body.isFree !== undefined) fields.is_free = body.isFree === true ? 1 : 0;
    else if (body.free !== undefined) fields.is_free = body.free === true ? 1 : 0;
    if (body.price !== undefined) fields.price = Number(body.price) || 0;
    if (body.isActive !== undefined) fields.is_active = body.isActive === true ? 1 : 0;
    const upd = updateRow('resources', fields, 'id = ?', [id]);
    if (upd) await c.env.DB.prepare(upd.sql).bind(...upd.params).run();
    const row = await c.env.DB.prepare('SELECT * FROM resources WHERE id = ?').bind(id).first<Row>();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeResource(row));
  });

  router.delete('/:id', requireAdmin, async (c) => {
    await c.env.DB.prepare('DELETE FROM resources WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ message: 'Resource removed' });
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const settingsRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  const serializeSettings = (row: Row) => {
    const api = intToBool(toApi(row), [
      'allow_newsletter',
      'allow_registration',
      'moderate_reviews',
      'moderate_testimonials',
      'maintenance_mode',
      'pay_stripe',
      'pay_paypal',
      'pay_paystack',
      'pay_flutterwave',
    ]);
    api.paymentMethods = {
      stripe: api.payStripe !== false,
      paypal: api.payPaypal === true,
      paystack: api.payStack !== false,
      flutterwave: api.payFlutterwave !== false,
    };
    delete api.payStripe;
    delete api.payPaypal;
    delete api.payStack;
    delete api.payFlutterwave;
    return api;
  };

  const getOrCreate = async (c: Context<{ Bindings: Env }>): Promise<Row> => {
    let row = await c.env.DB.prepare('SELECT * FROM site_settings WHERE id = 1').first<Row>();
    if (!row) {
      await c.env.DB.prepare(
        `INSERT INTO site_settings (id, site_name, tagline, site_url, description, theme_mode, primary_color, accent_color,
          allow_newsletter, allow_registration, moderate_reviews, moderate_testimonials, maintenance_mode,
          pay_stripe, pay_paypal, pay_paystack, pay_flutterwave, updated_at)
         VALUES (1, 'The Time Is Now', 'Bold faith for today''s generation', 'https://thetimeisnow.org', '', 'default', '#7c3aed', '#fbbf24',
           1, 0, 1, 1, 0, 1, 0, 1, 1, ?)`
      )
        .bind(nowIso())
        .run();
      row = (await c.env.DB.prepare('SELECT * FROM site_settings WHERE id = 1').first<Row>())!;
    }
    return row;
  };

  router.get('/', async (c) => {
    const row = await getOrCreate(c);
    return c.json(serializeSettings(row));
  });

  router.put('/', requireAdmin, async (c) => {
    await getOrCreate(c);
    const body = await readJson(c);
    const fields: Record<string, unknown> = {};
    const textFields: [string, string][] = [
      ['siteName', 'site_name'],
      ['tagline', 'tagline'],
      ['siteUrl', 'site_url'],
      ['description', 'description'],
      ['logoUrl', 'logo_url'],
      ['faviconUrl', 'favicon_url'],
      ['themeMode', 'theme_mode'],
      ['primaryColor', 'primary_color'],
      ['accentColor', 'accent_color'],
      ['seoTitle', 'seo_title'],
      ['seoDescription', 'seo_description'],
      ['socialTwitter', 'social_twitter'],
      ['socialInstagram', 'social_instagram'],
      ['socialYoutube', 'social_youtube'],
      ['socialTiktok', 'social_tiktok'],
      ['emailFrom', 'email_from'],
      ['smtpHost', 'smtp_host'],
      ['smtpPort', 'smtp_port'],
    ];
    for (const [key, col] of textFields) {
      if (body[key] !== undefined) fields[col] = String(body[key]);
    }
    for (const key of ['allowNewsletter', 'allowRegistration', 'moderateReviews', 'moderateTestimonials', 'maintenanceMode']) {
      if (body[key] !== undefined) fields[key.replace(/([A-Z])/g, '_$1').toLowerCase()] = body[key] === true ? 1 : 0;
    }
    const pm = body.paymentMethods as Record<string, unknown> | undefined;
    if (pm) {
      if (pm.stripe !== undefined) fields.pay_stripe = pm.stripe === true ? 1 : 0;
      if (pm.paypal !== undefined) fields.pay_paypal = pm.paypal === true ? 1 : 0;
      if (pm.paystack !== undefined) fields.pay_paystack = pm.paystack === true ? 1 : 0;
      if (pm.flutterwave !== undefined) fields.pay_flutterwave = pm.flutterwave === true ? 1 : 0;
    }
    const cols = Object.keys(fields);
    if (cols.length > 0) {
      await c.env.DB.prepare(`UPDATE site_settings SET ${cols.map((k) => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = 1`)
        .bind(...cols.map((k) => fields[k]), nowIso())
        .run();
    }
    const row = await getOrCreate(c);
    return c.json(serializeSettings(row));
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export const searchRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.get('/', async (c) => {
    const q = new URL(c.req.url).searchParams;
    const term = (q.get('q') || '').trim();
    if (!term || term.length < 2) return c.json({ products: [], resources: [], testimonies: [] });

    const search = searchGroup(term, ['x']);
    void search;
    const like = `%${term.toLowerCase()}%`;
    const [products, resources, testimonies] = await Promise.all([
      c.env.DB
        .prepare("SELECT * FROM products WHERE is_active = 1 AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?) LIMIT 10")
        .bind(like, like)
        .all<Row>(),
      c.env.DB
        .prepare("SELECT * FROM resources WHERE is_active = 1 AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?) LIMIT 10")
        .bind(like, like)
        .all<Row>(),
      c.env.DB
        .prepare("SELECT * FROM testimonies WHERE is_approved = 1 AND (LOWER(text) LIKE ? OR LOWER(name) LIKE ?) LIMIT 10")
        .bind(like, like)
        .all<Row>(),
    ]);

    return c.json({
      products: (products.results || []).map((r) => serializeProduct(r)),
      resources: (resources.results || []).map(serializeResource),
      testimonies: (testimonies.results || []).map(serializeTestimonyRow),
    });
  });

  return router;
};

const serializeTestimonyRow = (row: Row) => intToBool(toApi(row), ['is_approved', 'is_featured']);

/* ------------------------------------------------------------------ */
/* Countries (movement stats)                                          */
/* ------------------------------------------------------------------ */

export const countryRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();
  const countries = [
    { code: 'CA', name: 'Canada', preachers: 8 },
    { code: 'US', name: 'United States', preachers: 15 },
    { code: 'GB', name: 'United Kingdom', preachers: 12 },
    { code: 'AU', name: 'Australia', preachers: 6 },
    { code: 'NG', name: 'Nigeria', preachers: 18 },
    { code: 'HU', name: 'Hungary', preachers: 4 },
    { code: 'GH', name: 'Ghana', preachers: 10 },
    { code: 'KE', name: 'Kenya', preachers: 9 },
    { code: 'SZ', name: 'Eswatini', preachers: 3 },
    { code: 'ID', name: 'Indonesia', preachers: 7 },
    { code: 'IL', name: 'Israel', preachers: 5 },
    { code: 'IN', name: 'India', preachers: 11 },
    { code: 'BI', name: 'Burundi', preachers: 2 },
    { code: 'CM', name: 'Cameroon', preachers: 4 },
    { code: 'PL', name: 'Poland', preachers: 3 },
    { code: 'ES', name: 'Spain', preachers: 5 },
  ];
  router.get('/', (c) => c.json(countries));
  return router;
};

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export const analyticsRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.post('/', trackLimiter, async (c) => {
    const body = await readJson(c);
    const category = String(body.category || '');
    const action = String(body.action || '');
    if (!category || !action) return c.json({ message: 'category and action are required' }, 400);
    await c.env.DB.prepare('INSERT INTO analytics_events (id, category, action, label, value, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(newId(), category, action, String(body.label || ''), Number(body.value ?? 0) || 0, nowIso())
      .run();
    return c.json({ success: true }, 201);
  });

  router.get('/timeseries', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const days = Math.min(parseInt(q.get('days') || '', 10) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const { results } = await c.env.DB
      .prepare(
        `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count
         FROM analytics_events WHERE created_at >= ? GROUP BY day ORDER BY day ASC`
      )
      .bind(since)
      .all<{ day: string; count: number }>();
    return c.json((results || []).map((r) => ({ date: r.day, count: r.count })));
  });

  router.get('/dashboard', requireAdmin, async (c) => {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const [views, subscribers, testimonies, downloads] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) AS n FROM analytics_events WHERE category = 'page' AND created_at >= ?")
        .bind(since)
        .first<{ n: number }>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE active = 1').first<{ n: number }>(),
      c.env.DB.prepare('SELECT COUNT(*) AS n FROM testimonies WHERE is_approved = 1').first<{ n: number }>(),
      c.env.DB.prepare('SELECT COALESCE(SUM(download_count), 0) AS n FROM resources').first<{ n: number }>(),
    ]);
    return c.json({
      totalViews: views?.n || 0,
      totalSubscribers: subscribers?.n || 0,
      totalTestimonials: testimonies?.n || 0,
      totalDownloads: downloads?.n || 0,
    });
  });

  return router;
};

void isEmail;
void paginateQuery;
