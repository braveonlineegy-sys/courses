import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useCollege } from "@/hooks/use-college";
import { CollegeCard } from "./CollegeCard";
import { CollegeDialog } from "./CollegeDialog";

export function CollegeList({ universityId }: { universityId: string }) {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { collegesQuery } = useCollege(page, "", universityId);

  const data = collegesQuery.data?.data;
  const colleges = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الكليات</h2>
          <p className="text-muted-foreground">
            إدارة الكليات التابعة للجامعة.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          disabled={collegesQuery.isLoading}
        >
          <Plus className="ml-2 h-4 w-4" /> إضافة كلية
        </Button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collegesQuery.isError ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">{collegesQuery.error.message}</p>
            <Button variant="link" onClick={() => collegesQuery.refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : collegesQuery.isLoading ? (
          // Skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))
        ) : colleges.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground italic">
              لا توجد كليات مضافة لهذه الجامعة بعد.
            </p>
          </div>
        ) : (
          colleges.map((college: any) => (
            <CollegeCard key={college.id} college={college} />
          ))
        )}
      </div>

      {totalItems > 10 && !collegesQuery.isLoading && (
        <div className="flex items-center justify-between pt-6 border-t">
          <span className="text-sm text-muted-foreground">
            عرض {colleges.length} من أصل {totalItems} كلية
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      <CollegeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        universityId={universityId}
      />
    </div>
  );
}
