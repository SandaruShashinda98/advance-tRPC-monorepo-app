import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "../table";
import { CaretUpDown } from "@phosphor-icons/react";
import TablePagination from "./tablePagination";
import TableSelectionControls from "./tableSelectionControl";
import { Fragment } from "react";
import TableSkeletonLoader from "../skeleton/table-skelton-loader";
import ErrorDisplay from "../errorDisplay";

export default function DataTable({
  data,
  columns,
  totalRecords,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  page,
  onSelectionAction,
  isEnableSearchResultText = false,
  isDataLoading = false,
  fetchError = false,
}) {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    manualPagination: true,
    debugTable: true,
  });

  return (
    <div className="rounded-md">
      {isEnableSearchResultText && (
        <p className="text-gray-600 font-light text-sm my-4">SEARCH RESULTS</p>
      )}

      {isDataLoading && <TableSkeletonLoader />}

      {fetchError && <div>{ErrorDisplay()}</div>}

      {!isDataLoading && !fetchError && (
        <>
          <Table>
            <TableHeader className="[&_tr]:border-b-0 bg-neutral-50 rounded-t-md">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={`px-4 ${
                        header.column.columnDef.className || ""
                      } ${index === 0 ? "rounded-tl-md rounded-bl-md" : ""} ${
                        index === headerGroup.headers.length - 1
                          ? "rounded-tr-md rounded-br-md"
                          : ""
                      }`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center ${
                            header.column.getCanSort() ? "cursor-pointer" : ""
                          }`}
                          role="button"
                          onClick={
                            header.column.getCanSort()
                              ? () =>
                                  header.column.toggleSorting(
                                    header.column.getIsSorted() === "asc"
                                  )
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <CaretUpDown size={16} className="ml-2" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow key={row.id} className="border-none">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`${cell.column.columnDef.className}`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          {/* <AudioPlayer /> */}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end mt-4 px-2">
            {page ? (
              <div className="mr-auto">
                <TableSelectionControls
                  table={table}
                  selectedCount={table.getSelectedRowModel().rows.length}
                  selectedRows={table.getSelectedRowModel().rows}
                  page={page}
                  totalRecords={totalRecords}
                  onSelectionAction={onSelectionAction}
                />
              </div>
            ) : null}

            <TablePagination
              pagination={pagination}
              totalItems={totalRecords}
              onPageChange={(pageIndex) => {
                table.setExpanded({});
                onPaginationChange({ ...pagination, pageIndex });
              }}
              onPageSizeChange={(pageSize) => {
                table.setExpanded({});
                onPaginationChange({ ...pagination, pageSize, pageIndex: 1 });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
