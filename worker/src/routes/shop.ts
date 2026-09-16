/**
 * Shop routes: products (catalog + admin CRUD + stock), orders (checkout,
 * reservations, admin pipeline), and product reviews (moderation).
 */
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, Row } from '../types';
import { intToBool, parseJsonField, readJson, toApi } from '../types';
import { insertRow, newId, orderBy, paginateQuery, parsePageParams, searchGroup, updateRow } from '../db';
import { nowIso } from '../util';
import { getAuthUser, requireAdmin, requireAuth } from '../middleware';
import { sendEmail, wrapHtml } from '../email';
import { issueOrderDownloads, markOrderRefunded, releaseStaleOrders } from '../fulfillment';

type App = Hono<{ Bindings: Env }>;

/* ------------------------------------------------------------------ */
/* Serialization                                                       */
/* ------------------------------------------------------------------ */

export const serializeProduct = (row: Row): Row => {
  const api = intToBool(toApi(row), ['is_active']);
  return {
    ...api,
    images: parseJsonField<string[]>(row.images, []),
    sizes: parseJsonField<string[]>(row.sizes, []),
    colors: parseJsonField<string[]>(row.colors, []),
  };
};

const serializeOrder = (row: Row, productNames?: Map<string, { name: string; images: string[] } | undefined>): Row => {
  const api = toApi(row);
  const items = parseJsonField<Row[]>(row.items, []).map((item) => {
    const productId = String(item.product ?? item.productId ?? '');
    const product = productNames?.get(productId);
    return {
      ...item,
      product: product ? { _id: productId, id: productId, name: product.name, images: product.images } : productId,
    };
  });
  return { ...api, items };
};

const serializeReview = (row: Row): Row => intToBool(toApi(row), ['approved', 'rejected']);

