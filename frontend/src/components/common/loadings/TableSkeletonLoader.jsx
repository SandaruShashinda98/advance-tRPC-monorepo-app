import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TableSkeletonLoader = ({ showHeader = false }) => {
  const skeletonRows = Array(8).fill(null);
  const skeletonHeaders = Array(4).fill(null);

  return (
    <div className="w-full mt-6 min-h-[100%]">
      {showHeader && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            <Skeleton className="h-10 w-32" />
          </h1>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {skeletonHeaders.map((_, index) => (
              <TableHead key={index} className="w-[300px]">
                <Skeleton className="h-6 w-40" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {skeletonRows.map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableSkeletonLoader;
