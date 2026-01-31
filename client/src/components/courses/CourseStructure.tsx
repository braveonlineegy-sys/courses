import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  FileTextIcon,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { ReactNode } from "react";
import { ChapterForm } from "@/components/chapters/ChapterForm";
import { LessonForm } from "@/components/lessons/LessonForm";
import { useChapter, ChapterType } from "@/hooks/use-chapter";
import { useLesson, LessonType } from "@/hooks/use-lesson";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CourseStructureProps {
  courseId: string;
}

interface SortableItemProps {
  id: string;
  children: (listeners: DraggableSyntheticListeners) => ReactNode;
  className?: string;
  data?: {
    type: "chapter" | "lesson";
    chapterId?: string;
  };
}

function SortableItem({ id, children, className, data }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`${isDragging ? "z-10 opacity-50" : ""} ${className || ""}`}
    >
      {children(listeners)}
    </div>
  );
}

interface ChapterItemProps {
  chapter: ChapterType & { lessons?: LessonType[] };
  courseId: string;
  isOpen: boolean;
  onToggle: () => void;
  listeners: DraggableSyntheticListeners;
}

function ChapterItem({
  chapter,
  courseId,
  isOpen,
  onToggle,
  listeners,
}: ChapterItemProps) {
  const { deleteMutation: deleteChapterMutation } = useChapter(courseId);
  const {
    deleteMutation: deleteLessonMutation,
    reorderMutation: reorderLessonMutation,
  } = useLesson(chapter.id);

  const lessons = (chapter as any).lessons || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l: LessonType) => l.id === active.id);
    const newIndex = lessons.findIndex((l: LessonType) => l.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(lessons, oldIndex, newIndex);
    const lessonsToUpdate = reordered.map(
      (lesson: LessonType, index: number) => ({
        id: lesson.id,
        position: index + 1,
      }),
    );

    reorderLessonMutation.mutate({
      chapterId: chapter.id,
      lessons: lessonsToUpdate,
    });
  };

  return (
    <Card className="mb-4 w-full border">
      <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full">
        <div className="flex items-center justify-between rounded-t-md p-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 cursor-grab active:cursor-grabbing"
              {...listeners}
              aria-label={`إعادة ترتيب الفصل ${chapter.title}`}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                aria-label={
                  isOpen ? `طي ${chapter.title}` : `توسيع ${chapter.title}`
                }
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <span className="truncate text-sm font-medium">
              {chapter.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ChapterForm courseId={courseId} initialData={chapter}>
              <Button size="icon" variant="ghost" aria-label="تعديل الفصل">
                <Pencil className="h-4 w-4" />
              </Button>
            </ChapterForm>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف الفصل</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد من حذف الفصل "{chapter.title}"؟ سيتم حذف جميع
                    الدروس المرتبطة به.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteChapterMutation.mutate(chapter.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <CollapsibleContent className="space-y-2 rounded-b-md px-3 py-2">
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={lessons.map((l: LessonType) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {lessons.map((lesson: LessonType) => (
                <SortableItem
                  key={lesson.id}
                  id={lesson.id}
                  data={{ type: "lesson", chapterId: chapter.id }}
                  className="w-full rounded-md transition-colors"
                >
                  {(lessonListeners) => (
                    <div className="flex w-full flex-col gap-2 rounded-md border p-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 cursor-grab active:cursor-grabbing"
                          {...lessonListeners}
                          aria-label={`إعادة ترتيب الدرس ${lesson.title}`}
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                        <FileTextIcon className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <LessonForm chapterId={chapter.id} initialData={lesson}>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="تعديل الدرس"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </LessonForm>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف الدرس</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف الدرس "{lesson.title}"؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteLessonMutation.mutate(lesson.id)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <LessonForm chapterId={chapter.id} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function CourseStructure({ courseId }: CourseStructureProps) {
  const { chapters, isLoading, reorderMutation } = useChapter(courseId);
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Open all chapters by default
    const initialOpen: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      if (openChapters[ch.id] === undefined) {
        initialOpen[ch.id] = true;
      }
    });
    if (Object.keys(initialOpen).length > 0) {
      setOpenChapters((prev) => ({ ...prev, ...initialOpen }));
    }
  }, [chapters]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleChapterDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    if (activeType !== "chapter") return;

    const oldIndex = chapters.findIndex((ch) => ch.id === active.id);
    const newIndex = chapters.findIndex((ch) => ch.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(chapters, oldIndex, newIndex);
    const chaptersToUpdate = reordered.map((chapter, index) => ({
      id: chapter.id,
      position: index + 1,
    }));

    reorderMutation.mutate({
      courseId,
      chapters: chaptersToUpdate,
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <span className="text-muted-foreground">جاري التحميل...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleChapterDragEnd}
    >
      <Card className="w-full" dir="rtl">
        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
          <CardTitle className="text-lg font-semibold">الفصول</CardTitle>
          <ChapterForm courseId={courseId} />
        </CardHeader>

        <CardContent className="flex w-full flex-col gap-4 space-y-4 p-4">
          {chapters.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد فصول بعد. أضف فصلاً جديداً للبدء.
            </p>
          ) : (
            <SortableContext
              items={chapters.map((ch) => ch.id)}
              strategy={verticalListSortingStrategy}
            >
              {chapters.map((chapter) => (
                <SortableItem
                  key={chapter.id}
                  id={chapter.id}
                  data={{ type: "chapter" }}
                  className="rounded-md transition-colors"
                >
                  {(listeners) => (
                    <ChapterItem
                      chapter={chapter}
                      courseId={courseId}
                      isOpen={openChapters[chapter.id] ?? true}
                      onToggle={() => toggleChapter(chapter.id)}
                      listeners={listeners}
                    />
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          )}
        </CardContent>
      </Card>
    </DndContext>
  );
}

export default CourseStructure;
