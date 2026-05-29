import { api } from './client';
import type { Product } from './products';
import type { Resource } from './resources';
import type { Testimonial } from './testimonials';

export interface SearchResults {
  products: Product[];
  resources: Resource[];
  testimonies: Testimonial[];
}

export const searchApi = {
  search: (q: string) => api.get<SearchResults>(`/search?q=${encodeURIComponent(q)}`),
};

export default searchApi;
