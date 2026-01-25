/**
 * Pagination utilities for API calls
 */

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Build query string for pagination parameters
 */
export function buildPaginationQuery(params: PaginationParams): string {
  const searchParams = new URLSearchParams();
  
  if (params.page) {
    searchParams.append('page', params.page.toString());
  }
  
  if (params.per_page) {
    searchParams.append('per_page', params.per_page.toString());
  }
  
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Make a paginated API request
 */
export async function fetchPaginated<T>(
  url: string,
  params: PaginationParams = {},
  options: RequestInit = {}
): Promise<PaginatedResponse<T>> {
  const query = buildPaginationQuery(params);
  const response = await fetch(`${url}${query}`, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Handle both paginated and non-paginated responses
  if (data.pagination) {
    return data as PaginatedResponse<T>;
  } else {
    // Convert non-paginated response to paginated format
    return {
      data: Array.isArray(data) ? data : [data],
      pagination: {
        current_page: 1,
        per_page: Array.isArray(data) ? data.length : 1,
        total: Array.isArray(data) ? data.length : 1,
        last_page: 1,
        from: 1,
        to: Array.isArray(data) ? data.length : 1,
        has_more_pages: false,
      }
    };
  }
}

/**
 * Calculate pagination info for display
 */
export function getPaginationInfo(pagination: PaginationMeta) {
  const { current_page, per_page, total, from, to } = pagination;
  
  return {
    showing: `${from || 0}-${to || 0}`,
    total,
    currentPage: current_page,
    totalPages: pagination.last_page,
    hasNext: pagination.has_more_pages,
    hasPrev: current_page > 1,
  };
}

/**
 * Generate page numbers for pagination component
 */
export function generatePageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): (number | string)[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  if (currentPage <= halfVisible + 1) {
    // Show first pages
    for (let i = 1; i <= maxVisible - 1; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(totalPages);
  } else if (currentPage >= totalPages - halfVisible) {
    // Show last pages
    pages.push(1);
    pages.push('...');
    for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show middle pages
    pages.push(1);
    pages.push('...');
    for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
      pages.push(i);
    }
    pages.push('...');
    pages.push(totalPages);
  }

  return pages;
}

export default {
  buildPaginationQuery,
  fetchPaginated,
  getPaginationInfo,
  generatePageNumbers,
};