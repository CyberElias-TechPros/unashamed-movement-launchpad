/**
 * Payment provider routes: PayPal (primary), Stripe, Paystack, Flutterwave.
 * All providers work in "dev mode" (no keys configured) so the full checkout
 * flow is testable end-to-end without real credentials.
 */
import { Hono } from 'hono';
import type { Env } from '../types';
import { readJson } from '../types';
import { hmacSha256Hex, hmacSha512Hex, nowIso, safeEqual } from '../util';
import { onOrderPaid } from '../fulfillment';
import { settleDonation } from './community';
import {
  PAYPAL_SUPPORTED_CURRENCIES,
  paypalCaptureOrder,
  paypalConfigured,
  paypalCreateOrder,
  paypalVerifyWebhook,
} from '../paypal';

type App = Hono<{ Bindings: Env }>;

export const paymentRoutes = () => {
  const router = new Hono<{ Bindings: Env }>();

  /* ---------------- PayPal (primary) ---------------- */

  router.get('/paypal/initialize', (c) =>
    c.json({
      configured: paypalConfigured(c.env),
      mode: c.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox',
      message: paypalConfigured(c.env) ? 'PayPal configured' : 'PayPal dev mode',
    })
  );

  /**
   * Create a PayPal order for an existing shop order or donation.
   * The amount is read from OUR database (never the client), and our
   * order/donation id travels in custom_id so captures and webhooks can
   * settle it no matter how the buyer returns.
   */
  router.post('/paypal/create-order', async (c) => {
    const body = await readJson(c);
    const orderId = body.orderId ? String(body.orderId) : '';
    const donationId = body.donationId ? String(body.donationId) : '';

    let amount = 0;
    let currency = String(body.currency || 'USD').toUpperCase();
    let referenceId = '';
    let description = '';

    // Prefer the browser's origin (proxy/preview hosts) so PayPal returns the
    // buyer to the site they actually came from; fall back to CLIENT_URL.
    const originHeader = c.req.header('origin') || '';
    const base = /^https?:\/\//i.test(originHeader) ? originHeader.replace(/\/$/, '') : c.env.CLIENT_URL;
    let returnUrl = '';
    let cancelUrl = '';

    if (orderId) {
      const row = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
      if (!row) return c.json({ message: 'Order not found' }, 404);
      amount = Number(row.total_amount);
      currency = String(row.currency || currency || 'USD').toUpperCase();
      referenceId = String(row.id);
      description = `TTIN order ${row.id}`;
      returnUrl = `${base}/order-success?order=${row.id}&paypal=1`;
      cancelUrl = `${base}/payment-cancelled?order=${row.id}`;
    } else if (donationId) {
      const row = await c.env.DB.prepare('SELECT * FROM donations WHERE id = ?').bind(donationId).first();
      if (!row) return c.json({ message: 'Donation not found' }, 404);
      amount = Number(row.amount);
      currency = String(row.currency || currency || 'USD').toUpperCase();
      referenceId = String(row.id);
      description = 'Donation — The Time Is Now';
      returnUrl = `${base}/donate?status=paypal-return&donation=${row.id}`;
      cancelUrl = `${base}/donate?status=cancelled`;
    } else {
      return c.json({ message: 'orderId or donationId is required' }, 400);
    }

    if (!Number.isFinite(amount) || amount < 0.5) {
      return c.json({ message: 'Invalid amount' }, 400);
    }

    // Dev mode (no credentials): simulate approval and land on the return URL.
    if (!paypalConfigured(c.env)) {
      return c.json({ approveUrl: returnUrl, paypalOrderId: `dev_${referenceId}`, devMode: true });
    }

    if (!PAYPAL_SUPPORTED_CURRENCIES.includes(currency)) {
      return c.json(
        { message: `PayPal does not support ${currency}. Please pay with Paystack or Flutterwave instead.` },
        400
      );
    }

    const result = await paypalCreateOrder(c.env, {
      referenceId,
      amount,
      currency,
      description,
      returnUrl,
      cancelUrl,
    });
    if ('error' in result) return c.json({ message: result.error }, 502);

    // Record the chosen method so refunds know which provider to call.
    if (orderId) {
      await c.env.DB.prepare("UPDATE orders SET payment_method = 'paypal', updated_at = ? WHERE id = ?")
        .bind(nowIso(), orderId)
        .run();
    } else {
      await c.env.DB.prepare("UPDATE donations SET payment_method = 'paypal', updated_at = ? WHERE id = ?")
        .bind(nowIso(), donationId)
        .run();
    }
    return c.json({ approveUrl: result.approveUrl, paypalOrderId: result.id });
  });

  /** Capture an approved PayPal order (called by the return pages; webhooks also capture). */
  router.post('/paypal/capture/:paypalOrderId', async (c) => {
    const ppId = c.req.param('paypalOrderId');

    // Dev mode: the id encodes our reference (dev_<refId>) — settle directly.
    if (!paypalConfigured(c.env)) {
      if (!ppId.startsWith('dev_')) return c.json({ message: 'Invalid PayPal order id' }, 400);
      const referenceId = ppId.slice(4);
      const settled = await updateOrderStatus(c.env, {
        orderId: referenceId,
        status: 'processing',
        paymentId: ppId,
        paymentMethod: 'paypal',
      });
      if (!settled) return c.json({ message: 'No order or donation found for that payment' }, 404);
      return c.json({ status: 'completed', referenceId, devMode: true });
    }

    const result = await paypalCaptureOrder(c.env, ppId);
    if (!result.ok) return c.json({ message: result.error || 'PayPal capture failed' }, 502);

    let settledRef = '';
    if (result.referenceId) {
      const settled = await updateOrderStatus(c.env, {
        orderId: result.referenceId,
        status: 'processing',
        paymentId: result.captureId || ppId,
        paymentMethod: 'paypal',
      });
      if (settled) settledRef = result.referenceId;
    }
    return c.json({
      status: 'completed',
      referenceId: settledRef || result.referenceId || '',
      alreadyCaptured: result.alreadyCaptured || false,
    });
  });

  // PayPal webhook — signatures verified against PayPal's verification API.
  router.post('/paypal/webhook', async (c) => {
    if (!paypalConfigured(c.env) || !c.env.PAYPAL_WEBHOOK_ID) {
      return c.json({ message: 'PayPal webhook not configured' }, 503);
    }
    const raw = await c.req.text();
    let event: { event_type?: string; resource?: Record<string, unknown> };
    try {
      event = JSON.parse(raw);
    } catch {
      return c.json({ message: 'Invalid payload' }, 400);
    }

    const verified = await paypalVerifyWebhook(
      c.env,
      {
        authAlgo: c.req.header('paypal-auth-algo') || '',
        certUrl: c.req.header('paypal-cert-url') || '',
        transmissionId: c.req.header('paypal-transmission-id') || '',
        transmissionSig: c.req.header('paypal-transmission-sig') || '',
        transmissionTime: c.req.header('paypal-transmission-time') || '',
      },
      event
    );
    if (!verified) return c.json({ message: 'Invalid signature' }, 400);

    try {
      if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
        // Buyer approved inside PayPal — capture now, covering buyers who never
        // make it back to the site. Double-capture (return page raced here) is
        // treated as success by the capture helper.
        const ppId = String(event.resource?.id || '');
        if (ppId) {
          const result = await paypalCaptureOrder(c.env, ppId);
          if (result.ok && result.referenceId) {
            await updateOrderStatus(c.env, {
              orderId: result.referenceId,
              status: 'processing',
              paymentId: result.captureId || ppId,
              paymentMethod: 'paypal',
            });
          }
        }
      } else if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const ref = String(event.resource?.custom_id || '');
        const captureId = String(event.resource?.id || '');
        if (ref) {
          await updateOrderStatus(c.env, {
            orderId: ref,
            status: 'processing',
            paymentId: captureId,
            paymentMethod: 'paypal',
          });
        }
      }
      return c.json({ received: true });
    } catch (e) {
      console.error('PayPal webhook error:', e);
      return c.json({ message: 'PayPal webhook processing failed' }, 500);
    }
  });

  /* ---------------- Stripe ---------------- */

  router.get('/stripe/initialize', (c) =>
    c.json({
      configured: Boolean(c.env.STRIPE_SECRET_KEY),
      message: c.env.STRIPE_SECRET_KEY ? 'Stripe configured' : 'Stripe dev mode',
    })
  );

  router.post('/stripe/create-session', async (c) => {
    const body = await readJson(c);
    const successUrl = String(body.successUrl || `${c.env.CLIENT_URL}/order-success`);
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ sessionId: `dev_${Date.now()}`, url: successUrl, message: 'Stripe dev mode - no key configured' });
    }
    const items = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
    const currency = String(body.currency || 'usd').toLowerCase();
    const form = new URLSearchParams();
    form.set('mode', 'payment');
    form.set('success_url', successUrl);
    form.set('cancel_url', String(body.cancelUrl || c.env.CLIENT_URL));
    if (body.orderId) {
      form.set('client_reference_id', String(body.orderId));
      form.set('metadata[orderId]', String(body.orderId));
    }
    items.forEach((item, i) => {
      form.set(`line_items[${i}][price_data][currency]`, currency);
      form.set(`line_items[${i}][price_data][product_data][name]`, String(item.name || 'Item'));
      form.set(`line_items[${i}][price_data][unit_amount]`, String(Math.round(Number(item.price || 0) * 100)));
      form.set(`line_items[${i}][quantity]`, String(Math.max(1, Number(item.quantity) || 1)));
    });
    try {
      const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
      if (!res.ok) return c.json({ message: data.error?.message || 'Stripe checkout session failed' }, 500);
      return c.json({ sessionId: data.id, url: data.url });
    } catch (e) {
      return c.json({ message: e instanceof Error ? e.message : 'Stripe checkout session failed' }, 500);
    }
  });

  // Stripe webhook — verifies the t=/v1= signed scheme with the webhook secret.
  router.post('/stripe/webhook', async (c) => {
    if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_WEBHOOK_SECRET) {
      return c.json({ message: 'Stripe webhook not configured' }, 503);
    }
    const raw = await c.req.text();
    const sigHeader = c.req.header('stripe-signature') || '';
    const parts = Object.fromEntries(sigHeader.split(',').map((p) => p.split('=') as [string, string]));
    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return c.json({ message: 'Invalid signature' }, 400);
    const expected = await hmacSha256Hex(c.env.STRIPE_WEBHOOK_SECRET, `${timestamp}.${raw}`);
    if (!safeEqual(signature, expected)) return c.json({ message: 'Invalid signature' }, 400);

    try {
      const event = JSON.parse(raw) as { type?: string; data?: { object?: Record<string, unknown> } };
      if (event.type === 'checkout.session.completed') {
        const session = event.data?.object || {};
        const orderId = String(session.client_reference_id || (session.metadata as Record<string, unknown>)?.orderId || '');
        if (orderId) {
          await updateOrderStatus(c.env, {
            orderId,
            status: 'processing',
            paymentId: String(session.payment_intent || session.id || ''),
            paymentMethod: 'stripe',
          });
        }
      }
      return c.json({ received: true });
    } catch (e) {
      console.error('Stripe webhook error:', e);
      return c.json({ message: 'Stripe webhook processing failed' }, 500);
    }
  });

  /* ---------------- Paystack ---------------- */

  router.get('/paystack/verify/:reference', async (c) => {
    if (!c.env.PAYSTACK_SECRET_KEY) return c.json({ status: false, message: 'Paystack not configured' }, 503);
    try {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(c.req.param('reference'))}`, {
        headers: { Authorization: `Bearer ${c.env.PAYSTACK_SECRET_KEY}` },
      });
      const data = await res.json();
      return c.json(data);
    } catch (e) {
      return c.json({ status: false, message: e instanceof Error ? e.message : 'Verify failed' }, 500);
    }
  });

  router.post('/paystack/initialize', async (c) => {
    const body = await readJson(c);
    const callbackUrl = String(body.callback_url || `${c.env.CLIENT_URL}/order-success`);
    if (!c.env.PAYSTACK_SECRET_KEY) {
      return c.json({
        status: true,
        message: 'Paystack dev mode',
        data: { authorization_url: callbackUrl, reference: `dev_${Date.now()}` },
      });
    }
    try {
      const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${c.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: body.email,
          amount: body.amount,
          callback_url: body.callback_url,
          reference: body.orderId || body.ref,
          metadata: { orderId: body.orderId || body.ref },
        }),
      });
      const data = await res.json();
      return c.json(data, res.ok ? 200 : 500);
    } catch (e) {
      return c.json({ status: false, message: e instanceof Error ? e.message : 'Paystack initialization failed' }, 500);
    }
  });

  router.post('/paystack/webhook', async (c) => {
    const raw = await c.req.text();
    const signature = c.req.header('x-paystack-signature') || '';
    const secret = c.env.PAYSTACK_WEBHOOK_SECRET || c.env.PAYSTACK_SECRET_KEY;
    if (!secret) return c.json({ message: 'Paystack webhook not configured' }, 503);
    const expected = await hmacSha512Hex(secret, raw);
    if (!signature || !safeEqual(signature, expected)) return c.json({ message: 'Invalid signature' }, 400);

    try {
      const event = JSON.parse(raw) as {
        event?: string;
        data?: { status?: string; reference?: string; metadata?: Record<string, unknown> };
      };
      const orderId = String(event.data?.metadata?.orderId || event.data?.reference || '');
      if (event.event === 'charge.success' && event.data?.status === 'success') {
        await updateOrderStatus(c.env, {
          orderId,
          status: 'processing',
          paymentId: event.data.reference,
          paymentMethod: 'paystack',
        });
      }
      return c.json({ received: true });
    } catch (e) {
      console.error('Paystack webhook error:', e);
      return c.json({ message: 'Paystack webhook processing failed' }, 500);
    }
  });

  /* ---------------- Flutterwave ---------------- */

  router.get('/flutterwave/verify/:transactionId', async (c) => {
    if (!c.env.FLUTTERWAVE_SECRET_KEY) return c.json({ status: false, message: 'Flutterwave not configured' }, 503);
    try {
      const res = await fetch(`https://api.flutterwave.com/v3/transactions/${c.req.param('transactionId')}/verify`, {
        headers: { Authorization: `Bearer ${c.env.FLUTTERWAVE_SECRET_KEY}` },
      });
      const data = await res.json();
      return c.json(data);
    } catch (e) {
      return c.json({ status: false, message: e instanceof Error ? e.message : 'Verify failed' }, 500);
    }
  });

  router.post('/flutterwave/initialize', async (c) => {
    const body = await readJson(c);
    const redirectUrl = String(body.redirect_url || `${c.env.CLIENT_URL}/order-success`);
    if (!c.env.FLUTTERWAVE_SECRET_KEY) {
      return c.json({ status: true, message: 'Flutterwave dev mode', data: { authorization_url: redirectUrl } });
    }
    try {
      const res = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${c.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_ref: body.tx_ref,
          amount: body.amount,
          currency: body.currency || 'USD',
          redirect_url: body.redirect_url,
          meta: { email: body.email, name: body.name, orderId: body.orderId },
        }),
      });
      const data = await res.json();
      return c.json(data, res.ok ? 200 : 500);
    } catch (e) {
      return c.json({ status: false, message: e instanceof Error ? e.message : 'Flutterwave initialization failed' }, 500);
    }
  });

  // Flutterwave verification is a shared secret hash echoed back in `verif-hash`.
  router.post('/flutterwave/webhook', async (c) => {
    const raw = await c.req.text();
    const hash = c.req.header('verif-hash') || '';
    if (!c.env.FLUTTERWAVE_WEBHOOK_HASH) return c.json({ message: 'Flutterwave webhook not configured' }, 503);
    if (!hash || !safeEqual(hash, c.env.FLUTTERWAVE_WEBHOOK_HASH)) return c.json({ message: 'Invalid signature' }, 400);

    try {
      const event = JSON.parse(raw) as {
        event?: string;
        data?: { status?: string; meta?: Record<string, unknown>; tx_ref?: string; flw_ref?: string; transaction_id?: number; id?: number };
      };
      const meta = event.data?.meta || {};
      const orderId = String((meta as { orderId?: string }).orderId || event.data?.tx_ref || '');
      const status = event.data?.status || '';
      if (status === 'successful' || status === 'success' || event.event === 'charge.completed') {
        await updateOrderStatus(c.env, {
          orderId,
          status: 'processing',
          paymentId: String(event.data?.flw_ref || event.data?.transaction_id || event.data?.id || ''),
          paymentMethod: 'flutterwave',
        });
      }
      return c.json({ received: true });
    } catch (e) {
      console.error('Flutterwave webhook error:', e);
      return c.json({ message: 'Flutterwave webhook processing failed' }, 500);
    }
  });

  return router;
};

