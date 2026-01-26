import { type CreateCourse } from "shared";
import { useCourse } from "@/hooks/use-course";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseForm } from "./course-form";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "ADMIN" | "TEACHER";
  levelId?: string;
  teacherId?: string;
}

export function CourseDialog({
  open,
  onOpenChange,
  role,
  levelId,
  teacherId,
}: CourseDialogProps) {
  const { createMutation } = useCourse();

  const handleSubmit = async (data: CreateCourse) => {
    // If teacher, ensure teacherId is undefined (or handled by backend context if needed, but here schema allows it)
    // If admin, teacherId should be in data

    // Inject levelId if present (for Admin view)
    const payload = { ...data };
    if (levelId) {
      payload.levelId = levelId;
    }
    // If Teacher view, we likely filter by teacherId in list, but creation usually associates with current user on backend.
    // However, for now, let's assume teacher creation is sufficient or backend handles it.
    // Wait, the schema requires teacherId.
    // If Role is Teacher, we need to pass their ID.
    // But usually backend infers from session.
    // Let's check `createCourse` in service.
    // It takes data including teacherId.
    // If we are Teacher, we might need to pass it, OR backend middleware sets it.
    // Current service: `data.teacherId` is used directly.
    // Current controller: `createCourseValidator` validates body.
    // `auth.middleware` adds user to context.
    // We should probably inject current user ID if role is teacher, or let backend do it.
    // For now, let's pass it if available (from prop).
    if (teacherId && role === "TEACHER") {
      payload.teacherId = teacherId;
    }

    await createMutation.mutateAsync(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to the platform.
          </DialogDescription>
        </DialogHeader>
        <CourseForm
          role={role}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
