import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDepartment, updateDepartment } from "shared";
import { useDepartment } from "@/hooks/use-department";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: any;
  collegeId: string;
}

export function DepartmentDialog({
  open,
  onOpenChange,
  department,
  collegeId,
}: DepartmentDialogProps) {
  const isEditing = !!department;
  const { createMutation, updateMutation } = useDepartment(collegeId);

  const form = useForm({
    resolver: zodResolver(
      isEditing
        ? updateDepartment.omit({ id: true, collegeId: true })
        : createDepartment.omit({ id: true, collegeId: true }),
    ),
    defaultValues: {
      name: department?.name || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: department?.name || "",
      });
    }
  }, [open, department, form]);

  const onSubmit = (values: any) => {
    const options = {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    };

    if (isEditing && department) {
      updateMutation.mutate(
        {
          id: department.id,
          json: {
            name: values.name,
            collegeId: collegeId,
          },
        },
        options,
      );
    } else {
      createMutation.mutate(
        {
          name: values.name,
          collegeId: collegeId,
        },
        options,
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">
            {isEditing ? "تعديل بيانات القسم" : "إضافة قسم جديد"}
          </DialogTitle>
          <DialogDescription className="text-right">
            {isEditing ? "تعديل اسم القسم." : "أضف قسم جديد تابع لهذه الكلية."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="text-right">
                  <FormLabel>اسم القسم</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="هندسة البرمجيات"
                      {...field}
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-2 sm:justify-start">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isPending}
              >
                {isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
