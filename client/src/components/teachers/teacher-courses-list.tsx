import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TeacherDetailsType } from "@/hooks/use-teachers";

interface TeacherCoursesListProps {
  courses: TeacherDetailsType["coursesCreated"];
}

export function TeacherCoursesList({ courses }: TeacherCoursesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الكورسات التي يقدمها</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">عنوان الكورس</TableHead>
              <TableHead className="text-right">السنة الدراسية</TableHead>
              <TableHead className="text-right">السعر</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">عدد الطلاب</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses && courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.level?.name || "-"}</TableCell>
                  <TableCell>{course.price} ج.م</TableCell>
                  <TableCell>
                    {course.term === "SUMMER" ? "صيفي" : "عادي"}
                  </TableCell>
                  <TableCell>
                    {course.status === "PUBLISHED" ? (
                      <Badge variant="default" className="bg-green-600">
                        منشور
                      </Badge>
                    ) : (
                      <Badge variant="secondary">مؤرشف</Badge>
                    )}
                  </TableCell>
                  <TableCell>{course._count?.accesses || 0}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  لا يوجد كورسات لهذا المعلم بعد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
