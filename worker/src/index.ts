/**
 * TTIN API — Cloudflare Worker entry point.
 * Stack: Hono · D1 (database) · KV (rate limiting) · R2 (media).
 *
 * Full replacement for the legacy Express/MongoDB server with identical
 * response shapes (plus fixes for endpoints the frontend called but the old
 * API never implemented).
 */
import { Hono } from 'hono';
import type { Env } from './types';
import { corsHeaders } from './middleware';
import { authRoutes } from './routes/auth';
import { orderRoutes, productRoutes, reviewRoutes } from './routes/shop';
import {
  contactRoutes,
  donationRoutes,
  eventRoutes,
  newsletterRoutes,
  testimonyRoutes,
} from './routes/community';
import {
  analyticsRoutes,
  contentRoutes,
  countryRoutes,
  resourceRoutes,
  searchRoutes,
  settingsRoutes,
  videoRoutes,
} from './routes/content';
import { paymentRoutes } from './routes/payments';
import { uploadRoutes } from './routes/uploads';
import { releaseStaleOrders } from './fulfillment';

const app = new Hono<{ Bindings: Env }>();

/* CORS (only applies to direct cross-origin calls; the Vercel proxy is same-origin). */
app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    const headers = corsHeaders(c);
    return new Response(null, { status: 204, headers });
  }
  await next();
  const headers = corsHeaders(c);
  for (const [k, v] of Object.entries(headers)) c.res.headers.set(k, v);
});

/* Security headers on every API response. */
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.res.headers.set('X-Frame-Options', 'DENY');
});

/* Routes */
app.route('/api/auth', authRoutes());
app.route('/api/testimonies', testimonyRoutes());
app.route('/api/products', productRoutes());
app.route('/api/orders', orderRoutes());
app.route('/api/events', eventRoutes());
app.route('/api/resources', resourceRoutes());
app.route('/api/videos', videoRoutes());
app.route('/api/donations', donationRoutes());
app.route('/api/newsletter', newsletterRoutes());
app.route('/api/contact', contactRoutes());
app.route('/api/analytics', analyticsRoutes());
app.route('/api/payments', paymentRoutes());
app.route('/api/search', searchRoutes());
app.route('/api/countries', countryRoutes());
app.route('/api/content', contentRoutes());
app.route('/api/reviews', reviewRoutes());
app.route('/api/uploads', uploadRoutes());
app.route('/api/settings', settingsRoutes());

app.get('/api/health', async (c) => {
  let database = 'disconnected';
  try {
    await c.env.DB.prepare('SELECT 1').first();
    database = 'connected';
  } catch {
    /* D1 unreachable */
  }
  return c.json({ status: 'ok', message: 'TTIN API is running', database });
});

/* A friendly landing for the API root. */
app.get('/', (c) =>
  c.json({
    name: 'TTIN API',
    stack: 'Cloudflare Workers + D1 + KV + R2',
    health: '/api/health',
  })
);

/* 404 for unknown API paths. */
app.notFound((c) => c.json({ message: 'Not found' }, 404));

/* Global error handler — never leak stack traces to clients. */
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ message: 'Something went wrong!' }, 500);
});

/**
 * Scheduled handler (cron trigger, hourly): releases stock held by orders that
 * were created but never paid, so abandoned checkouts don't drain inventory.
 */
export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledController, env: Env, ctx: ExecutionContext) => {
    const cutoffHours = 24;
    ctx.waitUntil(
      releaseStaleOrders(env.DB, cutoffHours * 3600 * 1000)
        .then(({ released }) => {
          if (released > 0) console.log(`[cron] released stock for ${released} stale order(s)`);
        })
        .catch((e) => console.warn('[cron] stale order release failed', e))
    );
  },
};
