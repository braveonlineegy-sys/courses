import { createFileRoute } from "@tanstack/react-router";
import { TeacherList } from "@/components/teachers/teacher-list";

export const Route = createFileRoute("/admin/teachers/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-4">
      <TeacherList />
    </div>
  );
}
