import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTeachers } from "@/hooks/use-teachers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schema for Create/Update
import { passwordSchema } from "shared";

const teacherSchema = z.object({
  name: z.string().min(2, "يجب أن يكون الاسم حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.union([passwordSchema, z.literal("")]).optional(),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface TeacherDialogProps {
  teacher?: {
    id: string;
    name: string | null;
    email: string;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function TeacherDialog({
  teacher,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: TeacherDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const { createMutation, updateMutation, changePasswordMutation } =
    useTeachers();
  const isEditing = !!teacher;

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(
      teacherSchema.refine((data) => isEditing || !!data.password, {
        message: "كلمة المرور مطلوبة",
        path: ["password"],
      }),
    ),
    defaultValues: {
      name: teacher?.name || "",
      email: teacher?.email || "",
      password: "",
    },
  });

  useEffect(() => {
    if (teacher) {
      form.reset({
        name: teacher.name || "",
        email: teacher.email || "",
        password: "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
      });
    }
  }, [teacher, form]);

  const onSubmit = async (data: TeacherFormValues) => {
    try {
      if (isEditing && teacher) {
        // Update basic info
        await updateMutation.mutateAsync({
          id: teacher.id,
          json: { name: data.name, email: data.email },
        });

        // Update password if provided
        if (data.password && data.password.trim() !== "") {
          await changePasswordMutation.mutateAsync({
            id: teacher.id,
            password: data.password,
          });
        }

        setOpen(false);
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password!, // Safe because of refine validation
          role: "TEACHER",
        });
        form.reset();
        setOpen(false);
      }
    } catch (error: any) {
      console.error(error);
      if (
        error.message === "هذا البريد الإلكتروني مسجل بالفعل" ||
        error.message.includes("email already exists")
      ) {
        form.setError("email", {
          type: "manual",
          message: "هذا البريد الإلكتروني مسجل بالفعل",
        });
      }
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    changePasswordMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        !isEditing && (
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" /> إضافة معلم جديد
            </Button>
          </DialogTrigger>
        )
      )}

      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>
            {isEditing ? "تعديل بيانات المعلم" : "إضافة معلم جديد"}
          </DialogTitle>
          <DialogDescription className="text-right">
            {isEditing
              ? "تعديل البيانات الأساسية وكلمة المرور."
              : "إضافة معلم جديد للنظام."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 text-right"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="الاسم الكامل"
                      {...field}
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="admin@example.com"
                      type="email"
                      {...field}
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="******"
                      type="password"
                      {...field}
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:justify-start">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {isEditing ? "حفظ التغييرات" : "إضافة المعلم"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
