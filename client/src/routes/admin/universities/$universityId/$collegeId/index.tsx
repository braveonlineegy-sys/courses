import { createFileRoute } from "@tanstack/react-router";
import { DepartmentList } from "@/components/department/DepartmentList";

export const Route = createFileRoute(
  "/admin/universities/$universityId/$collegeId/",
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    return { collegeId: params.collegeId };
  },
});

function RouteComponent() {
  const { collegeId } = Route.useLoaderData();
  return (
    <div className="p-6">
      <DepartmentList collegeId={collegeId} />
    </div>
  );
}
