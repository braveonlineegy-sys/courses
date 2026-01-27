import { useState } from "react";
import { useCourse } from "@/hooks/use-course";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CourseForm } from "./course-form";

interface CourseDialogProps {
  role: "ADMIN" | "TEACHER";
  levelId?: string;
  teacherId?: string;
  initialData?: any; // Should be CourseType
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function CourseDialog({
  role,
  levelId,
  teacherId,
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onClose,
}: CourseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { createMutation, updateMutation } = useCourse();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      setControlledOpen?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
    if (!newOpen) {
      onClose?.();
    }
  };

  const onSubmit = async (data: any) => {
    if (initialData) {
      // Handle Update
      await updateMutation.mutateAsync({
        id: initialData.id,
        json: data, // useCourse hook handles 'form' conversion now
      });
      setOpen(false);
    } else {
      // Handle Create
      // Inject levelId if present (for Admin view context)
      const payload = { ...data };
      if (levelId) {
        payload.levelId = levelId;
      }

      // Force teacherId if provided (e.g. creating from teacher's own list)
      if (teacherId && role === "TEACHER") {
        payload.teacherId = teacherId;
      }

      await createMutation.mutateAsync(payload);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="ml-2 h-4 w-4" /> Add Course
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        forceMount
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Course" : "Create New Course"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update course details."
              : "Add a new course to the platform."}
          </DialogDescription>
        </DialogHeader>

        <CourseForm
          role={role}
          onSubmit={onSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
