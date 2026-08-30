/** Shared types for bindings, request context, and row → API serialization. */

export interface Env {
  DB: D1Database;
  CACHE?: KVNamespace;
  MEDIA?: R2Bucket;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  CSRF_SECRET: string;
  CLIENT_URL: string;
  ALLOWED_ORIGINS?: string;
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  PAYSTACK_SECRET_KEY?: string;
  PAYSTACK_WEBHOOK_SECRET?: string;
  FLUTTERWAVE_SECRET_KEY?: string;
  FLUTTERWAVE_WEBHOOK_HASH?: string;
}

export interface AuthUser {
  id: string;
  role: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user?: AuthUser;
    rawBody?: string;
  }
}

export type Row = Record<string, unknown>;

/** snake_case D1 row → camelCase API object with both `_id` and `id`. */
export const toApi = (row: Row): Row => {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
    out[camel] = v;
  }
  if (out.id !== undefined) out._id = out.id;
  return out;
};

/** Parse JSON columns that were stored as TEXT. */
export const parseJsonField = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const boolToInt = (v: unknown): 0 | 1 => (v === true || v === 1 || v === 'true' ? 1 : 0);

/** Safely read a JSON body, always returning a plain object. */
export const readJson = async (c: { req: { json: () => Promise<unknown> } }): Promise<Record<string, unknown>> => {
  try {
    const body = await c.req.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};


export const intToBool = (row: Row, keys: string[]): Row => {
  for (const k of keys) {
    const camel = k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
    if (row[camel] !== undefined) row[camel] = row[camel] === 1 || row[camel] === true;
  }
  return row;
};
