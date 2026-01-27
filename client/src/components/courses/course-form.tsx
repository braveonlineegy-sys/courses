import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Uploader from "../file-uploader/uploader";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formSchema, type FormValues } from "./course-form-schema";
import { type CourseType } from "@/hooks/use-course";

interface CourseFormProps {
  role: "ADMIN" | "TEACHER";
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading?: boolean;
  initialData?: CourseType;
}

export function CourseForm({
  role,
  onSubmit,
  isLoading,
  initialData,
}: CourseFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData?.title || "",
          description: initialData?.description || "",
          smallDescription: initialData?.smallDescription || "",
          price: initialData?.price || 0,
          duration: initialData?.duration || 1,
          term: initialData?.term || "REGULAR",
          status: initialData?.status || "PUBLISHED",
          fileKey: initialData?.fileKey || undefined,
          pdfLink: initialData?.pdfLink || undefined,
          teacherId: initialData?.teacherId || undefined,
        }
      : {
          title: "",
          description: "",
          smallDescription: "",
          price: 0,
          duration: 1,
          term: "REGULAR",
          status: "PUBLISHED",
          fileKey: undefined,
          pdfLink: undefined,
          teacherId: undefined,
        },
  });

  const handleSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        // Clone data to avoid mutating form state
        const submissionData = { ...data };

        // If fileKey is a string (URL), remove it so backend doesn't try to upload it
        if (typeof submissionData.fileKey === "string") {
          delete (submissionData as any).fileKey;
        }

        // Same for pdfLink
        if (typeof submissionData.pdfLink === "string") {
          delete (submissionData as any).pdfLink;
        }

        await onSubmit(submissionData);
        // If successful, clear storage

        form.reset(); // Reset form state
        toast.success("Course saved successfully");
      } catch (error) {
        console.error("Failed to submit course", error);
        toast.error("Failed to save course");
      }
    });
  };

  const isSubmitting = isLoading || isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.error("Form Validation Errors:", errors);
          toast.error("Please fix the errors in the form");
        })}
        className="space-y-8"
      >
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Introduction to Physics..."
                      {...field}
                    />
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
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
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
                  <Input
                    placeholder="Brief summary for card preview"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Displayed on course cards.</FormDescription>
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
                    placeholder="Detailed course content..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Media Section - Added explicitly as requested */}
          <Card>
            <CardHeader>
              <CardTitle>Course Media</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fileKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Thumbnail Image{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Uploader
                        fileTypeAccepted="image"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pdfLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course PDF (Optional)</FormLabel>
                    <FormControl>
                      <Uploader
                        fileTypeAccepted="pdf"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {role === "ADMIN" && (
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  {/* Removed FormLabel as per instruction */}
                  <TeacherSelect
                    value={field.value}
                    onChange={field.onChange}
                    error={form.formState.errors.teacherId?.message}
                  />
                </FormItem>
              )}
            />
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting
                ? "Saving..."
                : initialData
                  ? "Save Changes"
                  : "Create Course"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
