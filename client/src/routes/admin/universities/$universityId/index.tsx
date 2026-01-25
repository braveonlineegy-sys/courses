import { createFileRoute } from "@tanstack/react-router";
import { CollegeList } from "@/components/college/CollegeList";

export const Route = createFileRoute("/admin/universities/$universityId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { universityId } = params;
    return { universityId };
  },
});

function RouteComponent() {
  const { universityId } = Route.useLoaderData();
  return (
    <div className="p-6">
      <CollegeList universityId={universityId} />
    </div>
  );
}
