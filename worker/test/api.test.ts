/**
 * Worker API integration tests — run against the real worker code with a local
 * D1 (schema + seed applied in beforeAll), exercising the critical user
 * journeys end-to-end: auth, contact inbox, shop checkout → digital delivery →
 * refund, donations, and stale-stock release.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { env, SELF } from 'cloudflare:test';
// Raw SQL inlined at transform time (workerd has no node:fs).
import schemaSql from '../schema.sql?raw';
import seedSql from '../seed.sql?raw';

/* ------------------------------------------------------------------ */
/* Tiny cookie-jar fetch client (mirrors how the SPA talks to the API)  */
/* ------------------------------------------------------------------ */

class Client {
  private cookies = new Map<string, string>();

  private cookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  private storeCookies(res: Response) {
    const raw = res.headers.getSetCookie?.() ?? [];
    for (const line of raw) {
      const [pair] = line.split(';');
      const eq = pair.indexOf('=');
      if (eq > 0) this.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }

  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers as HeadersInit | undefined);
    if (this.cookies.size) headers.set('cookie', this.cookieHeader());
    const res = await SELF.fetch(`http://localhost${path}`, { ...init, headers });
    this.storeCookies(res);
    return res;
  }

  async json<T = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<{ status: number; body: T }> {
    const res = await this.fetch(path, init);
    return { status: res.status, body: (await res.json()) as T };
  }

  /** Fetch a CSRF token (sets the session cookie), then run a mutating call. */
  async mutate<T = Record<string, unknown>>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<{ status: number; body: T }> {
    const { body: csrfBody } = await this.json<{ csrfToken: string }>('/api/auth/csrf-token');
    const token = (csrfBody as { csrfToken: string }).csrfToken;
    return this.json<T>(path, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      body: body === undefined ? '{}' : JSON.stringify(body),
    });
  }
}

/* ------------------------------------------------------------------ */
/* Schema + seed bootstrap                                             */
/* ------------------------------------------------------------------ */

const runSql = async (sql: string) => {
  const statements = sql
    .replace(/^--.*$/gm, '') // strip comments BEFORE splitting (some contain ';')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^PRAGMA/i.test(s));
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
};

beforeAll(async () => {
  await runSql(schemaSql as string);
  await runSql(seedSql as string);
});

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

