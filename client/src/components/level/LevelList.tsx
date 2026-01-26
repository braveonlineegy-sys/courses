import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useLevel } from "@/hooks/use-level";
import { LevelItem } from "./LevelCard";
import { LevelDialog } from "./LevelDialog";

export function LevelList({ departmentId }: { departmentId: string }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { levelsQuery } = useLevel(departmentId);

  const data = levelsQuery.data?.data;
  // Ensure data is an array, as the API might return it directly or wrapped
  // Based on the hook type: LevelType is from data[number], assuming data is array.
  // But response might be wrapped.
  // Looking at use-level.ts: return res.json();
  // Server returns successResponse(c, result, ...); which is { success, data, message }
  // So data is explicitly levelsQuery.data?.data
  // Wait, if response is array:
  // level.route.ts: return successResponse(c, result, ...) where result is array.
  // Yes.
  const levels = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Levels</h2>
          <p className="text-muted-foreground">
            Manage levels for this department.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          disabled={levelsQuery.isLoading}
        >
          <Plus className="ml-2 h-4 w-4" /> Add Level
        </Button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levelsQuery.isError ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">
              {(levelsQuery.error as Error).message}
            </p>
            <Button variant="link" onClick={() => levelsQuery.refetch()}>
              Try Again
            </Button>
          </div>
        ) : levelsQuery.isLoading ? (
          // Skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))
        ) : levels.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground italic">
              No levels found for this department.
            </p>
          </div>
        ) : (
          levels.map((level) => <LevelItem key={level.id} level={level} />)
        )}
      </div>

      <LevelDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        departmentId={departmentId}
      />
    </div>
  );
}
