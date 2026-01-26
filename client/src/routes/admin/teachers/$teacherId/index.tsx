import { createFileRoute } from "@tanstack/react-router";

import { useTeacher } from "@/hooks/use-teacher";
import { TeacherDetailsSkeleton } from "@/components/teachers/teacher-details-skeleton";
import { TeacherProfileHeader } from "@/components/teachers/teacher-profile-header";
import { TeacherStats } from "@/components/teachers/teacher-stats";
import { TeacherCoursesList } from "@/components/teachers/teacher-courses-list";

export const Route = createFileRoute("/admin/teachers/$teacherId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { teacherId } = params;
    return { teacherId };
  },
});

function RouteComponent() {
  const { teacherId } = Route.useLoaderData();
  const { teacherQuery } = useTeacher(teacherId);

  if (teacherQuery.isLoading) {
    return <TeacherDetailsSkeleton />;
  }

  if (teacherQuery.isError || !teacherQuery.data) {
    return <div>حدث خطأ أثناء تحميل بيانات المعلم</div>;
  }

  const teacher = teacherQuery.data;

  // Calculate stats
  const totalCourses = teacher.coursesCreated?.length || 0;
  const totalStudents =
    teacher.coursesCreated?.reduce(
      (acc: number, course: any) => acc + (course._count?.accesses || 0),
      0,
    ) || 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header / Profile Info */}
      <TeacherProfileHeader teacher={teacher} />

      {/* Stats Cards */}
      <TeacherStats totalCourses={totalCourses} totalStudents={totalStudents} />

      {/* Courses List */}
      <TeacherCoursesList courses={teacher.coursesCreated} />
    </div>
  );
}
