import { createFileRoute } from "@tanstack/react-router";
import { CourseList } from "@/components/courses/course-list";

export const Route = createFileRoute(
  "/admin/universities/$universityId/$collegeId/$departmentId/$levelId/",
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    return { levelId: params.levelId };
  },
});

function RouteComponent() {
  const { levelId } = Route.useLoaderData();
  return <CourseList levelId={levelId} role="ADMIN" />;
}
