import { PaginationButton } from './pagination-button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="inline-flex items-center gap-1.5">
      <PaginationButton
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
      >
        ‹
      </PaginationButton>
      {pages.map((pageNumber) => (
        <PaginationButton
          key={pageNumber}
          active={pageNumber === page}
          onClick={() => onPageChange?.(pageNumber)}
        >
          {pageNumber}
        </PaginationButton>
      ))}
      <PaginationButton
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange?.(page + 1)}
      >
        ›
      </PaginationButton>
    </nav>
  );
}
