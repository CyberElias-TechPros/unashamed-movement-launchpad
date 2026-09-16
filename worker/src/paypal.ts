/**
 * PayPal integration (Orders v2 API + webhooks).
 *
 * PayPal is the PRIMARY payment provider for shop checkout and donations.
 * Flow: server creates a PayPal order → buyer approves on PayPal →
 * (a) buyer returns to the site and the frontend calls /capture, or
 * (b) the CHECKOUT.ORDER.APPROVED webhook captures server-side —
 * both paths settle our order/donation idempotently.
 *
 * Works in "dev mode" (no credentials) like the other providers: the
 * create-order response simply points back at the site's success URL.
 *
 * Set: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID,
 *      PAYPAL_ENV=live|sandbox (defaults to sandbox).
 */
import type { Env } from './types';

export const paypalConfigured = (env: Env): boolean =>
  Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);

export const paypalApiBase = (env: Env): string =>
  env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

/**
 * Currencies PayPal can receive in (notably: NO NGN — Nigerian givers are
 * routed to Paystack/Flutterwave in the UI and rejected here).
 */
export const PAYPAL_SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD', 'JPY', 'CHF',
  'SEK', 'DKK', 'NOK', 'PLN', 'CZK', 'HUF', 'ILS', 'MXN', 'BRL', 'MYR',
  'PHP', 'TWD', 'THB', 'ZAR',
];

const TOKEN_CACHE_KEY = 'paypal:access_token';

/** OAuth access token, cached in KV (with in-memory fallback semantics). */
export const paypalAccessToken = async (env: Env): Promise<string | null> => {
  if (!paypalConfigured(env)) return null;
  try {
    const cached = await env.CACHE?.get(TOKEN_CACHE_KEY);
    if (cached) return cached;
  } catch {
    /* cache unavailable — continue to PayPal */
  }
  try {
    const basic = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
    const res = await fetch(`${paypalApiBase(env)}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    try {
      await env.CACHE?.put(TOKEN_CACHE_KEY, data.access_token, {
        expirationTtl: Math.max(60, (data.expires_in || 3600) - 120),
      });
    } catch {
      /* non-fatal */
    }
    return data.access_token;
  } catch {
    return null;
  }
};

export interface PaypalCreateOrderInput {
  referenceId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export const paypalCreateOrder = async (
  env: Env,
  input: PaypalCreateOrderInput
): Promise<{ id: string; approveUrl: string } | { error: string }> => {
  const token = await paypalAccessToken(env);
  if (!token) return { error: 'PayPal is not configured' };
  try {
    const res = await fetch(`${paypalApiBase(env)}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: input.referenceId,
            custom_id: input.referenceId,
            description: input.description.slice(0, 127),
            amount: { currency_code: input.currency, value: input.amount.toFixed(2) },
          },
        ],
        application_context: {
          brand_name: 'The Time Is Now',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: input.returnUrl,
          cancel_url: input.cancelUrl,
        },
      }),
    });
    const data = (await res.json()) as {
      id?: string;
      links?: { rel: string; href: string }[];
      message?: string;
      details?: { description?: string }[];
    };
    if (!res.ok || !data.id) {
      const detail = data.details?.[0]?.description || data.message || 'PayPal order creation failed';
      return { error: detail };
    }
    const approveUrl =
      data.links?.find((l) => l.rel === 'approve')?.href ||
      `https://www.paypal.com/checkoutnow?token=${data.id}`;
    return { id: data.id, approveUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'PayPal order creation failed' };
  }
};

export interface PaypalCaptureResult {
  ok: boolean;
  captureId?: string;
  referenceId?: string;
  alreadyCaptured?: boolean;
  error?: string;
}

/** Capture an approved PayPal order and return the capture id + our reference. */
export const paypalCaptureOrder = async (
  env: Env,
  paypalOrderId: string
): Promise<PaypalCaptureResult> => {
  const token = await paypalAccessToken(env);
  if (!token) return { ok: false, error: 'PayPal is not configured' };
  try {
    const res = await fetch(
      `${paypalApiBase(env)}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }
    );
    const data = (await res.json()) as {
      status?: string;
      details?: { issue?: string; description?: string }[];
      purchase_units?: {
        reference_id?: string;
        custom_id?: string;
        payments?: { captures?: { id: string; status: string }[] };
      }[];
    };
    if (!res.ok) {
      // Capturing twice (return page + webhook race) is success for our purposes.
      if (data.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
        return { ok: true, alreadyCaptured: true };
      }
      return { ok: false, error: data.details?.[0]?.description || 'PayPal capture failed' };
    }
    const unit = data.purchase_units?.[0];
    const capture =
      unit?.payments?.captures?.find((cp) => cp.status === 'COMPLETED') ||
      unit?.payments?.captures?.[0];
    return {
      ok: data.status === 'COMPLETED' || Boolean(capture),
      captureId: capture?.id || paypalOrderId,
      referenceId: unit?.custom_id || unit?.reference_id || '',
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'PayPal capture failed' };
  }
}

/** Refund a captured PayPal payment (capture id → /v2/payments/captures/:id/refund). */
export const paypalRefundCapture = async (
  env: Env,
  captureId: string
): Promise<{ ok: boolean; refundId?: string; error?: string }> => {
  const token = await paypalAccessToken(env);
  if (!token) return { ok: false, error: 'PayPal is not configured' };
  try {
    const res = await fetch(
      `${paypalApiBase(env)}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }
    );
    const data = (await res.json()) as { id?: string; status?: string; message?: string };
    if (!res.ok) return { ok: false, error: data.message || 'PayPal refund failed' };
    return { ok: true, refundId: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'PayPal refund failed' };
  }
};

/** Verify a PayPal webhook signature via PayPal's verification API. */
export const paypalVerifyWebhook = async (
  env: Env,
  headers: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
  },
  parsedEvent: unknown
): Promise<boolean> => {
  const token = await paypalAccessToken(env);
  if (!token || !env.PAYPAL_WEBHOOK_ID) return false;
  try {
    const res = await fetch(`${paypalApiBase(env)}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_algo: headers.authAlgo,
        cert_url: headers.certUrl,
        transmission_id: headers.transmissionId,
        transmission_sig: headers.transmissionSig,
        transmission_time: headers.transmissionTime,
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: parsedEvent,
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { verification_status?: string };
    return data.verification_status === 'SUCCESS';
  } catch {
    return false;
  }
};
