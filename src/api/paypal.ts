import { api } from './client';

export interface PaypalCreateOrderResponse {
  approveUrl: string;
  paypalOrderId: string;
  devMode?: boolean;
}

export interface PaypalCaptureResponse {
  status: string;
  referenceId?: string;
  alreadyCaptured?: boolean;
  devMode?: boolean;
}

/**
 * PayPal (primary provider). Flows:
 *  - Shop:  checkout → createOrder({orderId}) → redirect to approveUrl →
 *           PayPal returns to /order-success which captures.
 *  - Gifts: donation checkout → createOrder({donationId}) → approveUrl →
 *           /donate?status=paypal-return captures.
 * Webhooks settle both paths server-side as a safety net.
 */
export const paypalApi = {
  initialize: () =>
    api.get<{ configured: boolean; mode: 'live' | 'sandbox'; message: string }>(
      '/payments/paypal/initialize'
    ),

  createOrder: (payload: { orderId?: string; donationId?: string; currency?: string }) =>
    api.post<PaypalCreateOrderResponse & { message?: string }>(
      '/payments/paypal/create-order',
      payload
    ),

  capture: (paypalOrderId: string) =>
    api.post<PaypalCaptureResponse & { message?: string }>(
      `/payments/paypal/capture/${encodeURIComponent(paypalOrderId)}`,
      {}
    ),
};

export default paypalApi;
