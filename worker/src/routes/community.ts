/**
 * Community routes: testimonies, contact, newsletter, donations, events.
 */
import { Hono } from 'hono';
import type { Env, Row } from '../types';
import { intToBool, readJson, toApi } from '../types';
import { newId, orderBy, paginateQuery, parsePageParams, searchGroup, updateRow } from '../db';
import { isEmail, nowIso } from '../util';
import { contactLimiter, newsletterLimiter, requireAdmin, csrfProtection } from '../middleware';
import { sendEmail, wrapHtml } from '../email';

type App = Hono<{ Bindings: Env }>;

/* ------------------------------------------------------------------ */
/* Testimonies                                                         */
/* ------------------------------------------------------------------ */

const serializeTestimony = (row: Row) => intToBool(toApi(row), ['is_approved', 'is_featured']);

export const testimonyRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  const filters = (q: URLSearchParams, publicOnly: boolean) => {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (publicOnly) clauses.push('is_approved = 1');
    const category = q.get('category');
    if (category && category !== 'All') {
      clauses.push('category = ?');
      params.push(category);
    }
    const isApproved = q.get('isApproved');
    if (!publicOnly && isApproved !== null && isApproved !== undefined && isApproved !== '') {
      clauses.push('is_approved = ?');
      params.push(isApproved === 'true' ? 1 : 0);
    }
    const search = searchGroup(q.get('search') || '', ['name', 'text', 'location']);
    if (search.sql) {
      clauses.push(search.sql);
      params.push(...search.params);
    }
    return { sql: clauses.join(' AND '), params };
  };

  router.get('/', async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { createdAt: 'created_at', category: 'category' }, 'created_at DESC');
    const result = await paginateQuery(c.env.DB, filters(q, true), 'SELECT * FROM testimonies', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeTestimony), pagination: result.pagination });
  });

  router.get('/manage/all', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { createdAt: 'created_at', category: 'category' }, 'created_at DESC');
    const result = await paginateQuery(c.env.DB, filters(q, false), 'SELECT * FROM testimonies', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeTestimony), pagination: result.pagination });
  });

  router.post('/bulk-approve', requireAdmin, async (c) => {
    const { ids } = await c.req.json<{ ids?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`UPDATE testimonies SET is_approved = 1, updated_at = ? WHERE id IN (${placeholders})`)
      .bind(nowIso(), ...ids)
      .run();
    return c.json({ message: 'Testimonies approved', modifiedCount: res.meta.changes });
  });

  router.post('/bulk-reject', requireAdmin, async (c) => {
    const { ids } = await c.req.json<{ ids?: unknown }>();
    if (!Array.isArray(ids) || ids.length === 0) return c.json({ message: 'Array of IDs required' }, 400);
    const placeholders = ids.map(() => '?').join(',');
    const res = await c.env.DB.prepare(`DELETE FROM testimonies WHERE id IN (${placeholders})`).bind(...ids).run();
    return c.json({ message: 'Testimonies rejected', deletedCount: res.meta.changes });
  });

  router.get('/:id', async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM testimonies WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeTestimony(row));
  });

  router.post('/', async (c) => {
    const body = await readJson(c);
    const name = String(body.name || '').trim();
    const location = String(body.location || '').trim();
    const text = String(body.text || body.content || '').trim();
    const category = String(body.category || 'Other');
    if (!name || !location || !text) {
      return c.json({ message: 'Name, location and testimony text are required' }, 400);
    }
    const id = newId();
    await c.env.DB.prepare(
      'INSERT INTO testimonies (id, name, location, text, category, image, is_approved, is_featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)'
    )
      .bind(id, name, location, text, category, String(body.image || ''), nowIso(), nowIso())
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM testimonies WHERE id = ?').bind(id).first())!;
    return c.json(serializeTestimony(row), 201);
  });

  router.put('/:id', requireAdmin, async (c) => {
    const id = c.req.param('id');
    const body = await readJson(c);
    const fields: Record<string, unknown> = {};
    if (body.name !== undefined) fields.name = String(body.name).trim();
    if (body.location !== undefined) fields.location = String(body.location).trim();
    if (body.text !== undefined || body.content !== undefined) fields.text = String(body.text ?? body.content);
    if (body.category !== undefined) fields.category = String(body.category);
    if (body.image !== undefined) fields.image = String(body.image);
    if (body.isApproved !== undefined) fields.is_approved = body.isApproved === true ? 1 : 0;
    if (body.isFeatured !== undefined) fields.is_featured = body.isFeatured === true ? 1 : 0;
    const upd = updateRow('testimonies', fields, 'id = ?', [id]);
    if (upd) await c.env.DB.prepare(upd.sql).bind(...upd.params).run();
    const row = await c.env.DB.prepare('SELECT * FROM testimonies WHERE id = ?').bind(id).first();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeTestimony(row));
  });

  router.delete('/:id', requireAdmin, async (c) => {
    await c.env.DB.prepare('DELETE FROM testimonies WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ message: 'Testimony removed' });
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export const contactRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.post('/', contactLimiter, csrfProtection, async (c) => {
    const body = await readJson(c);
    // Honeypot: bots fill every field they see.
    if (body.website) return c.json({ message: 'Spam detected' }, 400);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const message = String(body.message || '').trim();
    if (!name || !isEmail(email) || !message) {
      return c.json({ message: 'Name, email, and message are required' }, 400);
    }
    const id = newId();
    await c.env.DB.prepare('INSERT INTO contacts (id, name, email, message, ip, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, name, email, message, c.req.header('cf-connecting-ip') || '', c.req.header('user-agent') || '', nowIso())
      .run();

    // Notify the team so messages never sit unseen (best-effort).
    const teamEmail = c.env.CONTACT_NOTIFICATION_EMAIL || '';
    if (teamEmail) {
      void sendEmail(c.env, {
        to: teamEmail,
        replyTo: email,
        subject: `New contact message from ${name}`,
        text: `${name} <${email}> wrote:\n\n${message}`,
        html: wrapHtml(
          `New contact message`,
          `<p><strong>${name}</strong> &lt;${email}&gt; wrote:</p><blockquote style="border-left:3px solid #7c3aed;margin:0;padding-left:16px;color:#3f3f46;">${message}</blockquote>`,
          { label: 'Open the admin inbox', url: `${c.env.CLIENT_URL}/admin/contacts` }
        ),
      });
    }
    return c.json({ message: 'Message received', id }, 201);
  });

  router.post('/spam-check', contactLimiter, csrfProtection, async (c) => {
    const body = await readJson(c);
    return c.json({ isSpam: Boolean(body.website || body.honeypot) });
  });

  /* ------------------- Admin inbox ------------------- */

  router.get('/', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const clauses: string[] = [];
    const params: unknown[] = [];
    const isRead = q.get('isRead');
    if (isRead !== null && isRead !== '') {
      clauses.push('is_read = ?');
      params.push(isRead === 'true' ? 1 : 0);
    }
    const search = searchGroup(q.get('search') || '', ['name', 'email', 'message']);
    if (search.sql) {
      clauses.push(search.sql);
      params.push(...search.params);
    }
    const order = orderBy(q, { createdAt: 'created_at' }, 'created_at DESC');
    const result = await paginateQuery(
      c.env.DB,
      { sql: clauses.join(' AND '), params },
      'SELECT * FROM contacts',
      order,
      page,
      limit,
      offset
    );
    const unread = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM contacts WHERE is_read = 0').first<{ n: number }>();
    return c.json({
      success: true,
      data: result.data.map((row) => intToBool(toApi(row), ['is_read'])),
      pagination: result.pagination,
      unreadCount: unread?.n || 0,
    });
  });

  router.patch('/:id/read', requireAdmin, csrfProtection, async (c) => {
    const body = await readJson(c);
    const isRead = body.isRead === false ? 0 : 1;
    const res = await c.env.DB.prepare('UPDATE contacts SET is_read = ? WHERE id = ?')
      .bind(isRead, c.req.param('id'))
      .run();
    if (res.meta.changes === 0) return c.json({ message: 'Not found' }, 404);
    const row = await c.env.DB.prepare('SELECT * FROM contacts WHERE id = ?').bind(c.req.param('id')).first();
    return c.json(intToBool(toApi(row!), ['is_read']));
  });

  router.delete('/:id', requireAdmin, csrfProtection, async (c) => {
    await c.env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ message: 'Message deleted' });
  });

  // Reply to a contact message by email (sent from the admin inbox).
  router.post('/:id/reply', requireAdmin, csrfProtection, async (c) => {
    const body = await readJson(c);
    const reply = String(body.reply || '').trim();
    if (!reply) return c.json({ message: 'Reply text is required' }, 400);
    const row = await c.env.DB.prepare('SELECT * FROM contacts WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'Not found' }, 404);

    const result = await sendEmail(c.env, {
      to: String(row.email),
      replyTo: c.env.CONTACT_NOTIFICATION_EMAIL || undefined,
      subject: `Re: your message to The Time Is Now`,
      text: `Hi ${row.name},\n\n${reply}\n\n— The Time Is Now team`,
      html: wrapHtml(
        `Hi ${row.name},`,
        `<p>${reply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</p>
         <p style="color:#71717a;font-size:14px;">— The Time Is Now team</p>
         <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;"/>
         <p style="font-size:13px;color:#a1a1aa;">You wrote:</p>
         <blockquote style="border-left:3px solid #e4e4e7;margin:0;padding-left:16px;color:#71717a;font-size:14px;">${String(row.message).replace(/</g, '&lt;')}</blockquote>`
      ),
    });
    if (!result.ok && c.env.RESEND_API_KEY) {
      return c.json({ message: 'Reply email failed to send — please try again' }, 502);
    }
    await c.env.DB.prepare('UPDATE contacts SET is_read = 1 WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ message: 'Reply sent' });
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

const serializeSubscriber = (row: Row) => intToBool(toApi(row), ['active']);

export const newsletterRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  // Fixed: now returns the paginated envelope the admin table expects.
  router.get('/', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const clauses: string[] = [];
    const params: unknown[] = [];
    const active = q.get('active');
    if (active !== null && active !== '') {
      clauses.push('active = ?');
      params.push(active === 'true' ? 1 : 0);
    }
    const search = searchGroup(q.get('search') || '', ['email']);
    if (search.sql) {
      clauses.push(search.sql);
      params.push(...search.params);
    }
    const order = orderBy(q, { createdAt: 'created_at' }, 'created_at DESC');
    const result = await paginateQuery(c.env.DB, { sql: clauses.join(' AND '), params }, 'SELECT * FROM newsletter_subscribers', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeSubscriber), pagination: result.pagination });
  });

  router.post('/subscribe', newsletterLimiter, async (c) => {
    const body = await readJson(c);
    const email = String(body.email || '').trim().toLowerCase();
    if (!isEmail(email)) return c.json({ message: 'Valid email is required' }, 400);

    const existing = await c.env.DB.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').bind(email).first();
    if (existing) {
      if (existing.active === 1) return c.json({ message: 'Email already subscribed' }, 400);
      await c.env.DB.prepare('UPDATE newsletter_subscribers SET active = 1, updated_at = ? WHERE id = ?')
        .bind(nowIso(), existing.id)
        .run();
      const row = await c.env.DB.prepare('SELECT * FROM newsletter_subscribers WHERE id = ?').bind(existing.id).first();
      return c.json({ message: 'Subscribed successfully', subscriber: serializeSubscriber(row!) });
    }

    const id = newId();
    await c.env.DB.prepare('INSERT INTO newsletter_subscribers (id, email, active, created_at, updated_at) VALUES (?, ?, 1, ?, ?)')
      .bind(id, email, nowIso(), nowIso())
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM newsletter_subscribers WHERE id = ?').bind(id).first())!;
    return c.json({ message: 'Subscribed successfully', subscriber: serializeSubscriber(row) }, 201);
  });

  router.delete('/unsubscribe/:email', async (c) => {
    const email = c.req.param('email').toLowerCase();
    await c.env.DB.prepare('UPDATE newsletter_subscribers SET active = 0, updated_at = ? WHERE email = ?')
      .bind(nowIso(), email)
      .run();
    return c.json({ message: 'Unsubscribed successfully' });
  });

  // New endpoints the admin page calls.
  router.post('/import', requireAdmin, async (c) => {
    const body = await c.req.json<{ subscribers?: unknown }>().catch(() => ({}) as { subscribers?: unknown });
    const list = Array.isArray(body.subscribers) ? body.subscribers : [];
    let imported = 0;
    for (const entry of list) {
      const email = String((entry as Record<string, unknown>)?.email || '').trim().toLowerCase();
      if (!isEmail(email)) continue;
      const res = await c.env.DB.prepare(
        'INSERT INTO newsletter_subscribers (id, email, active, created_at, updated_at) VALUES (?, ?, 1, ?, ?) ON CONFLICT(email) DO NOTHING'
      )
        .bind(newId(), email, nowIso(), nowIso())
        .run();
      if (res.meta.changes > 0) imported += 1;
    }
    return c.json({ imported });
  });

  router.post('/bulk-unsubscribe', requireAdmin, async (c) => {
    const body = await c.req.json<{ emails?: unknown; ids?: unknown }>().catch(() => ({}) as { emails?: unknown; ids?: unknown });
    // Accept either emails or subscriber ids — the admin page sends ids.
    const emails = Array.isArray(body.emails) ? body.emails.map(String) : [];
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
    let modified = 0;
    if (emails.length > 0) {
      const placeholders = emails.map(() => '?').join(',');
      const res = await c.env.DB.prepare(`UPDATE newsletter_subscribers SET active = 0, updated_at = ? WHERE email IN (${placeholders})`)
        .bind(nowIso(), ...emails)
        .run();
      modified += res.meta.changes;
    }
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      const res = await c.env.DB.prepare(`UPDATE newsletter_subscribers SET active = 0, updated_at = ? WHERE id IN (${placeholders})`)
        .bind(nowIso(), ...ids)
        .run();
      modified += res.meta.changes;
    }
    return c.json({ message: 'Unsubscribed', modifiedCount: modified });
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Donations                                                           */
/* ------------------------------------------------------------------ */

const serializeDonation = (row: Row) => intToBool(toApi(row), ['is_anonymous']);

/** Email a donation receipt (best-effort). */
export const sendDonationReceipt = async (env: Env, row: Row): Promise<void> => {
  if (!row.donor_email) return;
  const amount = Number(row.amount || 0);
  const currency = String(row.currency || 'USD');
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  void sendEmail(env, {
    to: String(row.donor_email),
    subject: 'Your donation receipt — thank you',
    text: `Hi ${row.donor_name}, thank you for your ${fmt} gift to The Time Is Now (receipt ${row.id}). Your generosity helps us reach more people with the gospel.`,
    html: wrapHtml(
      'Thank you for your gift 💛',
      `<p>Hi <strong>${row.donor_name}</strong>,</p>
       <p>Thank you for your <strong>${fmt}</strong> gift to <strong>The Time Is Now</strong>.</p>
       <p><strong>Receipt no.:</strong> ${row.id}<br/>
          <strong>Date:</strong> ${String(row.created_at).slice(0, 10)}<br/>
          <strong>Method:</strong> ${String(row.payment_method || '—')}</p>
       <p>Your generosity helps us take the gospel to streets, campuses, and nations. If you need a formal receipt for your records, simply reply to this email.</p>`,
      { label: 'See what your gift does', url: `${env.CLIENT_URL}/about` }
    ),
  });
};

/**
 * Mark a donation paid/failed and send the receipt. Called by payment webhooks
 * — resolves the donation by id, payment provider reference, or payment_id.
 */
export const settleDonation = async (
  env: Env,
  opts: { refId: string; status: 'completed' | 'failed'; paymentId?: string }
): Promise<boolean> => {
  if (!opts.refId) return false;
  const row = await env.DB.prepare(
    'SELECT * FROM donations WHERE id = ? OR payment_id = ?'
  )
    .bind(opts.refId, opts.refId)
    .first<Row>();
  if (!row) return false;
  if (row.status === 'completed') return true; // idempotent

  await env.DB.prepare(
    'UPDATE donations SET status = ?, payment_id = COALESCE(NULLIF(?2, \'\'), payment_id), updated_at = ? WHERE id = ?'
  )
    .bind(opts.status, opts.paymentId || '', nowIso(), row.id)
    .run();

  if (opts.status === 'completed') await sendDonationReceipt(env, row);
  return true;
};

export const donationRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.get('/', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const order = orderBy(q, { createdAt: 'created_at', amount: 'amount' }, 'created_at DESC');
    const result = await paginateQuery(c.env.DB, { sql: '', params: [] }, 'SELECT * FROM donations', order, page, limit, offset);
    return c.json({ success: true, data: result.data.map(serializeDonation), pagination: result.pagination });
  });

  router.get('/:id', requireAdmin, async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM donations WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeDonation(row));
  });

  // Aggregates for the admin donations dashboard card.
  router.get('/stats/summary', requireAdmin, async (c) => {
    const totals = await c.env.DB.prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS raised_total,
         COALESCE(SUM(CASE WHEN status = 'completed' AND created_at >= ? THEN amount ELSE 0 END), 0) AS raised_this_month,
         COUNT(*) AS donation_count,
         COUNT(DISTINCT CASE WHEN donor_email != '' THEN donor_email END) AS donor_count,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count
       FROM donations`
    )
      .bind(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .first<Record<string, number>>();
    return c.json({
      raisedTotal: Number(totals?.raised_total || 0),
      raisedThisMonth: Number(totals?.raised_this_month || 0),
      donationCount: Number(totals?.donation_count || 0),
      donorCount: Number(totals?.donor_count || 0),
      pendingCount: Number(totals?.pending_count || 0),
    });
  });

  // Manual status correction (e.g. an offline/bank-transfer donation).
  router.patch('/:id/status', requireAdmin, csrfProtection, async (c) => {
    const body = await readJson(c);
    const status = String(body.status || '');
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return c.json({ message: 'Status must be pending, completed, or failed' }, 400);
    }
    const res = await c.env.DB.prepare('UPDATE donations SET status = ?, updated_at = ? WHERE id = ?')
      .bind(status, nowIso(), c.req.param('id'))
      .run();
    if (res.meta.changes === 0) return c.json({ message: 'Not found' }, 404);
    if (status === 'completed') {
      const row = await c.env.DB.prepare('SELECT * FROM donations WHERE id = ?').bind(c.req.param('id')).first<Row>();
      if (row) void sendDonationReceipt(c.env, row);
    }
    const row = await c.env.DB.prepare('SELECT * FROM donations WHERE id = ?').bind(c.req.param('id')).first();
    return c.json(serializeDonation(row!));
  });

  router.post('/', async (c) => {
    const body = await readJson(c);
    const amount = Number(body.amount);
    const type = String(body.type || 'one-time');
    if (Number.isNaN(amount) || amount < 1) return c.json({ message: 'Amount must be at least 1' }, 400);
    if (!['one-time', 'monthly'].includes(type)) return c.json({ message: 'Invalid donation type' }, 400);
    const donorEmail = body.donorEmail ? String(body.donorEmail).trim().toLowerCase() : '';
    if (donorEmail && !isEmail(donorEmail)) return c.json({ message: 'Valid donor email required' }, 400);

    const id = newId();
    await c.env.DB.prepare(
      `INSERT INTO donations (id, donor_name, donor_email, amount, currency, type, message, payment_method, payment_id, status, is_anonymous, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
    )
      .bind(
        id,
        body.donorName ? String(body.donorName) : 'Anonymous',
        donorEmail,
        amount,
        String(body.currency || 'USD'),
        type,
        String(body.message || ''),
        String(body.paymentMethod || ''),
        String(body.paymentId || ''),
        body.isAnonymous === true ? 1 : 0,
        nowIso(),
        nowIso()
      )
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM donations WHERE id = ?').bind(id).first())!;
    return c.json(serializeDonation(row), 201);
  });

  router.post('/checkout', async (c) => {
    const body = await readJson(c);
    const amount = Number(body.amount) || 10;
    const email = String(body.email || '').trim().toLowerCase();
    const method = String(body.paymentMethod || 'stripe');
    const currency = String(body.currency || 'USD').toUpperCase();
    const type = ['one-time', 'monthly'].includes(String(body.type)) ? String(body.type) : 'one-time';
    if (email && !isEmail(email)) return c.json({ message: 'Valid email required' }, 400);
    if (Number.isNaN(amount) || amount < 1) return c.json({ message: 'Amount must be at least 1' }, 400);
    if (!['paypal', 'stripe', 'paystack', 'flutterwave'].includes(method)) {
      return c.json({ message: 'Unsupported payment method' }, 400);
    }

    // Record the intent first so the donation appears in the admin list.
    const id = newId();
    await c.env.DB.prepare(
      `INSERT INTO donations (id, donor_name, donor_email, amount, currency, type, message, payment_method, payment_id, status, is_anonymous, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', 'pending', ?, ?, ?)`
    )
      .bind(
        id,
        String(body.donorName || body.name || 'Anonymous'),
        email,
        amount,
        currency,
        type,
        String(body.message || ''),
        method,
        body.isAnonymous === true ? 1 : 0,
        nowIso(),
        nowIso()
      )
      .run();

    const successUrl = `${c.env.CLIENT_URL}/donate?status=success&donation=${id}`;
    const cancelUrl = `${c.env.CLIENT_URL}/donate?status=cancelled`;

    // Dev mode (no keys): complete the flow locally.
    if (
      (method === 'paypal' && !(c.env.PAYPAL_CLIENT_ID && c.env.PAYPAL_CLIENT_SECRET)) ||
      (method === 'stripe' && !c.env.STRIPE_SECRET_KEY) ||
      (method === 'paystack' && !c.env.PAYSTACK_SECRET_KEY) ||
      (method === 'flutterwave' && !c.env.FLUTTERWAVE_SECRET_KEY)
    ) {
      return c.json({ sessionId: `dev_${Date.now()}`, url: successUrl, donationId: id, devMode: true });
    }

    try {
      if (method === 'stripe') {
        const form = new URLSearchParams();
        form.set('mode', 'payment');
        form.set('success_url', successUrl);
        form.set('cancel_url', cancelUrl);
        form.set('client_reference_id', id);
        form.set('customer_email', email || '');
        form.set('line_items[0][price_data][currency]', currency.toLowerCase());
        form.set('line_items[0][price_data][product_data][name]', 'Donation — The Time Is Now');
        form.set('line_items[0][price_data][unit_amount]', String(Math.round(amount * 100)));
        form.set('line_items[0][quantity]', '1');
        const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
        });
        const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
        if (!res.ok) return c.json({ message: data.error?.message || 'Donation checkout failed' }, 500);
        await c.env.DB.prepare('UPDATE donations SET payment_id = ? WHERE id = ?').bind(data.id || '', id).run();
        return c.json({ sessionId: data.id, url: data.url, donationId: id });
      }

      if (method === 'paystack') {
        // amount is in major units from the client → Paystack expects kobo/cents.
        const res = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: { Authorization: `Bearer ${c.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email || 'donor@thetimeisnow.org',
            amount: Math.round(amount * 100),
            currency,
            reference: id,
            callback_url: successUrl,
            metadata: { donationId: id, custom_fields: [{ display_name: 'Donation', variable_name: 'donation', value: 'TTIN donation' }] },
          }),
        });
        const data = (await res.json()) as { status?: boolean; data?: { authorization_url?: string }; message?: string };
        if (!res.ok || !data.status) return c.json({ message: data.message || 'Donation checkout failed' }, 500);
        return c.json({ sessionId: id, url: data.data?.authorization_url, donationId: id });
      }

      // flutterwave
      const res = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${c.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_ref: id,
          amount,
          currency,
          redirect_url: successUrl,
          customer: { email: email || 'donor@thetimeisnow.org', name: String(body.donorName || body.name || 'Donor') },
          customizations: { title: 'The Time Is Now', description: 'Donation' },
        }),
      });
      const data = (await res.json()) as { status?: string; data?: { link?: string }; message?: string };
      if (!res.ok || data.status !== 'success') return c.json({ message: data.message || 'Donation checkout failed' }, 500);
      return c.json({ sessionId: id, url: data.data?.link, donationId: id });
    } catch (e) {
      return c.json({ message: e instanceof Error ? e.message : 'Donation checkout failed' }, 500);
    }
  });

  router.get('/verify/:paymentIntentId', async (c) => {
    const ref = c.req.param('paymentIntentId');
    if (!c.env.STRIPE_SECRET_KEY) return c.json({ status: 'completed', amount: 0 });
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}` },
    });
    if (!res.ok) return c.json({ status: 'failed', amount: 0 });
    const session = (await res.json()) as { payment_status?: string; amount_total?: number };
    const status = session.payment_status === 'paid' ? 'completed' : 'pending';
    await c.env.DB.prepare('UPDATE donations SET status = ? WHERE payment_id = ?').bind(status, ref).run();
    return c.json({ status, amount: (session.amount_total || 0) / 100 });
  });

  return router;
};

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

