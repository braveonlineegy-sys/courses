import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TeacherDetailsSkeleton() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Stats Skeleton - Matching the layout of TeacherStats (md:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mt-2" />
          </CardContent>
        </Card>
        {/* Card 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Courses List Skeleton - Mimicking a table */}
      <div className="rounded-md border p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-48" /> {/* Table Title */}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid grid-cols-5 gap-4 py-3 border-t">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
