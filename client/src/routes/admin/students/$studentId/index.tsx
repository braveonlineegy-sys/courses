import { createFileRoute } from "@tanstack/react-router";
import { useStudent } from "@/hooks/use-students";

import { StudentDetailsSkeleton } from "@/components/students/student-details-skeleton";
import { StudentProfileHeader } from "@/components/students/student-profile-header";
import { StudentStats } from "@/components/students/student-stats";
import { StudentCoursesList } from "@/components/students/student-courses-list";

export const Route = createFileRoute("/admin/students/$studentId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { studentId } = params;
    return { studentId };
  },
});

function RouteComponent() {
  const { studentId } = Route.useLoaderData();
  const { studentQuery } = useStudent(studentId);

  if (studentQuery.isLoading) {
    return <StudentDetailsSkeleton />;
  }

  if (studentQuery.isError || !studentQuery.data) {
    return <div>حدث خطأ أثناء تحميل بيانات الطالب</div>;
  }

  const student = studentQuery.data;

  // Calculate stats
  const now = new Date();
  const totalCourses = student.courseAccesses?.length || 0;
  const activeCourses =
    student.courseAccesses?.filter(
      (access: any) => access.isActive && new Date(access.expiresAt) > now,
    ).length || 0;
  const completedLessons = student._count?.lessonProgress || 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header / Profile Info */}
      <StudentProfileHeader student={student} />

      {/* Stats Cards */}
      <StudentStats
        totalCourses={totalCourses}
        activeCourses={activeCourses}
        completedLessons={completedLessons}
      />

      {/* Courses List */}
      <StudentCoursesList courses={student.courseAccesses} />
    </div>
  );
}
