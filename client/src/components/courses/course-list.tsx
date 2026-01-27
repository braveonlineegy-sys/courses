import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import { useCourse, type CourseType } from "@/hooks/use-course"; // Ensure CourseType is exported
import { CourseCard } from "./CourseCard";
import { CourseDialog } from "./course-dialog";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";

interface CourseListProps {
  levelId?: string;
  teacherId?: string;
  role: "ADMIN" | "TEACHER";
}

export function CourseList({ levelId, teacherId, role }: CourseListProps) {
  const [page, setPage] = useState(1);
  const { coursesQuery, deleteMutation } = useCourse(
    page,
    "",
    levelId,
    10,
    teacherId,
  );

  // State for actions
  const [courseToDelete, setCourseToDelete] = useState<CourseType | null>(null);
  const [courseToEdit, setCourseToEdit] = useState<CourseType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // For Edit/Create dialog

  const data = coursesQuery.data;
  const courses = data?.data?.items || [];
  const totalPages = Math.ceil((data?.data?.total || 0) / 10);
  const totalItems = data?.data?.total || 0;

  const handleDelete = async () => {
    if (courseToDelete) {
      await deleteMutation.mutateAsync(courseToDelete.id);
      setCourseToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            {role === "ADMIN"
              ? "Manage courses for this level."
              : "Manage your courses."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setCourseToEdit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>

          <CourseDialog
            role={role}
            levelId={levelId}
            teacherId={teacherId}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            initialData={courseToEdit || undefined} // Pass course to edit
            onClose={() => {
              setCourseToEdit(null); // Reset edit state on close
              setIsDialogOpen(false);
            }}
          />
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coursesQuery.isError ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">
              {(coursesQuery.error as Error).message}
            </p>
            <Button variant="link" onClick={() => coursesQuery.refetch()}>
              Try Again
            </Button>
          </div>
        ) : coursesQuery.isLoading ? (
          // Skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[300px] bg-muted animate-pulse rounded-xl"
            />
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground italic">No courses found.</p>
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={(c) => {
                setCourseToEdit(c);
                setIsDialogOpen(true);
              }}
              onDelete={(id) => setCourseToDelete(course)}
            />
          ))
        )}
      </div>

      {totalItems > 10 && !coursesQuery.isLoading && (
        <div className="flex items-center justify-between pt-6 border-t">
          <span className="text-sm text-muted-foreground">
            Showing {courses.length} of {totalItems} courses
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        title="حذف الدورة"
        description={`هل أنت متأكد من حذف دورة "${courseToDelete?.title}"؟`}
        requireTextConfirm={true}
        itemName={courseToDelete?.title}
      />
    </div>
  );
}
