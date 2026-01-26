import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, type CreateCourse } from "shared";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { TeacherSelect } from "./teacher-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const STORAGE_KEY = "course-form-draft";

interface CourseFormProps {
  role: "ADMIN" | "TEACHER";
  onSubmit: (data: CreateCourse) => Promise<void>;
  isLoading?: boolean;
}

export function CourseForm({ role, onSubmit, isLoading }: CourseFormProps) {
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

  // Load draft from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // We set the form values. Note: We might want to be careful if schema changes.
        // For now, we trust the stored data corresponds to the shape.
        form.reset(parsed);
      } catch (e) {
        console.error("Failed to parse saved course draft", e);
      }
    }
  }, [form]);

  // Save changes to local storage
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: CreateCourse) => {
    try {
      await onSubmit(data); // If teacher, teacherId is undefined, which is allowed by schema now
      // If successful, clear storage
      localStorage.removeItem(STORAGE_KEY);
      form.reset(); // Reset form state
    } catch (error) {
      console.error("Failed to submit course", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </Form>
  );
}
