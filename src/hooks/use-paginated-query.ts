import { useState, useCallback } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import api, { PaginationParams, PaginatedResponse } from '@/lib/api-client';

interface UsePaginatedQueryOptions<T> extends Omit<UseQueryOptions<PaginatedResponse<T>, Error>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  initialPage?: number;
  initialLimit?: number;
  queryKey?: unknown[];
}

interface UsePaginatedQueryResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  refresh: () => void;
}

export function usePaginatedQuery<T>(
  options: UsePaginatedQueryOptions<T>
): UsePaginatedQueryResult<T> {
  const { endpoint, initialPage = 1, initialLimit = 10, queryKey: customKey, ...queryOptions } = options;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const params: PaginationParams = {
    page,
    limit,
  };
  
  const { queryKey: customQueryKey, ...restOptions } = queryOptions;
  const queryKey = customQueryKey ? [...customQueryKey, endpoint, params] : [endpoint, params];
  
  const { data, isLoading, isError, error } = useQuery<PaginatedResponse<T>, Error>({
    queryKey,
    queryFn: () => api.getPaginated<T>(endpoint, params),
    ...restOptions,
  });
  
  const goToPage = useCallback((newPage: number) => {
    const targetPage = Math.max(1, newPage);
    setPage(targetPage);
  }, []);
  
  const goToNextPage = useCallback(() => {
    if (data?.pagination.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [data?.pagination.hasNextPage]);
  
  const goToPrevPage = useCallback(() => {
    if (data?.pagination.hasPrevPage) {
      setPage((prev) => prev - 1);
    }
  }, [data?.pagination.hasPrevPage]);
  
  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);
  
  const goToLastPage = useCallback(() => {
    if (data?.pagination.totalPages) {
      setPage(data.pagination.totalPages);
    }
  }, [data?.pagination.totalPages]);
  
  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);
  
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [endpoint] });
  }, [queryClient, endpoint]);
  
  return {
    data: data?.data ?? [],
    pagination: data?.pagination ?? {
      page: 1,
      limit: initialLimit,
      totalCount: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    },
    isLoading,
    isError,
    error,
    page,
    limit,
    setPage: goToPage,
    setLimit: handleSetLimit,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    refresh,
  };
}

export default usePaginatedQuery;
