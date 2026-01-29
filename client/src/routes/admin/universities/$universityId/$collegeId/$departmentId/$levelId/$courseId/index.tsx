import CourseStructure from "@/components/courses/CourseStructure";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/admin/universities/$universityId/$collegeId/$departmentId/$levelId/$courseId/",
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    return { courseId: params.courseId };
  },
});

function RouteComponent() {
  const { courseId } = Route.useLoaderData();
  return <CourseStructure courseId={courseId} />;
}
