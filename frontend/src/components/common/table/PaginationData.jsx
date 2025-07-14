import PaginationItems from "./PaginationItems";

export default function PaginationData({
  pagination,
  totalPages,
  onPageChange,
}) {
  const currentPage = pagination?.pageIndex;
  const siblingCount = 1;
  const pageNumbers = [];

  pageNumbers.push(1);

  const startPage = Math.max(2, currentPage - siblingCount);
  const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

  if (startPage > 2) {
    pageNumbers.push("start-ellipsis");
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages - 1) {
    pageNumbers.push("end-ellipsis");
  }

  if (totalPages > 1) {
    pageNumbers.push(totalPages);
  }

  return (
    <PaginationItems
      pageNumbers={pageNumbers}
      pagination={pagination}
      onPageChange={onPageChange}
    />
  );
}
