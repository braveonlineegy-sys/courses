import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil } from "lucide-react";
import { useChapter, type ChapterType } from "@/hooks/use-chapter";

interface ChapterFormProps {
  courseId: string;
  initialData?: ChapterType;
  children?: React.ReactNode;
}

export function ChapterForm({
  courseId,
  initialData,
  children,
}: ChapterFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const { createMutation, updateMutation } = useChapter(courseId);

  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title);
    } else if (open && !initialData) {
      setTitle("");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (initialData) {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: {
          title: title.trim(),
        },
      });
    } else {
      await createMutation.mutateAsync({
        title: title.trim(),
        courseId,
      });
    }

    if (!initialData) setTitle("");
    setOpen(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button size="sm">
            <Plus className="h-4 w-4 ml-1" />
            إضافة فصل
          </Button>
        )}
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "تعديل الفصل" : "إضافة فصل جديد"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الفصل</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الفصل"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
