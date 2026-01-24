import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function UniversityRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-5 w-[250px]" />
      </TableCell>
      <TableCell className="flex gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </TableCell>
    </TableRow>
  );
}