const ratingsFor = async (db: D1Database, productIds: string[]) => {
  const map = new Map<string, { averageRating: number; reviewCount: number }>();
  if (productIds.length === 0) return map;
  const placeholders = productIds.map(() => '?').join(',');
  const { results } = await db
    .prepare(
      `SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS count
       FROM reviews WHERE approved = 1 AND product_id IN (${placeholders}) GROUP BY product_id`
    )
    .bind(...productIds)
    .all<{ product_id: string; avg_rating: number; count: number }>();
  for (const r of results || []) {
    map.set(r.product_id, { averageRating: Math.round((r.avg_rating || 0) * 10) / 10, reviewCount: r.count || 0 });
  }
  return map;
};

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export const productRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  const productFilters = (q: URLSearchParams, admin: boolean) => {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (!admin) clauses.push('is_active = 1');
    const category = q.get('category');
    if (category && category !== 'all') {
      clauses.push('category = ?');
      params.push(category);
    }
    const isActive = q.get('isActive');
    if (admin && isActive !== null && isActive !== undefined && isActive !== '') {
      clauses.push('is_active = ?');
      params.push(isActive === 'true' ? 1 : 0);
    }
    const minPrice = q.get('minPrice');
    if (minPrice !== null && minPrice !== '') {
      clauses.push('price >= ?');
      params.push(Number(minPrice));
    }
    const maxPrice = q.get('maxPrice');
    if (maxPrice !== null && maxPrice !== '') {
      clauses.push('price <= ?');
      params.push(Number(maxPrice));
    }
    if (q.get('inStock') === 'true') clauses.push('stock > 0');
    const search = searchGroup(q.get('search') || '', ['name', 'description', 'tag']);
    if (search.sql) {
      clauses.push(search.sql);
      params.push(...search.params);
    }
    return { sql: clauses.join(' AND '), params };
  };

  router.get('/', async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const where = productFilters(q, false);
    const order = orderBy(q, { price: 'price', createdAt: 'created_at', name: 'name' }, 'created_at DESC');
    const result = await paginateQuery(c.env.DB, where, 'SELECT * FROM products', order, page, limit, offset);
    const ratings = await ratingsFor(c.env.DB, result.data.map((r) => String(r.id)));
    const data = result.data.map((row) => ({
      ...serializeProduct(row),
      averageRating: ratings.get(String(row.id))?.averageRating ?? 0,
      reviewCount: ratings.get(String(row.id))?.reviewCount ?? 0,
    }));
    return c.json({ success: true, data, pagination: result.pagination });
  });

  router.get('/admin/all', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const where = productFilters(q, true);
    const order = orderBy(
      q,
      { price: 'price', createdAt: 'created_at', name: 'name', stock: 'stock' },
      'created_at DESC'
    );
    const result = await paginateQuery(c.env.DB, where, 'SELECT * FROM products', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeProduct), pagination: result.pagination });
  });

  router.get('/:id/stock', async (c) => {
    const row = await c.env.DB.prepare('SELECT stock FROM products WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json({ stock: row.stock });
  });

  router.post('/:id/subscribe-stock', async (c) => {
    const body = await readJson(c);
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) return c.json({ message: 'Email required' }, 400);
    const productId = c.req.param('id');
    const product = await c.env.DB.prepare('SELECT id FROM products WHERE id = ?').bind(productId).first();
    if (!product) return c.json({ message: 'Not found' }, 404);
    await c.env.DB.prepare(
      'INSERT INTO back_in_stock (id, product_id, email, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(product_id, email) DO NOTHING'
    )
      .bind(newId(), productId, email, nowIso())
      .run();
    return c.json({ message: 'Subscribed', sub: { product: productId, email } });
  });

  router.post('/bulk-delete', requireAdmin, async (c) => {
    const { ids } = await c.req.json<{ ids?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).bind(...ids).run();
    return c.json({ message: 'Products deleted', deletedCount: res.meta.changes });
  });

  router.post('/bulk-update-status', requireAdmin, async (c) => {
    const { ids, isActive } = await c.req.json<{ ids?: unknown; isActive?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    if (typeof isActive !== 'boolean') return c.json({ message: 'isActive boolean required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`UPDATE products SET is_active = ?, updated_at = ? WHERE id IN (${placeholders})`)
      .bind(isActive ? 1 : 0, nowIso(), ...ids)
      .run();
    return c.json({ message: 'Products updated', modifiedCount: res.meta.changes });
  });

  router.get('/:id', async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'Not found' }, 404);
    const ratings = await ratingsFor(c.env.DB, [String(row.id)]);
    return c.json({
      ...serializeProduct(row),
      averageRating: ratings.get(String(row.id))?.averageRating ?? 0,
      reviewCount: ratings.get(String(row.id))?.reviewCount ?? 0,
    });
  });

  router.post('/', requireAdmin, async (c) => {
    const body = await readJson(c);
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();
    const price = Number(body.price);
    const category = String(body.category || '');
    if (!name || !description || Number.isNaN(price) || price < 0 || !['merch', 'digital'].includes(category)) {
      return c.json({ message: 'Validation failed' }, 400);
    }
    const id = newId();
    await c.env.DB.prepare(
      `INSERT INTO products (id, name, description, price, category, images, tag, stock, is_active, download_url, sizes, colors, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        name,
        description,
        price,
        category,
        JSON.stringify(Array.isArray(body.images) ? body.images : []),
        String(body.tag || ''),
        Number(body.stock ?? 0) || 0,
        body.isActive === false ? 0 : 1,
        String(body.downloadUrl || ''),
        JSON.stringify(Array.isArray(body.sizes) ? body.sizes : []),
        JSON.stringify(Array.isArray(body.colors) ? body.colors : []),
        nowIso(),
        nowIso()
      )
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first())!;
    return c.json(serializeProduct(row), 201);
  });

  router.put('/:id', requireAdmin, async (c) => {
    const id = c.req.param('id');
    const body = await readJson(c);
    const prev = await c.env.DB.prepare('SELECT id, name, stock FROM products WHERE id = ?').bind(id).first();
    if (!prev) return c.json({ message: 'Not found' }, 404);

    const fields: Record<string, unknown> = {};
    if (body.name !== undefined) fields.name = String(body.name).trim();
    if (body.description !== undefined) fields.description = String(body.description);
    if (body.price !== undefined) fields.price = Number(body.price);
    if (body.category !== undefined && ['merch', 'digital'].includes(String(body.category))) fields.category = body.category;
    if (body.images !== undefined) fields.images = JSON.stringify(Array.isArray(body.images) ? body.images : []);
    if (body.tag !== undefined) fields.tag = String(body.tag);
    if (body.stock !== undefined) fields.stock = Number(body.stock) || 0;
    if (body.isActive !== undefined) fields.is_active = body.isActive === true || body.isActive === 1 ? 1 : 0;
    if (body.downloadUrl !== undefined) fields.download_url = String(body.downloadUrl);
    if (body.sizes !== undefined) fields.sizes = JSON.stringify(Array.isArray(body.sizes) ? body.sizes : []);
    if (body.colors !== undefined) fields.colors = JSON.stringify(Array.isArray(body.colors) ? body.colors : []);

    const upd = updateRow('products', fields, 'id = ?', [id]);
    if (upd) await c.env.DB.prepare(upd.sql).bind(...upd.params).run();

    // Back-in-stock notifications when inventory increases.
    const newRow = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    try {
      const prevStock = Number(prev.stock ?? 0);
      const newStock = Number(newRow?.stock ?? 0);
      if (newStock > prevStock) {
        const { results: subs } = await c.env.DB.prepare('SELECT email FROM back_in_stock WHERE product_id = ?')
          .bind(id)
          .all<{ email: string }>();
        for (const s of subs || []) {
          void sendEmail(c.env, {
            to: s.email,
            subject: `${newRow?.name} is back in stock!`,
            text: `${newRow?.name} is back in stock. Visit the store to purchase: ${c.env.CLIENT_URL}/shop`,
            html: `<p>${newRow?.name} is back in stock. <a href="${c.env.CLIENT_URL}/shop">Buy now</a></p>`,
          });
        }
        if ((subs || []).length > 0) {
          await c.env.DB.prepare('DELETE FROM back_in_stock WHERE product_id = ?').bind(id).run();
        }
      }
    } catch (e) {
      console.warn('Back-in-stock notification failed', e);
    }

    return c.json(serializeProduct(newRow!));
  });

  // Stock-only update (was missing in the old API — the admin UI calls it).
  router.patch('/:id/stock', requireAdmin, async (c) => {
    const id = c.req.param('id');
    const body = await readJson(c);
    const qty = body.quantity !== undefined ? Number(body.quantity) : body.stock !== undefined ? Number(body.stock) : undefined;
    if (qty === undefined || Number.isNaN(qty) || qty < 0) return c.json({ message: 'Valid quantity required' }, 400);
    const res = await c.env.DB.prepare('UPDATE products SET stock = ?, updated_at = ? WHERE id = ?')
      .bind(Math.floor(qty), nowIso(), id)
      .run();
    if (res.meta.changes === 0) return c.json({ message: 'Not found' }, 404);
    return c.json({ stock: Math.floor(qty) });
  });

  router.delete('/:id', requireAdmin, async (c) => {
    await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ message: 'Product removed' });
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

export const orderRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  const loadProductNames = async (db: D1Database, orders: Row[]) => {
    const ids = new Set<string>();
    for (const o of orders) {
      for (const item of parseJsonField<Row[]>(o.items, [])) {
        const pid = String(item.product ?? item.productId ?? '');
        if (pid) ids.add(pid);
      }
    }
    const map = new Map<string, { name: string; images: string[] } | undefined>();
    if (ids.size === 0) return map;
    const placeholders = Array.from(ids).map(() => '?').join(',');
    const { results } = await db
      .prepare(`SELECT id, name, images FROM products WHERE id IN (${placeholders})`)
      .bind(...Array.from(ids))
      .all<{ id: string; name: string; images: string }>();
    for (const r of results || []) {
      map.set(r.id, { name: r.name, images: parseJsonField<string[]>(r.images, []) });
    }
    return map;
  };

  // Reserve stock atomically; returns null + failure message when short.
  const reserveStock = async (db: D1Database, items: Row[]) => {
    const reserved: { product: string; quantity: number }[] = [];
    for (const item of items) {
      const productId = String(item.product ?? item.productId ?? '');
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const res = await db
        .prepare('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ? AND is_active = 1 AND stock >= ?')
        .bind(quantity, nowIso(), productId, quantity)
        .run();
      if (res.meta.changes === 0) {
        // roll back what we took
        for (const r of reserved) {
          await db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').bind(r.quantity, r.product).run();
        }
        return { error: `${String(item.name || 'Item')} only has insufficient stock` };
      }
      reserved.push({ product: productId, quantity });
    }
    return { reserved };
  };

  const createOrder = async (c: Context<{ Bindings: Env }>, opts: { items: Row[]; customerName: string; customerEmail: string; totalAmount: number; shippingAddress?: unknown; paymentMethod?: string; idempotencyKey?: string | null; userId?: string | null; currency?: string }) => {
    const id = newId();
    await c.env.DB.prepare(
      `INSERT INTO orders (id, user_id, customer_name, customer_email, items, total_amount, status, payment_method, payment_id, idempotency_key, shipping_address, currency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, '', ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        opts.userId ?? null,
        opts.customerName,
        opts.customerEmail,
        JSON.stringify(opts.items),
        opts.totalAmount,
        opts.paymentMethod || '',
        opts.idempotencyKey ?? null,
        opts.shippingAddress ? JSON.stringify(opts.shippingAddress) : null,
        (opts.currency || 'USD').toUpperCase(),
        nowIso(),
        nowIso()
      )
      .run();

    void sendEmail(c.env, {
      to: opts.customerEmail,
      subject: `Order received — ${id}`,
      text: `Thanks for your order ${opts.customerName}. Your order ${id} has been received and is pending payment confirmation.`,
      html: wrapHtml(
        'Order received',
        `<p>Thanks for your order, <strong>${opts.customerName}</strong>.</p>
         <p>Your order <strong>${id}</strong> has been received and is pending payment confirmation.</p>
         <p><strong>Total:</strong> ${Number(opts.totalAmount).toFixed(2)} ${(opts.currency || 'USD').toUpperCase()}</p>
         <p style="color:#71717a;font-size:14px;">You can check its status any time with our order lookup.</p>`,
        { label: 'Track my order', url: `${c.env.CLIENT_URL}/order-lookup` }
      ),
    });

    const row = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
    return serializeOrder(row!);
  };

  router.get('/', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const clauses: string[] = [];
    const params: unknown[] = [];
    const status = q.get('status');
    if (status && status !== 'all') {
      clauses.push('status = ?');
      params.push(status);
    }
    const startDate = q.get('startDate');
    if (startDate) {
      clauses.push('created_at >= ?');
      params.push(new Date(startDate).toISOString());
    }
    const endDate = q.get('endDate');
    if (endDate) {
      clauses.push('created_at <= ?');
      params.push(new Date(endDate).toISOString());
    }
    const search = searchGroup(q.get('search') || '', ['customer_name', 'customer_email']);
    if (search.sql) {
      clauses.push(search.sql);
      params.push(...search.params);
    }
    const order = orderBy(q, { createdAt: 'created_at', totalAmount: 'total_amount', status: 'status' }, 'created_at DESC');
    const result = await paginateQuery(c.env.DB, { sql: clauses.join(' AND '), params }, 'SELECT * FROM orders', order, page, limit, offset);
    const names = await loadProductNames(c.env.DB, result.data);
    return c.json({ success: true, data: result.data.map((r) => serializeOrder(r, names)), pagination: result.pagination });
  });

  // Guest order lookup: email + order id (proof of knowledge of both).
  router.post('/lookup', async (c) => {
    const body = await readJson(c);
    const email = String(body.email || '').trim().toLowerCase();
    const orderId = String(body.orderId || '').trim();
    if (!email || !orderId) return c.json({ message: 'Email and order ID are required' }, 400);
    const row = await c.env.DB.prepare('SELECT * FROM orders WHERE (id = ? OR idempotency_key = ?) AND customer_email = ?')
      .bind(orderId, orderId, email)
      .first();
    if (!row) return c.json({ message: 'No order found for that email and order ID' }, 404);
    const names = await loadProductNames(c.env.DB, [row]);
    const order = serializeOrder(row, names) as Record<string, unknown>;
    // Only expose what a customer needs — not internal payment ids.
    return c.json({
      id: order.id,
      _id: order._id,
      status: order.status,
      refundedAt: order.refundedAt ?? null,
      items: order.items,
      totalAmount: order.totalAmount,
      currency: order.currency ?? 'USD',
      customerName: order.customerName,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  });

  // Secure digital-product download (token from the payment-received email).
  router.get('/downloads/:token', async (c) => {
    const token = c.req.param('token');
    const dl = await c.env.DB.prepare('SELECT * FROM order_downloads WHERE token = ?').bind(token).first<Row>();
    if (!dl) return c.json({ message: 'Invalid download link' }, 404);
    if (Number(dl.expires_at) < Date.now()) return c.json({ message: 'This download link has expired. Please contact support.' }, 410);
    if (Number(dl.download_count) >= Number(dl.max_downloads)) {
      return c.json({ message: 'Download limit reached. Please contact support.' }, 429);
    }
    const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(String(dl.product_id)).first<Row>();
    if (!product || !product.download_url) return c.json({ message: 'This product no longer has a file available' }, 404);

    await c.env.DB.prepare('UPDATE order_downloads SET download_count = download_count + 1 WHERE token = ?').bind(token).run();
    const url = String(product.download_url);
    const target = url.startsWith('http') || url.startsWith('/api') ? url : `${c.env.CLIENT_URL}${url}`;
    return c.redirect(target, 302);
  });

  // Admin: release stock held by abandoned pending orders.
  router.post('/admin/release-stale', requireAdmin, async (c) => {
    const body: Record<string, unknown> = await readJson(c).catch(() => ({}));
    const maxAgeHours = Math.min(24 * 30, Math.max(1, Number(body.maxAgeHours) || 24));
    const result = await releaseStaleOrders(c.env.DB, maxAgeHours * 3600 * 1000);
    return c.json({ message: `Released ${result.released} stale order(s)`, ...result });
  });

  router.get('/my-orders', requireAuth, async (c) => {
    const user = c.get('user')!;
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { createdAt: 'created_at', totalAmount: 'total_amount' }, 'created_at DESC');
    const result = await paginateQuery(
      c.env.DB,
      { sql: 'user_id = ?', params: [user.id] },
      'SELECT * FROM orders',
      order,
      page,
      limit,
      offset
    );
    const names = await loadProductNames(c.env.DB, result.data);
    return c.json({ success: true, data: result.data.map((r) => serializeOrder(r, names)), pagination: result.pagination });
  });

  router.post('/checkout', async (c) => {
    const body = await readJson(c);
    const idempotencyKey = c.req.header('x-idempotency-key') || null;
    if (idempotencyKey) {
      const existing = await c.env.DB.prepare('SELECT * FROM orders WHERE idempotency_key = ?').bind(idempotencyKey).first();
      if (existing) return c.json(serializeOrder(existing));
    }
    const items = Array.isArray(body.items) ? (body.items as Row[]) : [];
    const customerName = String(body.customerName || '').trim();
    const customerEmail = String(body.customerEmail || '').trim().toLowerCase();
    const totalAmount = Number(body.totalAmount);
    if (!items.length || !customerName || !customerEmail || Number.isNaN(totalAmount)) {
      return c.json({ message: 'Missing required order fields' }, 400);
    }

    const reservation = await reserveStock(c.env.DB, items);
    if ('error' in reservation) return c.json({ message: reservation.error }, 400);

    const user = await getAuthUserSafe(c);
    const order = await createOrder(c, {
      items,
      customerName,
      customerEmail,
      totalAmount,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod ? String(body.paymentMethod) : '',
      idempotencyKey,
      userId: user?.id ?? null,
      currency: body.currency ? String(body.currency) : 'USD',
    });

    return c.json(
      {
        ...order,
        orderId: order._id,
        sessionId: `order_${order._id}`,
        url: `${c.env.CLIENT_URL}/order-success?order=${order._id}`,
      },
      201
    );
  });

  router.post('/', async (c) => {
    const body = await readJson(c);
    const items = Array.isArray(body.items) ? (body.items as Row[]) : [];
    const customerName = String(body.customerName || '').trim();
    const customerEmail = String(body.customerEmail || '').trim().toLowerCase();
    const totalAmount = Number(body.totalAmount);
    if (!customerName || !customerEmail || !items.length || Number.isNaN(totalAmount)) {
      return c.json({ message: 'Missing required order fields' }, 400);
    }
    const reservation = await reserveStock(c.env.DB, items);
    if ('error' in reservation) return c.json({ message: reservation.error }, 400);
    const user = await getAuthUserSafe(c);
    const order = await createOrder(c, {
      items,
      customerName,
      customerEmail,
      totalAmount,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod ? String(body.paymentMethod) : '',
      userId: user?.id ?? null,
      currency: body.currency ? String(body.currency) : 'USD',
    });
    return c.json(order, 201);
  });

  router.post('/checkout-session', requireAuth, async (c) => {
    const body = await readJson(c);
    const items = Array.isArray(body.items) ? (body.items as Row[]) : [];
    const currency = String(body.currency || 'usd').toLowerCase();
    const successUrl = String(body.successUrl || `${c.env.CLIENT_URL}/order-success`);
    const cancelUrl = String(body.cancelUrl || c.env.CLIENT_URL);
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ sessionId: `dev_${Date.now()}`, url: successUrl, message: 'Stripe dev mode' });
    }
    const form = new URLSearchParams();
    form.set('mode', 'payment');
    form.set('success_url', successUrl);
    form.set('cancel_url', cancelUrl);
    if (body.orderId) form.set('client_reference_id', String(body.orderId));
    items.forEach((item, i) => {
      form.set(`line_items[${i}][price_data][currency]`, currency);
      form.set(`line_items[${i}][price_data][product_data][name]`, String(item.name || 'Item'));
      form.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(Number(item.price || 0) * 100)));
      form.set(`line_items[${i}][quantity]`, String(Math.max(1, Number(item.quantity) || 1)));
    });
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
    const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
    if (!res.ok) return c.json({ message: data.error?.message || 'Stripe checkout session failed' }, 500);
    return c.json({ sessionId: data.id, url: data.url });
  });

  router.post('/bulk-update-status', requireAdmin, async (c) => {
    const { ids, status } = await c.req.json<{ ids?: unknown; status?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of order IDs required' }, 400);
    if (!status || !VALID_ORDER_STATUSES.includes(String(status))) return c.json({ message: 'Status is required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`UPDATE orders SET status = ?, updated_at = ? WHERE id IN (${placeholders})`)
      .bind(status, nowIso(), ...ids)
      .run();
    return c.json({ message: 'Orders updated', modifiedCount: res.meta.changes });
  });

  router.get('/:id', requireAuth, async (c) => {
    const user = c.get('user')!;
    const row = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'Not found' }, 404);
    // Fix from the legacy API: a user may only read their own order; admins read any.
    if (user.role !== 'admin' && row.user_id && row.user_id !== user.id) {
      return c.json({ message: 'Not authorized' }, 403);
    }
    const names = await loadProductNames(c.env.DB, [row]);
    return c.json(serializeOrder(row, names));
  });

  const updateStatus = async (c: Context<{ Bindings: Env }>) => {
    const id = c.req.param('id');
    const body = await readJson(c);
    const status = String(body.status || '');
    if (!VALID_ORDER_STATUSES.includes(status)) return c.json({ message: 'Invalid status' }, 400);
    const row = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
    if (!row) return c.json({ message: 'Not found' }, 404);

    await c.env.DB.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').bind(status, nowIso(), id).run();

    if (status === 'cancelled') {
      // Release reserved stock back.
      for (const item of parseJsonField<Row[]>(row.items, [])) {
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        await c.env.DB.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').bind(qty, String(item.product)).run();
      }
    }

    // Manual completion (e.g. bank transfer confirmed): issue digital downloads
    // too. Token creation is idempotent, so webhook + manual never duplicate.
    if (status === 'completed') {
      await issueOrderDownloads(c.env, row);
    }

    if (['shipped', 'delivered', 'cancelled'].includes(status)) {
      const subject =
        status === 'shipped'
          ? `Your order ${id} is on the way`
          : status === 'delivered'
            ? `Your order ${id} has been delivered`
            : `Your order ${id} has been cancelled`;
      void sendEmail(c.env, {
        to: String(row.customer_email),
        subject,
        text: `Hi ${row.customer_name},\n\nYour order ${id} status has been updated to ${status}.`,
        html: `<p>Hi ${row.customer_name},</p><p>Your order <strong>${id}</strong> status has been updated to <strong>${status}</strong>.</p>`,
      });
    }

    const updated = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
    return c.json(serializeOrder(updated!));
  };

  router.put('/:id/status', requireAdmin, updateStatus);
  router.patch('/:id/status', requireAdmin, updateStatus);

  // Admin: refund an order. Stripe refunds go through the API when the order
  // was paid by card via Stripe; every path restores stock and emails the buyer.
  router.post('/:id/refund', requireAdmin, async (c) => {
    const id = String(c.req.param('id'));
    const row = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first<Row>();
    if (!row) return c.json({ message: 'Order not found' }, 404);
    if (row.refunded_at) return c.json({ message: 'Order has already been refunded' }, 400);
    if (row.status === 'pending') {
      return c.json({ message: 'Order was never paid — cancel it instead' }, 400);
    }

    let stripeRefundId = '';
    if (row.payment_method === 'stripe' && c.env.STRIPE_SECRET_KEY && row.payment_id) {
      try {
        // payment_id may be a PaymentIntent or Checkout Session id.
        const res = await fetch('https://api.stripe.com/v1/refunds', {
          method: 'POST',
          headers: { Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ payment_intent: String(row.payment_id) }).toString(),
        });
        const data = (await res.json()) as { id?: string; error?: { message?: string } };
        if (res.ok && data.id) {
          stripeRefundId = data.id;
        } else {
          // Session ids need resolving to a payment_intent first.
          const session = await fetch(
            `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(String(row.payment_id))}`,
            { headers: { Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}` } }
          );
          const sessionData = (await session.json()) as { payment_intent?: string };
          if (sessionData.payment_intent) {
            const retry = await fetch('https://api.stripe.com/v1/refunds', {
              method: 'POST',
              headers: { Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ payment_intent: sessionData.payment_intent }).toString(),
            });
            const retryData = (await retry.json()) as { id?: string; error?: { message?: string } };
            if (!retry.ok) return c.json({ message: retryData.error?.message || 'Stripe refund failed' }, 502);
            stripeRefundId = retryData.id || 'stripe';
          } else {
            return c.json({ message: data.error?.message || 'Stripe refund failed' }, 502);
          }
        }
      } catch (e) {
        return c.json({ message: e instanceof Error ? e.message : 'Stripe refund failed' }, 502);
      }
    }

    const updated = await markOrderRefunded(c.env, id, stripeRefundId);
    if (!updated) return c.json({ message: 'Order not found' }, 404);
    return c.json({ message: 'Refund issued', order: serializeOrder(updated) });
  });

  // Legacy compat endpoint (orders never had stock; kept so old clients don't 404).
  router.patch('/:id/stock', requireAdmin, async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'Order not found' }, 404);
    return c.json(serializeOrder(row));
  });

  return router;
};

const getAuthUserSafe = async (c: { req: { header: (k: string) => string | undefined }; env: Env }) =>
  getAuthUser(c as never);

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export const reviewRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.get('/product/:productId', async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { createdAt: 'created_at', rating: 'rating' }, 'created_at DESC');
    const result = await paginateQuery(
      c.env.DB,
      { sql: 'product_id = ? AND approved = 1', params: [c.req.param('productId')] },
      'SELECT * FROM reviews',
      order,
      page,
      limit,
      offset
    );
    return c.json({ success: true, data: result.data.map(serializeReview), pagination: result.pagination });
  });

  router.post('/product/:productId', async (c) => {
    const productId = c.req.param('productId');
    const body = await readJson(c);
    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5) return c.json({ message: 'Rating is required (1-5)' }, 400);
    const product = await c.env.DB.prepare('SELECT id FROM products WHERE id = ?').bind(productId).first();
    if (!product) return c.json({ message: 'Product not found' }, 404);
    const id = newId();
    await c.env.DB.prepare(
      'INSERT INTO reviews (id, product_id, name, email, rating, title, body, approved, rejected, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)'
    )
      .bind(
        id,
        productId,
        body.name ? String(body.name) : null,
        body.email ? String(body.email).toLowerCase() : null,
        rating,
        body.title ? String(body.title) : null,
        body.body ? String(body.body) : null,
        nowIso()
      )
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first())!;
    return c.json(serializeReview(row), 201);
  });

  const adminFilters = (q: URLSearchParams) => {
    const clauses: string[] = [];
    const params: unknown[] = [];
    const approved = q.get('approved');
    if (approved !== null && approved !== '') {
      clauses.push('approved = ?');
      params.push(approved === 'true' ? 1 : 0);
    }
    const product = q.get('product');
    if (product) {
      clauses.push('product_id = ?');
      params.push(product);
    }
    const rating = q.get('rating');
    if (rating) {
      clauses.push('rating = ?');
      params.push(Number(rating));
    }
    return { sql: clauses.join(' AND '), params };
  };

  router.get('/', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { createdAt: 'created_at', rating: 'rating' }, 'created_at DESC');
    const select = 'SELECT reviews.*, products.name AS product_name FROM reviews LEFT JOIN products ON products.id = reviews.product_id';
    const result = await paginateQuery(c.env.DB, adminFilters(q), select, order, page, limit, offset);
    const data = result.data.map((row) => {
      const api = serializeReview(row);
      if (row.product_name) api.product = { _id: row.product_id, name: row.product_name };
      return api;
    });
    return c.json({ success: true, data, pagination: result.pagination });
  });

  router.post('/bulk-approve', requireAdmin, async (c) => {
    const { ids } = await c.req.json<{ ids?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`UPDATE reviews SET approved = 1, rejected = 0 WHERE id IN (${placeholders})`)
      .bind(...ids)
      .run();
    return c.json({ message: 'Reviews approved', modifiedCount: res.meta.changes });
  });

  // Fixed: reject used to DELETE reviews (old bulk-reject) or 404 (single reject
  // route didn't exist). The admin UI filters on a `rejected` flag, so we set it.
  const rejectOne = async (c: Context<{ Bindings: Env }>) => {
    const id = c.req.param('id');
    const res = await c.env.DB.prepare('UPDATE reviews SET approved = 0, rejected = 1 WHERE id = ?').bind(id).run();
    if (res.meta.changes === 0) return c.json({ message: 'Not found' }, 404);
    const row = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();
    return c.json(serializeReview(row!));
  };
  router.post('/:id/reject', requireAdmin, rejectOne);

  router.post('/bulk-reject', requireAdmin, async (c) => {
    const { ids } = await c.req.json<{ ids?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`UPDATE reviews SET approved = 0, rejected = 1 WHERE id IN (${placeholders})`)
      .bind(...ids)
      .run();
    return c.json({ message: 'Reviews rejected', modifiedCount: res.meta.changes });
  });

  router.post('/:id/approve', requireAdmin, async (c) => {
    const id = c.req.param('id');
    const res = await c.env.DB.prepare('UPDATE reviews SET approved = 1, rejected = 0 WHERE id = ?').bind(id).run();
    if (res.meta.changes === 0) return c.json({ message: 'Not found' }, 404);
    const row = await c.env.DB.prepare('SELECT * FROM reviews WHERE id = ?').bind(id).first();
    return c.json(serializeReview(row!));
  });

  router.delete('/:id', requireAdmin, async (c) => {
    await c.env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ message: 'Deleted' });
  });

  return router;
};

void insertRow;
