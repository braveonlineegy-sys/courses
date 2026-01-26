import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, MoreVertical, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type CourseType } from "@/hooks/use-course";

interface CourseCardProps {
  course: CourseType;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all">
      <div className="aspect-video w-full bg-muted relative">
        {course.fileKey ? (
          <img
            src={`https://utfs.io/f/${course.fileKey}`}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant={course.status === "PUBLISHED" ? "default" : "secondary"}
          >
            {course.status}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <span className="flex items-center cursor-not-allowed opacity-50">
                  <Pencil className="mr-2 h-4 w-4" /> تعديل
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash className="mr-2 h-4 w-4" /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.smallDescription}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <span className="font-medium text-foreground">
            {course._count?.chapters || 0} chapters
          </span>
          •
          <span className="font-medium text-foreground">
            {course.duration} hours
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t bg-muted/50 flex justify-between items-center">
        <div className="font-bold text-lg">
          {course.price === 0 ? "Free" : `${course.price} EGP`}
        </div>
        {course.teacher && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
              {course.teacher.image && (
                <img
                  src={course.teacher.image}
                  alt={course.teacher.name || ""}
                />
              )}
            </div>
            <span className="max-w-[100px] truncate">
              {course.teacher.name}
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
