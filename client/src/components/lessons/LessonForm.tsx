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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useLesson, type LessonType } from "@/hooks/use-lesson";
import Uploader from "../file-uploader/uploader";

interface LessonFormProps {
  chapterId: string;
  initialData?: LessonType;
  children?: React.ReactNode;
}

export function LessonForm({
  chapterId,
  initialData,
  children,
}: LessonFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [video, setVideo] = useState(initialData?.video || "");
  const [pdfLink, setPdfLink] = useState<string | File | undefined>(
    initialData?.pdfLink || "",
  );
  const [thumbnail, setThumbnail] = useState<string | File | undefined>(
    initialData?.thumbnail || "",
  );
  const [isFree, setIsFree] = useState(initialData?.isFree || false);

  const { createMutation, updateMutation } = useLesson(chapterId);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setVideo(initialData.video || "");
        setPdfLink(initialData.pdfLink || "");
        setThumbnail(initialData.thumbnail || "");
        setIsFree(initialData.isFree || false);
      } else {
        setTitle("");
        setDescription("");
        setVideo("");
        setPdfLink("");
        setThumbnail("");
        setIsFree(false);
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const prepareValue = (val: string | File | undefined) => {
      if (typeof val === "string") return val.trim() || undefined;
      return val || undefined;
    };

    if (initialData) {
      await updateMutation.mutateAsync({
        id: initialData.id,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          video: video.trim() || undefined,
          pdfLink: prepareValue(pdfLink),
          thumbnail: prepareValue(thumbnail),
          isFree,
        },
      });
    } else {
      await createMutation.mutateAsync({
        title: title.trim(),
        chapterId,
        description: description.trim() || undefined,
        video: video.trim() || undefined,
        pdfLink: prepareValue(pdfLink),
        thumbnail: prepareValue(thumbnail),
        isFree,
      });
    }

    if (!initialData) {
      setTitle("");
      setDescription("");
      setVideo("");
      setPdfLink("");
      setThumbnail("");
      setIsFree(false);
    }
    setOpen(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 ml-1" />
            إضافة درس
          </Button>
        )}
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "تعديل الدرس" : "إضافة درس جديد"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الدرس</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان الدرس"
              required
            />
          </div>
          {/* ... other fields ... */}
          <div className="space-y-2">
            <Label htmlFor="description">وصف الدرس (اختياري)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف الدرس"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">رابط الفيديو (اختياري)</Label>
            <Input
              id="video"
              type="url"
              value={video}
              onChange={(e) => setVideo(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdfLink">رابط PDF (اختياري)</Label>
            <Uploader
              fileTypeAccepted="pdf"
              value={pdfLink}
              onChange={setPdfLink}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnail">رابط الصورة المصغرة (اختياري)</Label>
            <Uploader
              fileTypeAccepted="image"
              value={thumbnail}
              onChange={setThumbnail}
            />
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch id="isFree" checked={isFree} onCheckedChange={setIsFree} />
            <Label htmlFor="isFree">درس مجاني (معاينة)</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
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
