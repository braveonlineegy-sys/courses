import { createFileRoute } from "@tanstack/react-router";
import { CourseList } from "@/components/courses/course-list";

export const Route = createFileRoute(
  "/admin/universities/$universityId/$collegeId/$departmentId/$levelId/",
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    return {
      universityId: params.universityId,
      collegeId: params.collegeId,
      departmentId: params.departmentId,
      levelId: params.levelId,
    };
  },
});

function RouteComponent() {
  const { universityId, collegeId, departmentId, levelId } =
    Route.useLoaderData();
  return (
    <CourseList
      levelId={levelId}
      role="ADMIN"
      universityId={universityId}
      collegeId={collegeId}
      departmentId={departmentId}
    />
  );
}
