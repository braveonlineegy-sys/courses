import { createFileRoute } from "@tanstack/react-router";
import { UniversityList } from "@/components/university/UniversityList";

export const Route = createFileRoute("/admin/universities/")({
  component: UniversitiesPage,
});

function UniversitiesPage() {
  return (
    <div className="p-6">
      <div className=" mb-6">
        <h1 className="text-2xl font-bold">Universities</h1>
      </div>
      <UniversityList />
    </div>
  );
}
