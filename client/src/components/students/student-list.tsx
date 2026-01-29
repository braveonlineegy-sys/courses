import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal,
  Trash,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  GraduationCap,
  Users,
} from "lucide-react";
import { BanDialog } from "./BanDialog";
import { BulkLevelDialog } from "./bulk-level-dialog";
import { StudentDialog } from "./student-dialog";
import { StudentFilters } from "./student-filters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

export function StudentList() {
  const {
    studentsQuery,
    deleteMutation,
    banMutation,
    unbanMutation,
    bulkUpdateLevelsMutation,
    params,
    setParams,
  } = useStudents();

  const students = studentsQuery.data?.users || [];
  const metadata = studentsQuery.data?.metadata || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const [banStudent, setBanStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkLevelDialog, setShowBulkLevelDialog] = useState(false);

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
    if (banStudent) {
      await banMutation.mutateAsync({ id: banStudent.id, reason });
      setBanStudent(null);
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
      page: 1,
      isBanned: value as "all" | "true" | "false",
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(students.map((s: any) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleBulkLevelChange = async (levelId: string | null) => {
    await bulkUpdateLevelsMutation.mutateAsync({
      userIds: selectedIds,
      levelId,
    });
    setSelectedIds([]);
  };

  const allSelected =
    students.length > 0 && selectedIds.length === students.length;

  if (studentsQuery.isError) {
    return <div>حدث خطأ أثناء تحميل الطلاب</div>;
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header with title and add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">الطلاب</h2>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {metadata.total}
          </Badge>
        </div>
        <StudentDialog />
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-2 flex-wrap">
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

        {/* Status Filter */}
        <Select value={params.isBanned} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[120px]">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="false">نشط</SelectItem>
            <SelectItem value="true">محظور</SelectItem>
          </SelectContent>
        </Select>

        {/* Hierarchy Filters - inline */}
        <StudentFilters
          universityId={params.universityId}
          collegeId={params.collegeId}
          departmentId={params.departmentId}
          levelId={params.levelId}
          onFilterChange={(filters) =>
            setParams({
              universityId: filters.universityId,
              collegeId: filters.collegeId,
              departmentId: filters.departmentId,
              levelId: filters.levelId,
              page: 1,
            })
          }
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>تم اختيار {selectedIds.length} طالب</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkLevelDialog(true)}
          >
            <GraduationCap className="h-4 w-4 ml-2" />
            تغيير المستوى
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            إلغاء التحديد
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[80px] text-right">الصورة</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">المستوى</TableHead>
              <TableHead className="text-right">الكورسات</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentsQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
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
                    <Skeleton className="h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : students.length > 0 ? (
              students.map((student: any) => (
                <TableRow
                  key={student.id}
                  className={
                    student.isBanned ? "bg-muted/50 text-muted-foreground" : ""
                  }
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(student.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(student.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={student.image || ""} />
                      <AvatarFallback>
                        {student.name?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to="/admin/students/$studentId"
                      params={{ studentId: student.id }}
                      className="hover:underline text-primary"
                    >
                      {student.name || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    {student.level ? (
                      <span className="text-sm">
                        {student.level.name}
                        {student.level.department && (
                          <span className="text-muted-foreground text-xs block">
                            {student.level.department.name}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">غير محدد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {student._count?.courseAccesses || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {student.isBanned ? (
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
                        <DropdownMenuSeparator />
                        {student.isBanned ? (
                          <DropdownMenuItem
                            onClick={() => handleUnban(student.id)}
                            className="flex justify-end gap-2 cursor-pointer"
                          >
                            فك الحظر <CheckCircle className="h-4 w-4" />
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              setBanStudent({
                                id: student.id,
                                name: student.name || "",
                              })
                            }
                            className="text-destructive flex justify-end gap-2 cursor-pointer"
                          >
                            حظر الطالب <Ban className="h-4 w-4" />
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={() => handleDelete(student.id)}
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
                  colSpan={8}
                  className="text-center h-24 text-muted-foreground"
                >
                  لا يوجد طلاب.
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

      {banStudent && (
        <BanDialog
          isOpen={!!banStudent}
          onClose={() => setBanStudent(null)}
          onConfirm={handleBan}
          isLoading={banMutation.isPending}
          studentName={banStudent.name}
        />
      )}

      <BulkLevelDialog
        isOpen={showBulkLevelDialog}
        onClose={() => setShowBulkLevelDialog(false)}
        onConfirm={handleBulkLevelChange}
        isLoading={bulkUpdateLevelsMutation.isPending}
        selectedCount={selectedIds.length}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        title="حذف الطالب"
        description="هل أنت متأكد من رغبتك في حذف هذا الطالب؟
         اكتب كلمة (تأكيد) للمتابعة."
        requireTextConfirm={true}
      />
    </div>
  );
}
