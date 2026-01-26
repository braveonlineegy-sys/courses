import { useState } from "react";
import { useTeachers } from "@/hooks/use-teachers";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { TeacherDialog } from "./teacher-dialog";
import { BanDialog } from "./BanDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

export function TeacherList() {
  const {
    teachersQuery,
    deleteMutation,
    banMutation,
    unbanMutation,
    params,
    setParams,
  } = useTeachers();

  const teachers = teachersQuery.data?.users || [];
  const metadata = teachersQuery.data?.metadata || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [banTeacher, setBanTeacher] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleBan = async (reason: string) => {
    if (banTeacher) {
      await banMutation.mutateAsync({ id: banTeacher.id, reason });
      setBanTeacher(null);
    }
  };

  const handleUnban = async (id: string) => {
    await unbanMutation.mutateAsync(id);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= metadata.totalPages) {
      setParams((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 1, // Reset to first page on filter change
      isBanned: value as "all" | "true" | "false",
    }));
  };

  if (teachersQuery.isError) {
    return <div>حدث خطأ أثناء تحميل المعلمين</div>;
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">المعلمين</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="بحث..."
              value={params.search || ""}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              className="w-[200px]"
            />
          </div>
          <Select value={params.isBanned} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="false">نشط</SelectItem>
              <SelectItem value="true">محظور</SelectItem>
            </SelectContent>
          </Select>
          <TeacherDialog />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-right">الصورة</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">كلمة المرور</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachersQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : teachers.length > 0 ? (
              teachers.map((teacher: any) => (
                <TableRow
                  key={teacher.id}
                  className={
                    teacher.isBanned ? "bg-muted/50 text-muted-foreground" : ""
                  }
                >
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={teacher.image || ""} />
                      <AvatarFallback>
                        {teacher.name?.[0] || "T"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to="/admin/teachers/$teacherId"
                      params={{ teacherId: teacher.id }}
                      className="hover:underline text-primary"
                    >
                      {teacher.name || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>******</TableCell>
                  <TableCell>
                    {teacher.isBanned ? (
                      <Badge variant="destructive">محظور</Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 hover:bg-green-100/80"
                      >
                        نشط
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-right">
                          الإجراءات
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setEditingTeacher(teacher)}
                          className="flex justify-end gap-2 cursor-pointer"
                        >
                          تعديل البيانات <Pencil className="h-4 w-4" />
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        {teacher.isBanned ? (
                          <DropdownMenuItem
                            onClick={() => handleUnban(teacher.id)}
                            className="flex justify-end gap-2 cursor-pointer"
                          >
                            فك الحظر <CheckCircle className="h-4 w-4" />
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              setBanTeacher({
                                id: teacher.id,
                                name: teacher.name || "",
                              })
                            }
                            className="text-destructive flex justify-end gap-2 cursor-pointer"
                          >
                            حظر المعلم <Ban className="h-4 w-4" />
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => handleDelete(teacher.id)}
                          className="text-destructive flex justify-end gap-2 cursor-pointer"
                        >
                          حذف <Trash className="h-4 w-4" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  لا يوجد معلمين.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {metadata.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            صفحة {metadata.page} من {metadata.totalPages}
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(metadata.page - 1)}
              disabled={metadata.page <= 1}
            >
              <ChevronRight className="h-4 w-4 ml-2" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(metadata.page + 1)}
              disabled={metadata.page >= metadata.totalPages}
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      )}

      {editingTeacher && (
        <TeacherDialog
          teacher={editingTeacher}
          open={!!editingTeacher}
          onOpenChange={(open) => !open && setEditingTeacher(null)}
        />
      )}

      {banTeacher && (
        <BanDialog
          isOpen={!!banTeacher}
          onClose={() => setBanTeacher(null)}
          onConfirm={handleBan}
          isLoading={banMutation.isPending}
          teacherName={banTeacher.name}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        title="حذف المعلم"
        description="هل أنت متأكد من رغبتك في حذف هذا المعلم؟ سيتم حذف جميع الكورسات المرتبطة به.
         اكتب كلمة (تأكيد) للمتابعة."
        requireTextConfirm={true}
      />
    </div>
  );
}
