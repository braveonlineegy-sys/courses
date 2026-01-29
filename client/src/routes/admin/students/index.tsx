import { createFileRoute } from "@tanstack/react-router";
import { StudentList } from "@/components/students/student-list";

export const Route = createFileRoute("/admin/students/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <StudentList />;
}
