import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Layers } from "lucide-react";
import { useLevel } from "@/hooks/use-level";

import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { type LevelType } from "@/hooks/use-level";
import { LevelDialog } from "./LevelDialog";

export function LevelItem({ level }: { level: LevelType }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { deleteMutation } = useLevel();

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md border-muted/60 group cursor-pointer relative">
        <Link
          to="/admin/universities/$universityId/$collegeId/$departmentId/$levelId"
          params={{ 
            universityId: level.department.college.university.id,
            collegeId: level.department.college.id,
            departmentId: level.department.id,
            levelId: level.id,
           }}
          className="absolute inset-0 z-0"
        />
        <CardContent className="p-6 relative z-10 pointer-events-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary/10 transition-colors">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {level.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Order: {level.order}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 px-6 py-3 flex justify-end gap-2 border-t relative z-20">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation
              setIsEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation
              setIsDeleteOpen(true);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <LevelDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        level={level}
        departmentId={level.departmentId}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={level.name}
        isLoading={deleteMutation.isPending}
        requireTextConfirm={true}
        onConfirm={() => {
          deleteMutation.mutate(level.id, {
            onSuccess: () => setIsDeleteOpen(false),
          });
        }}
      />
    </>
  );
}