const serializeEvent = (row: Row) => {
  const api = intToBool(toApi(row), ['is_active']);
  // Compat aliases the frontend uses.
  api.imageUrl = api.image;
  if (typeof api.date === 'string' && api.date) {
    api.upcoming = new Date(api.date).getTime() >= Date.now();
  }
  return api;
};

const VALID_EVENT_TYPES = ['conference', 'workshop', 'outreach', 'online', 'meetup'];

export const eventRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  router.get('/', async (c) => {
    const q = new URL(c.req.url).searchParams;
    const clauses = ['is_active = 1'];
    const params: unknown[] = [];
    const type = q.get('type');
    if (type && type !== 'all') {
      clauses.push('type = ?');
      params.push(type);
    }
    const order = orderBy(q, { date: 'date', createdAt: 'created_at' }, 'date ASC');
    const result = await paginateQuery(
      c.env.DB,
      { sql: clauses.join(' AND '), params },
      'SELECT * FROM events',
      order,
      1,
      100,
      0
    );
    // Events endpoint returns a plain array (pre-pagination contract).
    return c.json(result.data.map(serializeEvent));
  });

  router.post('/register', contactLimiter, async (c) => {
    const body = await readJson(c);
    const eventId = String(body.eventId || '');
    const attendeeName = String(body.attendeeName || body.name || '').trim();
    const attendeeEmail = String(body.attendeeEmail || body.email || '').trim().toLowerCase();
    if (!eventId) return c.json({ message: 'eventId is required' }, 400);
    if (!attendeeName || !isEmail(attendeeEmail)) {
      return c.json({ message: 'Attendee name and valid email are required' }, 400);
    }

    const event = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first();
    if (!event) return c.json({ message: 'Event not found' }, 404);
    if (Number(event.capacity) > 0 && Number(event.registered_count) >= Number(event.capacity)) {
      return c.json({ message: 'Event is full', waitlist: true }, 400);
    }

    const dup = await c.env.DB.prepare('SELECT id FROM event_registrations WHERE event_id = ? AND attendee_email = ?')
      .bind(eventId, attendeeEmail)
      .first();
    if (dup) return c.json({ message: 'You are already registered for this event' }, 400);

    const id = newId();
    await c.env.DB.prepare(
      'INSERT INTO event_registrations (id, event_id, attendee_name, attendee_email, created_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, eventId, attendeeName, attendeeEmail, nowIso())
      .run();
    await c.env.DB.prepare('UPDATE events SET registered_count = registered_count + 1, updated_at = ? WHERE id = ?')
      .bind(nowIso(), eventId)
      .run();

    void sendEmail(c.env, {
      to: attendeeEmail,
      subject: `Registration confirmed: ${event.title}`,
      text: `Hi ${attendeeName}, you are registered for ${event.title} on ${event.date} (${event.time}) at ${event.location}.`,
      html: `<p>Hi <strong>${attendeeName}</strong>,</p><p>You are registered for <strong>${event.title}</strong>.</p><p>📅 ${event.date} · ${event.time}<br/>📍 ${event.location}</p>`,
    });

    return c.json({ success: true, message: 'Registration successful', id });
  });

  router.get('/:id/registrations', async (c) => {
    const row = await c.env.DB.prepare('SELECT COUNT(*) AS count FROM event_registrations WHERE event_id = ?')
      .bind(c.req.param('id'))
      .first<{ count: number }>();
    return c.json({ count: row?.count || 0 });
  });

  router.get('/:id', async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeEvent(row));
  });

  router.post('/', requireAdmin, async (c) => {
    const body = await readJson(c);
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const date = String(body.date || '');
    if (!title || !description || !date || Number.isNaN(Date.parse(date))) {
      return c.json({ message: 'Validation failed' }, 400);
    }
    const type = String(body.type || 'conference');
    if (!VALID_EVENT_TYPES.includes(type)) return c.json({ message: 'Validation failed' }, 400);

    const id = newId();
    await c.env.DB.prepare(
      `INSERT INTO events (id, title, description, date, end_date, time, location, type, image, registration_url, is_active, capacity, registered_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
    )
      .bind(
        id,
        title,
        description,
        new Date(date).toISOString(),
        body.endDate ? new Date(String(body.endDate)).toISOString() : null,
        String(body.time || ''),
        String(body.location || ''),
        type,
        String(body.image || body.imageUrl || ''),
        String(body.registrationUrl || ''),
        body.isActive === false ? 0 : 1,
        Number(body.capacity ?? 0) || 0,
        nowIso(),
        nowIso()
      )
      .run();
    const row = (await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first())!;
    return c.json(serializeEvent(row), 201);
  });

  router.put('/:id', requireAdmin, async (c) => {
    const id = c.req.param('id');
    const body = await readJson(c);
    const fields: Record<string, unknown> = {};
    if (body.title !== undefined) fields.title = String(body.title).trim();
    if (body.description !== undefined) fields.description = String(body.description);
    if (body.date !== undefined) fields.date = new Date(String(body.date)).toISOString();
    if (body.endDate !== undefined) fields.end_date = body.endDate ? new Date(String(body.endDate)).toISOString() : null;
    if (body.time !== undefined) fields.time = String(body.time);
    if (body.location !== undefined) fields.location = String(body.location);
    if (body.type !== undefined && VALID_EVENT_TYPES.includes(String(body.type))) fields.type = body.type;
    if (body.image !== undefined || body.imageUrl !== undefined) fields.image = String(body.image ?? body.imageUrl);
    if (body.registrationUrl !== undefined) fields.registration_url = String(body.registrationUrl);
    if (body.isActive !== undefined) fields.is_active = body.isActive === true ? 1 : 0;
    if (body.capacity !== undefined) fields.capacity = Number(body.capacity) || 0;
    const upd = updateRow('events', fields, 'id = ?', [id]);
    if (upd) await c.env.DB.prepare(upd.sql).bind(...upd.params).run();
    const row = await c.env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first();
    if (!row) return c.json({ message: 'Not found' }, 404);
    return c.json(serializeEvent(row));
  });

  router.delete('/:id', requireAdmin, async (c) => {
    await c.env.DB.prepare('DELETE FROM event_registrations WHERE event_id = ?').bind(c.req.param('id')).run();
    await c.env.DB.prepare('DELETE FROM events WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ message: 'Event removed' });
  });

  return router;
};
