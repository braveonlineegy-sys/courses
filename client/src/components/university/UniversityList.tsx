import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useUniversity } from "@/hooks/use-university";
import { UniversityItem } from "./UniversityCard";
import { UniversityDialog } from "./UniversityDialog";

export function UniversityList() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { universitiesQuery } = useUniversity(page);

  const data = universitiesQuery.data?.data;
  const universities = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الجامعات</h2>
          <p className="text-muted-foreground">
            إدارة الجامعات المتاحة في المنصة.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          disabled={universitiesQuery.isLoading}
        >
          <Plus className="ml-2 h-4 w-4" /> إضافة جامعة
        </Button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {universitiesQuery.isError ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">
              {universitiesQuery.error.message}
            </p>
            <Button variant="link" onClick={() => universitiesQuery.refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : universitiesQuery.isLoading ? (
          // Skeletons كـ Cards
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))
        ) : universities.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground italic">
              لا توجد جامعات حالياً.
            </p>
          </div>
        ) : (
          universities.map((uni: any) => (
            <UniversityItem key={uni.id} university={uni} />
          ))
        )}
      </div>

      {totalItems > 10 && !universitiesQuery.isLoading && (
        <div className="flex items-center justify-between pt-6 border-t">
          <span className="text-sm text-muted-foreground">
            عرض {universities.length} من أصل {totalItems} جامعة
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

      <UniversityDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