/** Resolve an order by id, idempotency key, or payment id and update payment fields. */
const updateOrderStatus = async (
  env: Env,
  opts: { orderId: string; status: string; paymentId?: string; paymentMethod?: string }
) => {
  if (!opts.orderId) return null;
  const isHexId = /^[0-9a-f]{24}$/.test(opts.orderId);
  const result = await env.DB.prepare(
    `UPDATE orders SET status = ?2,
       payment_id = COALESCE(NULLIF(?3, ''), payment_id),
       payment_method = COALESCE(NULLIF(?4, ''), payment_method),
       updated_at = ?5
     WHERE id = ?1 OR (?6 != '' AND idempotency_key = ?6) OR (?7 != '' AND payment_id = ?7)`
  )
    .bind(
      opts.orderId,
      opts.status,
      opts.paymentId || '',
      opts.paymentMethod || '',
      new Date().toISOString(),
      isHexId ? '' : opts.orderId,
      isHexId ? '' : opts.orderId
    )
    .run();

  if (result.meta.changes > 0) {
    // Find the actual order id (it may have matched by idempotency/payment id).
    const row = await env.DB
      .prepare(
        "SELECT id FROM orders WHERE id = ?1 OR (?2 != '' AND idempotency_key = ?2) OR (?3 != '' AND payment_id = ?3) LIMIT 1"
      )
      .bind(opts.orderId, isHexId ? '' : opts.orderId, isHexId ? '' : opts.orderId)
      .first<{ id: string }>();
    if (row) await onOrderPaid(env, row.id);
    return true;
  }

  // Not an order — maybe it's a donation reference (the donation id is used as
  // the Paystack reference / Flutterwave tx_ref / Stripe client_reference_id).
  const donated = await settleDonation(env, {
    refId: opts.orderId,
    status: 'completed',
    paymentId: opts.paymentId,
  });
  return donated;
};

