import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUniversity, updateUniversity } from "shared";
import { useUniversity } from "@/hooks/use-university";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // أو Checkbox حسب الـ UI بتاعك
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UniversityType } from "@/hooks/use-university";

interface UniversityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  university?: UniversityType | null;
}

export function UniversityDialog({
  open,
  onOpenChange,
  university,
}: UniversityDialogProps) {
  const isEditing = !!university;
  const { createMutation, updateMutation } = useUniversity();

  const form = useForm({
    resolver: zodResolver(isEditing ? updateUniversity : createUniversity),
    defaultValues: isEditing
      ? {
          name: university?.name,
          isActive: university?.isActive,
        }
      : {
          name: "",
          isActive: true,
        },
  });

  const onSubmit = (values: any) => {
    const options = {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    };

    if (isEditing && university) {
      updateMutation.mutate({ id: university.id, json: values }, options);
    } else {
      createMutation.mutate(values, options);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">
            {isEditing ? "تعديل بيانات الجامعة" : "إضافة جامعة جديدة"}
          </DialogTitle>
          <DialogDescription className="text-right">
            {isEditing
              ? "تعديل بيانات وموجز حالة الجامعة."
              : "أضف جامعة جديدة إلى المنصة."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* حقل الاسم */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="text-right">
                  <FormLabel>اسم الجامعة</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="جامعة القاهرة"
                      {...field}
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* حقل الحالة (isActive) */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row-reverse items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5 text-right">
                    <FormLabel>حالة النشاط</FormLabel>
                    <FormDescription>
                      تفعيل أو تعطيل ظهور الجامعة للطلاب.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
