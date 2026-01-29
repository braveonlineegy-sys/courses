import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";
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
import { passwordSchema } from "shared";

const studentSchema = z.object({
  name: z.string().min(2, "يجب أن يكون الاسم حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.union([passwordSchema, z.literal("")]).optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentDialogProps {
  student?: {
    id: string;
    name: string | null;
    email: string;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function StudentDialog({
  student,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: StudentDialogProps) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const isEditing = !!student;

  // Create Student
  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role: "USER";
    }) => {
      const res = await client.api.admin.users.$post({ json: data });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).message || "Failed to create student");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم إضافة الطالب بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  // Update Student
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      json,
    }: {
      id: string;
      json: { name?: string; email?: string };
    }) => {
      const res = await client.api.admin.users[":id"].$patch({
        param: { id },
        json,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).message || "Failed to update student");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم تحديث بيانات الطالب");
    },
    onError: (err) => toast.error(err.message),
  });

  // Change Password
  const changePasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await client.api.admin.users[":id"].password.$patch({
        param: { id },
        json: { password },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).message || "Failed to change password");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور");
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(
      studentSchema.refine((data) => isEditing || !!data.password, {
        message: "كلمة المرور مطلوبة",
        path: ["password"],
      }),
    ),
    defaultValues: {
      name: student?.name || "",
      email: student?.email || "",
      password: "",
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name || "",
        email: student.email || "",
        password: "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
      });
    }
  }, [student, form]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      if (isEditing && student) {
        // Update basic info
        await updateMutation.mutateAsync({
          id: student.id,
          json: { name: data.name, email: data.email },
        });

        // Update password if provided
        if (data.password && data.password.trim() !== "") {
          await changePasswordMutation.mutateAsync({
            id: student.id,
            password: data.password,
          });
        }

        setOpen(false);
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password!,
          role: "USER",
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
              <Plus className="ml-2 h-4 w-4" /> إضافة طالب جديد
            </Button>
          </DialogTrigger>
        )
      )}

      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>
            {isEditing ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
          </DialogTitle>
          <DialogDescription className="text-right">
            {isEditing
              ? "تعديل البيانات الأساسية وكلمة المرور."
              : "إضافة طالب جديد للنظام."}
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
                      placeholder="student@example.com"
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
                {isEditing ? "حفظ التغييرات" : "إضافة الطالب"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
