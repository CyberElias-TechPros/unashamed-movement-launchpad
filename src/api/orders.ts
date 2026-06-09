import { api } from './client';

export interface OrderItem {
  productId?: string;
  product?: { _id?: string; name?: string };
  name?: string;
  quantity: number;
  price: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface Order {
  _id?: string;
  id?: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  totalAmount?: number;
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentIntentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  items: Array<{
    product: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  customer?: string;
}

export const ordersApi = {
  create: (orderData: CreateOrderPayload) => api.post<{ _id: string }>('/orders', orderData),

  getById: (id: string) => api.get<Order>(`/orders/${id}`),

  getAll: () => api.get<Order[]>('/orders'),

  getUserOrders: () => api.get<Order[]>('/orders/my-orders'),

  updateStatus: (id: string, status: string) =>
    api.patch<{ _id: string }>(`/orders/${id}/status`, { status }),

  checkout: (payload: CreateOrderPayload) =>
    api.post<{ orderId: string; sessionId: string; url: string }>('/orders/checkout', payload),
};

export default ordersApi;