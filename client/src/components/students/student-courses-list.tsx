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
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { StudentDetailsType } from "@/hooks/use-students";

interface StudentCoursesListProps {
  courses: StudentDetailsType["courseAccesses"];
}

const accessMethodLabels: Record<string, string> = {
  QR: "كود QR",
  PAYMENT: "دفع",
  REQUEST: "طلب انضمام",
};

export function StudentCoursesList({ courses }: StudentCoursesListProps) {
  const now = new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle>الكورسات المشترك فيها</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">عنوان الكورس</TableHead>
              <TableHead className="text-right">المعلم</TableHead>
              <TableHead className="text-right">السنة الدراسية</TableHead>
              <TableHead className="text-right">طريقة الاشتراك</TableHead>
              <TableHead className="text-right">تاريخ البدء</TableHead>
              <TableHead className="text-right">تاريخ الانتهاء</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses && courses.length > 0 ? (
              courses.map((access) => {
                const isExpired = new Date(access.expiresAt) < now;
                const isActive = access.isActive && !isExpired;

                return (
                  <TableRow key={access.id}>
                    <TableCell className="font-medium">
                      {access.course.title}
                    </TableCell>
                    <TableCell>{access.course.teacher?.name || "-"}</TableCell>
                    <TableCell>{access.course.level?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {accessMethodLabels[access.grantedBy] ||
                          access.grantedBy}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(access.startsAt), "dd/MM/yyyy", {
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(access.expiresAt), "dd/MM/yyyy", {
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell>
                      {isActive ? (
                        <Badge variant="default" className="bg-green-600">
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="secondary">منتهي</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  لا يوجد كورسات لهذا الطالب بعد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
