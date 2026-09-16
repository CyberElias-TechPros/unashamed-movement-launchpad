/**
 * Order fulfillment: everything that happens after money moves.
 *  - onOrderPaid: payment-received email + secure digital delivery tokens
 *  - refundOrder: stock restore, refunded_at bookkeeping, customer email
 *  - releaseStaleOrders: expire abandoned `pending` orders and free their stock
 *
 * Used by payment webhooks, admin routes, and the scheduled (cron) handler.
 */
import type { Env, Row } from './types';
import { parseJsonField } from './types';
import { nowIso, randomHex } from './util';
import { sendEmail, wrapHtml } from './email';

const DOWNLOAD_TTL_MS = 30 * 24 * 3600 * 1000; // 30 days
const MAX_DOWNLOADS = 10;

export interface DigitalLink {
  token: string;
  url: string;
  productName: string;
}

/** Create (idempotent) download tokens for every paid digital item on an order. */
export const issueOrderDownloads = async (env: Env, order: Row): Promise<DigitalLink[]> => {
  const items = parseJsonField<Row[]>(order.items, []);
  if (!items.length) return [];
  const links: DigitalLink[] = [];
  for (const item of items) {
    const productId = String(item.product ?? item.productId ?? '');
    if (!productId) continue;
    const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first<Row>();
    if (!product || product.category !== 'digital' || !product.download_url) continue;

    // Idempotent: reuse a live token if one already exists for this order+product.
    const existing = await env.DB.prepare(
      'SELECT * FROM order_downloads WHERE order_id = ? AND product_id = ? AND expires_at > ?'
    )
      .bind(String(order.id), productId, Date.now())
      .first<Row>();
    if (existing) {
      links.push({
        token: String(existing.token),
        url: `${env.CLIENT_URL}/api/orders/downloads/${existing.token}`,
        productName: String(product.name),
      });
      continue;
    }

    const token = randomHex(24);
    await env.DB.prepare(
      'INSERT INTO order_downloads (token, order_id, product_id, email, expires_at, download_count, max_downloads, created_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)'
    )
      .bind(token, String(order.id), productId, String(order.customer_email), Date.now() + DOWNLOAD_TTL_MS, MAX_DOWNLOADS, nowIso())
      .run();
    links.push({
      token,
      url: `${env.CLIENT_URL}/api/orders/downloads/${token}`,
      productName: String(product.name),
    });
  }
  return links;
};

/** Called when a payment succeeds (webhook or admin confirmation). */
export const onOrderPaid = async (env: Env, orderId: string): Promise<void> => {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first<Row>();
  if (!order) return;

  const links = await issueOrderDownloads(env, order);
  const items = parseJsonField<Row[]>(order.items, []);
  const listHtml = items
    .map((i) => `<li>${String(i.name ?? 'Item')} × ${Number(i.quantity ?? 1)} — $${Number(i.price ?? 0).toFixed(2)}</li>`)
    .join('');
  const downloadsHtml = links.length
    ? `<p style="margin-top:20px;"><strong>Your digital downloads</strong> (links are personal, expire in 30 days, and allow up to ${MAX_DOWNLOADS} downloads each):</p>
       <ul>${links.map((l) => `<li><a href="${l.url}">${l.productName}</a></li>`).join('')}</ul>`
    : '';

  void sendEmail(env, {
    to: String(order.customer_email),
    subject: `Payment received — order ${orderId}`,
    text: `Hi ${order.customer_name}, we received your payment for order ${orderId} (total $${Number(order.total_amount).toFixed(2)}).${links
      .map((l) => `\nDownload ${l.productName}: ${l.url}`)
      .join('')}`,
    html: wrapHtml(
      'Payment received 🎉',
      `<p>Hi <strong>${order.customer_name}</strong>,</p>
       <p>We received your payment for order <strong>${orderId}</strong>. Thank you for partnering with the movement!</p>
       <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
       <ul>${listHtml}</ul>
       ${downloadsHtml}
       <p style="margin-top:20px;font-size:14px;color:#71717a;">We’ll email you again when physical items ship.</p>`,
      { label: 'View order status', url: `${env.CLIENT_URL}/order-lookup` }
    ),
  });
};

/** Refund bookkeeping shared by the admin route (Stripe call handled there). */
export const markOrderRefunded = async (env: Env, orderId: string, stripeRefundId?: string): Promise<Row | null> => {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first<Row>();
  if (!order) return null;

  // Release reserved stock (once — guard via refunded_at).
  if (!order.refunded_at) {
    for (const item of parseJsonField<Row[]>(order.items, [])) {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      await env.DB.prepare('UPDATE products SET stock = stock + ? WHERE id = ?')
        .bind(qty, String(item.product ?? item.productId ?? ''))
        .run();
    }
  }

  await env.DB.prepare(
    "UPDATE orders SET status = 'cancelled', refunded_at = ?, payment_id = COALESCE(NULLIF(?2, ''), payment_id), updated_at = ? WHERE id = ?"
  )
    .bind(nowIso(), stripeRefundId || '', nowIso(), orderId)
    .run();

  void sendEmail(env, {
    to: String(order.customer_email),
    subject: `Refund issued for order ${orderId}`,
    text: `Hi ${order.customer_name}, your refund of $${Number(order.total_amount).toFixed(2)} for order ${orderId} has been issued. It may take 5–10 business days to appear on your statement.`,
    html: wrapHtml(
      'Refund issued',
      `<p>Hi <strong>${order.customer_name}</strong>,</p>
       <p>Your refund of <strong>$${Number(order.total_amount).toFixed(2)}</strong> for order <strong>${orderId}</strong> has been issued.</p>
       <p>Depending on your bank or card provider it may take <strong>5–10 business days</strong> to appear on your statement.</p>`
    ),
  });

  return await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first<Row>();
};

/** Expire `pending` orders older than maxAgeMs and release their reserved stock. */
export const releaseStaleOrders = async (db: D1Database, maxAgeMs: number): Promise<{ released: number }> => {
  const cutoffIso = new Date(Date.now() - maxAgeMs).toISOString();
  const { results } = await db
    .prepare("SELECT * FROM orders WHERE status = 'pending' AND created_at < ?")
    .bind(cutoffIso)
    .all<Row>();

  let released = 0;
  for (const order of results || []) {
    for (const item of parseJsonField<Row[]>(order.items, [])) {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      await db
        .prepare('UPDATE products SET stock = stock + ? WHERE id = ?')
        .bind(qty, String(item.product ?? item.productId ?? ''))
        .run();
    }
    await db
      .prepare("UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ? AND status = 'pending'")
      .bind(nowIso(), String(order.id))
      .run();
    released += 1;
  }
  return { released };
};