describe('health & catalog', () => {
  it('reports healthy with the database connected', async () => {
    const { status, body } = await new Client().json<{ status: string; database: string }>('/api/health');
    expect(status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
  });

  it('lists seeded products publicly', async () => {
    const { status, body } = await new Client().json<{ success: boolean; data: unknown[] }>(
      '/api/products?limit=5'
    );
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('returns the video feed and countries', async () => {
    const feed = await new Client().fetch('/api/videos/feed');
    expect(feed.status).toBe(200);
    const countries = await new Client().json<unknown[]>('/api/countries');
    expect(Array.isArray(countries.body)).toBe(true);
  });
});

describe('member auth journey', () => {
  const client = new Client();

  it('registers a new member (dev mode returns the verification link)', async () => {
    const { status, body } = await client.mutate<{ user: { email: string; emailVerified: boolean }; verificationUrl?: string }>(
      'POST',
      '/api/auth/register',
      { name: 'Test Member', email: 'member@test.dev', password: 'Password1!' }
    );
    expect(status).toBe(201);
    expect(body.user.email).toBe('member@test.dev');
    expect(body.user.emailVerified).toBe(false);
    // Dev mode (no RESEND_API_KEY) returns the URL; production never would.
    expect(body.verificationUrl).toContain('/verify-email?token=');
  });

  it('logs in and reads the profile', async () => {
    const login = await client.mutate<{ user: { email: string; role: string } }>('POST', '/api/auth/login', {
      email: 'member@test.dev',
      password: 'Password1!',
    });
    expect(login.status).toBe(200);
    expect(login.body.user.role).toBe('user');

    const profile = await client.json<{ email: string }>('/api/auth/profile');
    expect(profile.status).toBe(200);
    expect(profile.body.email).toBe('member@test.dev');
  });

  it('changes the password with the current one and re-logs in', async () => {
    const change = await client.mutate<{ message: string }>('POST', '/api/auth/change-password', {
      currentPassword: 'Password1!',
      newPassword: 'Password2!',
    });
    expect(change.status).toBe(200);

    await client.mutate('POST', '/api/auth/logout');
    const relogin = await client.mutate<{ user: { email: string } }>('POST', '/api/auth/login', {
      email: 'member@test.dev',
      password: 'Password2!',
    });
    expect(relogin.status).toBe(200);
  });

  it('rejects the wrong current password', async () => {
    const bad = await client.mutate<{ message: string }>('POST', '/api/auth/change-password', {
      currentPassword: 'WrongPass1!',
      newPassword: 'Password3!',
    });
    expect(bad.status).toBe(401);
  });
});

describe('contact inbox', () => {
  it('accepts a contact message and exposes it to admins only', async () => {
    const visitor = new Client();
    const submit = await visitor.mutate<{ message: string }>('POST', '/api/contact', {
      name: 'Visitor',
      email: 'visitor@test.dev',
      message: 'I want to know more about the movement.',
    });
    expect(submit.status).toBe(201);

    // Anonymous users cannot read the inbox.
    const anon = await visitor.json('/api/contact');
    expect(anon.status).toBe(401);

    // Admins can, with search + unread count.
    const admin = new Client();
    await admin.mutate('POST', '/api/auth/login', {
      email: 'admin@thetimeisnow.com',
      password: 'Admin123!',
    });
    const list = await admin.json<{ data: { email: string; isRead: boolean }[]; unreadCount: number }>(
      '/api/contact?search=visitor'
    );
    expect(list.status).toBe(200);
    expect(list.body.unreadCount).toBeGreaterThanOrEqual(1);
    expect(list.body.data[0].email).toBe('visitor@test.dev');
    expect(list.body.data[0].isRead).toBe(false);
  });
});

describe('shop: checkout → digital delivery → refund', () => {
  const buyer = new Client();
  const admin = new Client();
  let orderId = '';
  let downloadToken = '';

  beforeAll(async () => {
    await admin.mutate('POST', '/api/auth/login', {
      email: 'admin@thetimeisnow.com',
      password: 'Admin123!',
    });
  });

  it('reserves stock at checkout and records the order', async () => {
    const before = await new Client().json<{ stock: number }>(
      '/api/products/650a1b2c3d4e5f6a7b8c9d01/stock'
    );
    const checkout = await buyer.mutate<{ id: string; orderId: string }>('POST', '/api/orders/checkout', {
      customerName: 'Buyer',
      customerEmail: 'buyer@test.dev',
      items: [
        { product: '650a1b2c3d4e5f6a7b8c9d01', name: 'UNASHAMED Classic Tee', quantity: 2, price: 28 },
        { product: '650a1b2c3d4e5f6a7b8c9d11', name: '30-Day Bold Faith Devotional', quantity: 1, price: 0 },
      ],
      totalAmount: 56,
      paymentMethod: 'stripe',
      currency: 'NGN',
    });
    expect(checkout.status).toBe(201);
    orderId = checkout.body.id;

    const after = await new Client().json<{ stock: number }>(
      '/api/products/650a1b2c3d4e5f6a7b8c9d01/stock'
    );
    expect(before.body.stock - after.body.stock).toBe(2);
  });

  it('guest order lookup finds the order by email + id', async () => {
    const found = await new Client().mutate<{ id: string; status: string; currency: string }>(
      'POST',
      '/api/orders/lookup',
      { email: 'buyer@test.dev', orderId }
    );
    expect(found.status).toBe(200);
    expect(found.body.id).toBe(orderId);
    expect(found.body.currency).toBe('NGN');

    const wrongEmail = await new Client().mutate('POST', '/api/orders/lookup', {
      email: 'someoneelse@test.dev',
      orderId,
    });
    expect(wrongEmail.status).toBe(404);
  });

  it('completing the order issues a secure digital download token', async () => {
    const done = await admin.mutate<{ order: { status: string } }>(
      'PATCH',
      `/api/orders/${orderId}/status`,
      { status: 'completed' }
    );
    expect(done.status).toBe(200);

    const row = await env.DB.prepare('SELECT token FROM order_downloads WHERE order_id = ?').bind(orderId).first();
    expect(row).not.toBeNull();
    downloadToken = String(row!.token);

    // redirect: 'manual' — fetch would otherwise follow the 302 into the
    // worker's 404 (the SPA host, not the worker, serves /resources).
    const download = await new Client().fetch(`/api/orders/downloads/${downloadToken}`, {
      redirect: 'manual',
    });
    expect(download.status).toBe(302);
    expect(download.headers.get('location')).toContain('/resources');

    const bogus = await new Client().fetch('/api/orders/downloads/not-a-real-token');
    expect(bogus.status).toBe(404);
  });

  it('refunds the order: restores stock and marks refunded', async () => {
    const stockBefore = await new Client().json<{ stock: number }>(
      '/api/products/650a1b2c3d4e5f6a7b8c9d01/stock'
    );
    const refund = await admin.mutate<{ message: string; order: { status: string; refundedAt: string | null } }>(
      'POST',
      `/api/orders/${orderId}/refund`
    );
    expect(refund.status).toBe(200);
    expect(refund.body.order.status).toBe('cancelled');
    expect(refund.body.order.refundedAt).toBeTruthy();

    const stockAfter = await new Client().json<{ stock: number }>(
      '/api/products/650a1b2c3d4e5f6a7b8c9d01/stock'
    );
    expect(stockAfter.body.stock - stockBefore.body.stock).toBe(2);

    // Double refund is rejected.
    const again = await admin.mutate('POST', `/api/orders/${orderId}/refund`);
    expect(again.status).toBe(400);
  });
});

describe('donations', () => {
  const admin = new Client();

  beforeAll(async () => {
    await admin.mutate('POST', '/api/auth/login', {
      email: 'admin@thetimeisnow.com',
      password: 'Admin123!',
    });
  });

  it('creates a dev-mode checkout for any provider and tracks stats', async () => {
    const donor = new Client();
    const checkout = await donor.mutate<{ url: string; donationId: string; devMode?: boolean }>(
      'POST',
      '/api/donations/checkout',
      { amount: 25000, email: 'donor@test.dev', donorName: 'Donor', currency: 'NGN', paymentMethod: 'paystack' }
    );
    expect(checkout.status).toBe(200);
    expect(checkout.body.devMode).toBe(true);
    expect(checkout.body.url).toContain('status=success');

    const stats = await admin.json<{ donationCount: number; pendingCount: number }>(
      '/api/donations/stats/summary'
    );
    expect(stats.status).toBe(200);
    expect(stats.body.donationCount).toBeGreaterThanOrEqual(1);
    expect(stats.body.pendingCount).toBeGreaterThanOrEqual(1);
  });

  it('admin can mark a donation completed (issues receipt path)', async () => {
    const list = await admin.json<{ data: { id: string; status: string }[] }>(
      '/api/donations?limit=5'
    );
    const pending = list.body.data.find((d) => d.status === 'pending');
    expect(pending).toBeDefined();
    const done = await admin.mutate<{ status: string }>(
      'PATCH',
      `/api/donations/${pending!.id}/status`,
      { status: 'completed' }
    );
    expect(done.status).toBe(200);
    expect((done.body as { status: string }).status).toBe('completed');
  });
});

describe('stale order release', () => {
  it('releases stock from old pending orders', async () => {
    // Create an order that will be "stale" by backdating it.
    const client = new Client();
    const checkout = await client.mutate<{ id: string }>('POST', '/api/orders/checkout', {
      customerName: 'Ghost',
      customerEmail: 'ghost@test.dev',
      items: [{ product: '650a1b2c3d4e5f6a7b8c9d01', name: 'UNASHAMED Classic Tee', quantity: 1, price: 28 }],
      totalAmount: 28,
    });
    expect(checkout.status).toBe(201);
    await env.DB.prepare("UPDATE orders SET created_at = '2020-01-01T00:00:00.000Z' WHERE id = ?")
      .bind(checkout.body.id)
      .run();

    const stockBefore = await new Client().json<{ stock: number }>(
      '/api/products/650a1b2c3d4e5f6a7b8c9d01/stock'
    );

    const admin = new Client();
    await admin.mutate('POST', '/api/auth/login', {
      email: 'admin@thetimeisnow.com',
      password: 'Admin123!',
    });
    const release = await admin.mutate<{ released: number }>(
      'POST',
      '/api/orders/admin/release-stale',
      { maxAgeHours: 24 }
    );
    expect(release.status).toBe(200);
    expect(release.body.released).toBeGreaterThanOrEqual(1);

    const stockAfter = await new Client().json<{ stock: number }>(
      '/api/products/650a1b2c3d4e5f6a7b8c9d01/stock'
    );
    expect(stockAfter.body.stock - stockBefore.body.stock).toBe(1);
  });
});
