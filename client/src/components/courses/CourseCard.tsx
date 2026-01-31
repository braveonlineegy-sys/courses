import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, MoreVertical, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type CourseType } from "@/hooks/use-course";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";

interface CourseCardProps {
  course: CourseType;
  onEdit?: (course: CourseType) => void;
  onDelete?: (courseId: string) => void;
  role?: "admin" | "teacher";
  // For admin navigation - hierarchy IDs
  universityId?: string;
  collegeId?: string;
  departmentId?: string;
  levelId?: string;
}

export function CourseCard({
  course,
  onEdit,
  onDelete,
  role,
  universityId,
  collegeId,
  departmentId,
  levelId,
}: CourseCardProps) {
  // Build navigation URL based on role
  const getCourseUrl = () => {
    if (
      role === "admin" &&
      universityId &&
      collegeId &&
      departmentId &&
      levelId
    ) {
      return `/admin/universities/${universityId}/${collegeId}/${departmentId}/${levelId}/${course.id}`;
    }
    if (role === "teacher") {
      return `/teacher/courses/${course.id}`;
    }
    return undefined;
  };

  const courseUrl = getCourseUrl();
  // Clean image URL logic
  const imageUrl = course.fileKey?.startsWith("http")
    ? course.fileKey
    : course.fileKey
      ? `https://utfs.io/f/${course.fileKey}`
      : null;

  const cardContent = (
    <Card className="group relative flex flex-col overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
      {/* 1. Image Section with Grayscale Hover Effect */}
      <div className="aspect-video overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={course.title}
            className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <BookOpen className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}

        {/* Floating Badge & Actions */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none font-bold shadow-sm">
              {course.status}
            </Badge>

            <div className="pointer-events-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full   transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(course)}>
                    <Pencil className="mr-2 h-4 w-4" /> تعديل
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(course.id)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" /> حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Section with better Typography */}
      <CardHeader className="flex-1 space-y-3 pt-6">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-primary">
          <span>{course.duration} Hours</span>
        </div>

        <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {course.smallDescription ||
            "Explore the fundamentals and advanced techniques in this comprehensive course."}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-3 text-sm">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarImage src={course.teacher?.image || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
              {course.teacher?.name?.charAt(0) || "T"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-muted-foreground">
            {course.teacher?.name}
          </span>
        </div>
      </CardContent>

      {/* 3. Footer with Strong CTA */}
      <CardFooter className="flex-col gap-4 border-t bg-muted/5 p-6 pt-4">
        <div className="flex w-full items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground">
              {course.price === 0 ? "Free" : `${course.price} EGP`}
            </span>
            {course.price !== 0 && (
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                total
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>{course._count?.chapters || 0} Lessons</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );

  // Wrap with Link if courseUrl exists
  if (courseUrl) {
    return (
      <Link to={courseUrl} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
