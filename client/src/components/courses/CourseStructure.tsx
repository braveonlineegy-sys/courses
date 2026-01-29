"use client";

import { reorderLessons } from "@/actions/lesson.action";
import { reorderChapters } from "@/actions/chapter.action";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-course";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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
} from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import ChapterForm from "@/components/chapter/ChapterForm";
import LessonForm from "@/components/lesson/LessonForm";
import DeleteLesson from "@/components/lesson/DeleteLesson";
import DeleteChapter from "@/components/chapter/DeleteChapter";
import { QuizButton } from "../quiz/admin/QuizButton";
import { useLanguage } from "@/providers/LanguageContext";

interface IProps {
  data: AdminCourseSingularType;
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
function CourseStructure({ data }: IProps) {
  const { t } = useLanguage();
  const initialItems =
    data.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.position,
      isOpen: true,
      quizzes: chapter.quizzes,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.position,
        isOpen: true,
        description: lesson.description,
        quizzes: lesson.quizzes,
        isFree: lesson.isFree,
      })),
    })) || [];
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems((prevItems) => {
      const updatedItems =
        data.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          order: chapter.position,
          quizzes: chapter.quizzes,
          isOpen:
            prevItems.find((item) => item.id === chapter.id)?.isOpen ?? true,
          lessons: chapter.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.position,
            isOpen: true,
            description: lesson.description,
            quizzes: lesson.quizzes,
            isFree: lesson.isFree,
          })),
        })) || [];

      return updatedItems;
    });
  }, [data]);

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
        className={cn(isDragging ? "z-10" : "", className)}
      >
        {children(listeners)}
      </div>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    //Active is currently being dragged. Over is the target when when we drop
    const { active, over } = event;

    // when  I drop it at the same position
    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    const activeType = active.data.current?.type as "chapter" | "lesson";
    const overType = over.data.current?.type as "chapter" | "lesson";
    const courseId = data.id;

    if (activeType === "chapter") {
      let targetChapterId = null;
      if (overType === "chapter") {
        targetChapterId = overId;
      }
      // if he tried to drag a chapter into another chapter (considering the chapter as a lesson )
      else if (overType === "lesson") {
        targetChapterId = over.data.current?.chapterId ?? null;
      }
      if (!targetChapterId) {
        toast.error("Couldn't determine the chapter for recording");
        return;
      }

      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        toast.error("Couldn't find chapter id for recording");
        return;
      }
      const reorderedLocalChapters = arrayMove(items, oldIndex, newIndex);
      const updatedChaptersForState = reorderedLocalChapters.map(
        (chapter, index) => ({
          ...chapter,
          order: index + 1,
        }),
      );

      const previousItems = [...items];

      setItems(updatedChaptersForState);

      if (courseId) {
        const chaptersToUpdate = updatedChaptersForState.map((chapter) => ({
          id: chapter.id,
          position: chapter.order,
        }));

        const reorderPromise = () =>
          reorderChapters(courseId, chaptersToUpdate);

        toast.promise(reorderPromise(), {
          loading: " Reordering chapters...",
          success: (result) => {
            if (result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems);
            return "Failed to reorder chapters";
          },
        });
      }
      return;
    }

    if (activeType === "lesson" && overType === "lesson") {
      //get the chapter id and over chapter id
      const chapterId = active.data.current?.chapterId;
      const overChapterId = over.data.current?.chapterId;
      if (!chapterId || chapterId !== overChapterId) {
        toast.error(
          "Lesson move between different chapters or invalid ID not allowed",
        );
        return;
      }
      const chapterIndex = items.findIndex(
        (chapter) => chapter.id === chapterId,
      );
      if (chapterIndex === -1) {
        return toast.error("Couldn't find chapter for lesson ");
      }

      const chapterToUpdate = items[chapterIndex];
      const oldLessonIndex = chapterToUpdate.lessons.findIndex(
        (lesson) => lesson.id === activeId,
      );
      const newLessonIndex = chapterToUpdate.lessons.findIndex(
        (lesson) => lesson.id === overId,
      );
      if (oldLessonIndex === -1 || newLessonIndex === -1) {
        return toast.error("Couldn't find lesson for reordering");
      }

      const reorderedLessons = arrayMove(
        chapterToUpdate.lessons,
        oldLessonIndex,
        newLessonIndex,
      );
      const updatedLessonsForState = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));

      const newItems = [...items];
      newItems[chapterIndex] = {
        ...chapterToUpdate,
        lessons: updatedLessonsForState,
      };
      const previousItems = [...items];
      setItems(newItems);
      if (courseId) {
        const lessonsToUpdate = updatedLessonsForState.map((lesson) => ({
          id: lesson.id,
          position: lesson.order,
        }));

        //
        const reorderLessonPromise = () =>
          reorderLessons(chapterId, lessonsToUpdate, courseId);
        toast.promise(reorderLessonPromise(), {
          loading: " Reordering lessons...",
          success: (result) => {
            if (result.status === "success") return result.message;
            throw new Error(result.message);
          },
          error: () => {
            setItems(previousItems);
            return "Failed to reorder lessons";
          },
        });
      }
      return;
    }
  }

  function toggleChapter(chapterId: string) {
    setItems(
      items.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isOpen: !chapter.isOpen }
          : chapter,
      ),
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  //We use rectIntersection to detect collisions between the items and the sensors (It's an algorithm that checks if the items are intersecting with the sensors)
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
    >
      <Card className="w-full">
        <CardHeader className="flex justify-between border-b p-4">
          <CardTitle className="text-lg font-semibold">Chapters</CardTitle>
          <ChapterForm courseId={data.id} />
        </CardHeader>

        <CardContent className="flex w-full flex-col gap-4 space-y-8 overflow-y-auto">
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                data={{ type: "chapter" }}
                className="rounded-md transition-colors"
              >
                {(listeners) => (
                  <Card className="mb-4 w-full border">
                    <Collapsible
                      open={item.isOpen}
                      onOpenChange={() => toggleChapter(item.id)}
                      className="w-full"
                    >
                      {/* Chapters */}
                      <div className="flex items-center justify-between rounded-t-md p-3">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="flex-shrink-0 cursor-grab active:cursor-grabbing"
                            {...listeners}
                            aria-label={`Drag to reorder chapter ${item.title}`}
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="flex-shrink-0"
                              aria-label={
                                item.isOpen
                                  ? `Collapse chapter ${item.title}`
                                  : `Expand chapter ${item.title}`
                              }
                            >
                              {item.isOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <span className="truncate text-sm font-medium">
                            {item.title}
                          </span>
                        </div>
                        <DeleteChapter
                          courseId={data.id}
                          chapterId={item.id}
                          chapterName={item.title}
                        />

                        {item.quizzes.length === 0 ? (
                          <QuizButton
                            quizType="CHAPTER"
                            courseId={data.id}
                            chapterId={item.id}
                            existingQuiz={item.quizzes[0]}
                          />
                        ) : (
                          <Link
                            className={buttonVariants()}
                            href={`/admin/courses/${data.id}/${item.id}`}
                          >
                            {t("admin.course_edit.update_quiz")}
                          </Link>
                        )}
                      </div>

                      {/* Lessons */}
                      <CollapsibleContent className="space-y-2 rounded-b-md px-3 py-2">
                        <SortableContext
                          items={item.lessons.map((lesson) => lesson.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {item.lessons.map((lesson) => (
                            <SortableItem
                              key={lesson.id}
                              id={lesson.id}
                              data={{ type: "lesson", chapterId: item.id }}
                              className="w-full rounded-md transition-colors"
                            >
                              {(lessonListeners) => (
                                <div className="flex w-full flex-col gap-2 rounded-md border p-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="flex-shrink-0 cursor-grab active:cursor-grabbing"
                                      {...lessonListeners}
                                      aria-label={`Drag to reorder lesson ${lesson.title}`}
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </Button>
                                    <FileTextIcon className="h-4 w-4 flex-shrink-0" />
                                    <Link
                                      href={`/admin/courses/${data.id}/${item.id}/${lesson.id}`}
                                      className="min-w-0 flex-1 text-sm font-medium hover:text-blue-600"
                                    >
                                      <span className="block truncate sm:inline">
                                        {lesson.title}
                                      </span>
                                    </Link>
                                  </div>
                                  <div className="flex flex-shrink-0 items-center justify-end gap-1">
                                    <DeleteLesson
                                      lessonId={lesson.id}
                                      chapterId={item.id}
                                      courseId={data.id}
                                    />

                                    {/* Quiz for lessons */}
                                    {lesson.quizzes.length === 0 ? (
                                      <QuizButton
                                        quizType="LESSON"
                                        courseId={data.id}
                                        chapterId={item.id}
                                        lessonId={lesson.id}
                                      />
                                    ) : (
                                      <Link
                                        className={buttonVariants({
                                          size: "sm",
                                        })}
                                        href={`/admin/courses/${data.id}/${item.id}/${lesson.id}/quiz`}
                                      >
                                        {t("admin.course_edit.update_quiz")}
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              )}
                            </SortableItem>
                          ))}
                        </SortableContext>

                        <LessonForm chapterId={item.id} courseId={data.id} />
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </DndContext>
  );
}

export default CourseStructure;
