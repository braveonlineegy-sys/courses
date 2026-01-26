import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, type CreateCourse } from "shared";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TeacherSelect } from "./teacher-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CourseDialogProps {
  role: "ADMIN" | "TEACHER";
  levelId?: string;
  teacherId?: string;
}

export function CourseDialog({ role, levelId, teacherId }: CourseDialogProps) {
  const [open, setOpen] = useState(false);
  const { createMutation } = useCourse();

  const form = useForm<CreateCourse>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      smallDescription: "",
      price: 0,
      duration: 1, // Default duration
      term: "REGULAR",
      status: "PUBLISHED",
      fileKey: "placeholder-key", // TODO: Implement file upload
      teacherId: undefined,
    },
  });

  const handleOpenChange = (open: boolean) => {
    // We intentionally DO NOT reset the form on close to persist state
    setOpen(open);
  };

  const onSubmit = async (data: CreateCourse) => {
    // Inject levelId if present (for Admin view)
    const payload = { ...data };
    if (levelId) {
      payload.levelId = levelId;
    }

    if (teacherId && role === "TEACHER") {
      payload.teacherId = teacherId;
    }

    try {
      await createMutation.mutateAsync(payload);
      toast.success("Course created successfully");
      form.reset(); // Only reset on success
      setOpen(false);
    } catch (error) {
      // Error handled by mutation onError or here
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="ml-2 h-4 w-4" /> Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to the platform.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (EGP)</FormLabel>
                    <FormControl>
                      <Input
                        prefix="EGP"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="smallDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed course description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="REGULAR">Regular Term</SelectItem>
                        <SelectItem value="SUMMER">Summer Term</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {role === "ADMIN" && (
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <TeacherSelect
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.teacherId?.message}
                    />
                  </FormItem>
                )}
              />
            )}

            {/* Hidden field for fileKey until upload is implemented */}
            <input type="hidden" {...form.register("fileKey")} />

            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
