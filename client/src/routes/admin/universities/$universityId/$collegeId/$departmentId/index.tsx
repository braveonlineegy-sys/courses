import { createFileRoute } from "@tanstack/react-router";
import { LevelList } from "@/components/level/LevelList";

export const Route = createFileRoute(
  "/admin/universities/$universityId/$collegeId/$departmentId/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { departmentId } = Route.useParams();
  return <LevelList departmentId={departmentId} />;
}
