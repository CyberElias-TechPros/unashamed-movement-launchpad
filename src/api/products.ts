import { api, PaginatedResponse, PaginationParams } from '../lib/api-client';

export interface Product {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: 'merch' | 'digital';
  images?: string[];
  image?: string;
  stock?: number;
  isActive?: boolean;
  downloadUrl?: string;
  tag?: string;
  variants?: ProductVariant[];
  sizes?: string[];
  colors?: string[];
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
}

export interface Order {
  id?: string;
  items: CartItem[];
  total: number;
  customerEmail: string;
  customerName: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface ProductFilters extends PaginationParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export const productsApi = {
  // Public paginated endpoints
  getAll: (filters?: ProductFilters) => {
    return api.getPaginated<Product>('/products', filters || {});
  },
  
  // Admin paginated endpoints
  getAllAdmin: (filters?: ProductFilters) => {
    return api.getPaginated<Product>('/products/admin/all', filters || {});
  },
  
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  
  create: (data: Omit<Product, 'id'>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  
  // Bulk operations
  bulkDelete: (ids: string[]) => api.post('/products/bulk-delete', { ids }),
  bulkUpdateStatus: (ids: string[], isActive: boolean) => 
    api.post('/products/bulk-update-status', { ids, isActive }),
  
  updateStock: (id: string, quantity: number) => 
    api.patch<{ stock: number }>(`/products/${id}/stock`, { quantity }),
  
  getStock: (id: string) => api.get<{ stock: number }>(`/products/${id}/stock`),
  subscribeStock: (id: string, email: string) => api.post(`/products/${id}/subscribe-stock`, { email }),
};

export const ordersApi = {
  create: (data: {
    items: { productId: string; quantity: number; variantId?: string }[];
    customerEmail: string;
    customerName: string;
  }) => api.post<{ sessionId: string; url: string }>('/orders/create-checkout-session', data),
  
  // Paginated endpoints
  getAll: (params?: PaginationParams) => api.getPaginated<Order>('/orders', params || {}),
  getMyOrders: (params?: PaginationParams) => api.getPaginated<Order>('/orders/my-orders', params || {}),
  
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  
  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: string) => 
    api.post('/orders/bulk-update-status', { ids, status }),
};

export default productsApi;
