import { api } from './client';

export interface CountryStat {
  code: string;
  name: string;
  preachers: number;
}

export const countriesApi = {
  getAll: () => api.get<CountryStat[]>('/countries'),
};

export default countriesApi;
