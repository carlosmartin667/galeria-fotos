import { PaginatedResponse } from '../models/pagination.models';

export function extractItems<T>(response: T[] | { items?: T[]; data?: T[]; value?: T[]; results?: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? response.data ?? response.value ?? response.results ?? [];
}

export function normalizePaginatedResponse<T>(response: unknown): PaginatedResponse<T> {
  if (Array.isArray(response)) {
    return {
      items: response as T[],
      page: 1,
      pageSize: response.length,
      totalItems: response.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      all: true
    };
  }

  const body = isRecord(response) ? response : {};
  const items = readItems<T>(body);
  const page = readNumber(body, ['page', 'Page', 'currentPage', 'CurrentPage'], 1);
  const pageSize = readNumber(body, ['pageSize', 'PageSize', 'size', 'Size'], items.length || 10);
  const totalItems = readNumber(body, ['totalItems', 'TotalItems', 'totalCount', 'TotalCount', 'count', 'Count'], items.length);
  const rawTotalPages = readNumber(body, ['totalPages', 'TotalPages', 'pages', 'Pages'], Math.ceil(totalItems / Math.max(pageSize, 1)));
  const totalPages = Math.max(rawTotalPages || 1, 1);
  const all = readBoolean(body, ['all', 'All'], totalPages <= 1 && items.length === totalItems);

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    hasPreviousPage: readBoolean(body, ['hasPreviousPage', 'HasPreviousPage'], !all && page > 1),
    hasNextPage: readBoolean(body, ['hasNextPage', 'HasNextPage'], !all && page < totalPages),
    all
  };
}

function readItems<T>(body: Record<string, unknown>): T[] {
  const value = body['items'] ?? body['Items'] ?? body['data'] ?? body['Data'] ?? body['value'] ?? body['Value'] ?? body['results'] ?? body['Results'];
  return Array.isArray(value) ? value as T[] : [];
}

function readNumber(body: Record<string, unknown>, keys: string[], fallback: number): number {
  const value = keys.map((key) => body[key]).find((item) => item !== null && item !== undefined);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function readBoolean(body: Record<string, unknown>, keys: string[], fallback: boolean): boolean {
  const value = keys.map((key) => body[key]).find((item) => item !== null && item !== undefined);

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
