import React from 'react';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** true cuando vive dentro de una card: agrega padding y borde superior */
  bordered?: boolean;
}

const navButton = (disabled: boolean) =>
  `w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded transition-colors ${
    disabled
      ? 'text-[#757575] cursor-not-allowed'
      : 'text-[#F46036] hover:bg-[#fff5f2] cursor-pointer'
  }`;

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  bordered = false,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Paginación"
      className={`flex items-center justify-center gap-1 md:gap-2 ${
        bordered ? 'px-5 py-4 border-t border-[#f0f0f0]' : 'mt-2 md:mt-4'
      }`}
    >
      <button
        type="button"
        aria-label="Página anterior"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={navButton(page === 1)}
      >
        <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {pages.map((p) => (
        <button
          type="button"
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded font-semibold text-sm md:text-base transition-colors cursor-pointer ${
            p === page
              ? 'bg-[#F46036] text-white'
              : 'text-[#F46036] hover:bg-[#fff5f2]'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        aria-label="Página siguiente"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={navButton(page === totalPages)}
      >
        <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </nav>
  );
};