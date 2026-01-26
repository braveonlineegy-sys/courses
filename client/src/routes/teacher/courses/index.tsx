import { createFileRoute } from "@tanstack/react-router";
import { CourseList } from "@/components/courses/course-list";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/teacher/courses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return <CourseList teacherId={user.id} role="TEACHER" />;
}
