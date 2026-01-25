import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/admin/universities/$universityId/$collegeId/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/universities/$universityId/$collegeId/"!</div>;
}
