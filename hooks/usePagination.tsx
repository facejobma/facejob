import { useState, useEffect, useCallback } from 'react';

interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationData;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

interface UsePaginationReturn<T> {
  data: T[];
  pagination: PaginationData | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  refetch: () => Promise<void>;
}

export function usePagination<T>(
  fetchFunction: (page: number, perPage: number) => Promise<PaginatedResponse<T>>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, initialPerPage = 15 } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFunction(currentPage, perPage);
      
      setData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, currentPage, perPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    currentPage,
    setCurrentPage: handlePageChange,
    perPage,
    setPerPage: handlePerPageChange,
    refetch: fetchData,
  };
}

export default usePagination;