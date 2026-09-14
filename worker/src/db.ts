/**
 * D1 query helpers: pagination, filtering, sorting — mirrors the shapes the
 * frontend already expects from the old Express/Mongo API.
 */
import { escapeLike, nowIso, oid } from './util';
import type { Row } from './types';

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface Paginated<T> {
  data: T[];
  pagination: PaginationInfo;
}

export const parsePageParams = (query: URLSearchParams): { page: number; limit: number; offset: number } => {
  const page = Math.max(1, parseInt(query.get('page') || '', 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.get('limit') || '', 10) || DEFAULT_LIMIT));
  return { page, limit, offset: (page - 1) * limit };
};

/** Whitelist-based sort translation: client `sort`/`order` params → SQL ORDER BY. */
export const orderBy = (
  query: URLSearchParams,
  allowed: Record<string, string>,
  fallback: string
): string => {
  const rawSort = query.get('sort') || '';
  const sort = rawSort.replace(/^-/, '');
  const explicitDir = rawSort.startsWith('-') ? 'DESC' : query.get('order') === 'asc' ? 'ASC' : 'DESC';
  if (sort && allowed[sort]) return `${allowed[sort]} ${explicitDir}`;
  // Fallback may already carry a direction ("created_at DESC").
  const [col, defaultDir = 'DESC'] = fallback.trim().split(/\s+/);
  return `${col} ${query.get('order') === 'asc' ? 'ASC' : defaultDir}`;
};

export const paginatedResponse = <T>(data: T[], page: number, limit: number, totalCount: number) => {
  const totalPages = Math.ceil(totalCount / limit) || 0;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  return {
    data,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
};

/** Run a SELECT + COUNT pair and return a paginated payload. */
export const paginateQuery = async (
  db: D1Database,
  baseWhere: { sql: string; params: unknown[] },
  selectSql: string,
  orderSql: string,
  page: number,
  limit: number,
  offset: number
): Promise<Paginated<Row>> => {
  const whereClause = baseWhere.sql ? ` WHERE ${baseWhere.sql}` : '';
  const [dataResult, countResult] = await Promise.all([
    db
      .prepare(`${selectSql}${whereClause} ORDER BY ${orderSql} LIMIT ? OFFSET ?`)
      .bind(...baseWhere.params, limit, offset)
      .all(),
    db.prepare(`SELECT COUNT(*) AS total FROM (${selectSql}${whereClause})`).bind(...baseWhere.params).first<{ total: number }>(),
  ]);
  return paginatedResponse(dataResult.results || [], page, limit, countResult?.total || 0);
};

/** Build a `LOWER(col) LIKE ?` OR-group for search. */
export const searchGroup = (term: string, columns: string[]): { sql: string; params: unknown[] } => {
  if (!term) return { sql: '', params: [] };
  const pattern = `%${escapeLike(term.toLowerCase())}%`;
  const clauses = columns.map((c) => `LOWER(${c}) LIKE ? ESCAPE '\\'`);
  return { sql: `(${clauses.join(' OR ')})`, params: columns.map(() => pattern) };
};

/** Generate an INSERT statement for a table from a camel/snake-keyed object. */
export const insertRow = (
  table: string,
  fields: Record<string, unknown>
): { sql: string; params: unknown[] } => {
  const keys = Object.keys(fields);
  const sql = `INSERT INTO ${table} (${keys.map(snake).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
  return { sql, params: keys.map((k) => fields[k]) };
};

/** Generate an UPDATE statement; `undefined` values are skipped. */
export const updateRow = (
  table: string,
  fields: Record<string, unknown>,
  where: string,
  whereParams: unknown[]
): { sql: string; params: unknown[] } | null => {
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return null;
  const sql = `UPDATE ${table} SET ${entries.map(([k]) => `${snake(k)} = ?`).join(', ')}, updated_at = ? WHERE ${where}`;
  return { sql, params: [...entries.map(([, v]) => v), nowIso(), ...whereParams] };
};

export const newId = oid;

export const snake = (key: string): string =>
  ['createdAt', 'updatedAt'].includes(key)
    ? key === 'createdAt'
      ? 'created_at'
      : 'updated_at'
    : key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
