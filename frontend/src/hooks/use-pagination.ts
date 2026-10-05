import { useMemo, useState } from 'react';

interface UsePaginationResult<T> {
  page: number;
  totalPages: number;
  pageItems: T[];
  setPage: (page: number) => void;
  resetPage: () => void;
}

export const usePagination = <T,>(
  items: T[],
  pageSize: number
): UsePaginationResult<T> => {
  const [requestedPage, setRequestedPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Si la lista se achica (filtros, recarga), la página nunca se pasa del total
  const page = Math.min(requestedPage, totalPages);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return {
    page,
    totalPages,
    pageItems,
    setPage: setRequestedPage,
    resetPage: () => setRequestedPage(1),
  };
};