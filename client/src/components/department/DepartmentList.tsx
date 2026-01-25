import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useDepartment } from "@/hooks/use-department";
import { DepartmentCard } from "./DepartmentCard";
import { DepartmentDialog } from "./DepartmentDialog";

export function DepartmentList({ collegeId }: { collegeId: string }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { departmentsQuery } = useDepartment(collegeId);

  // Note: Backend might send array directly or object with data
  const data = departmentsQuery.data;
  // Based on `successResponse(c, result, ...)` and `getDepartments` returning array:
  // result comes as { success: true, data: [...], ... }
  // So `departmentsQuery.data` is the whole response object?
  // Let's check `use-department.ts` types.
  // `DepartmentResponseType` is Awaited<ReturnType<typeof getAllDepartments>>
  // `getAllDepartments` returns `res.json()`.
  // If `getAllDepartments` call returns the standard response wrapper:
  const departments = departmentsQuery.data?.data || [];

  // No pagination support in current hook

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الأقسام</h2>
          <p className="text-muted-foreground">إدارة الأقسام التابعة للكلية.</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          disabled={departmentsQuery.isLoading}
        >
          <Plus className="ml-2 h-4 w-4" /> إضافة قسم
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departmentsQuery.isError ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">
              {departmentsQuery.error.message}
            </p>
            <Button variant="link" onClick={() => departmentsQuery.refetch()}>
              إعادة المحاولة
            </Button>
          </div>
        ) : departmentsQuery.isLoading ? (
          // Skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))
        ) : departments.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground italic">
              لا توجد أقسام مضافة لهذه الكلية بعد.
            </p>
          </div>
        ) : (
          departments.map((dept: any) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))
        )}
      </div>

      <DepartmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        collegeId={collegeId}
      />
    </div>
  );
}
