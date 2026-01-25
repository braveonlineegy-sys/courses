import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Library } from "lucide-react";
import { useDepartment } from "@/hooks/use-department";
import { DepartmentDialog } from "./DepartmentDialog";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";

export function DepartmentCard({ department }: { department: any }) {
  const params = useParams({
    from: "/admin/universities/$universityId/$collegeId/",
  });
  const { universityId, collegeId } = params as any;

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { deleteMutation } = useDepartment(collegeId);

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md border-muted/60 group cursor-pointer relative">
        <Link
          to="/admin/universities/$universityId/$collegeId/departments/$departmentId"
          params={{ universityId, collegeId, departmentId: department.id }}
          className="absolute inset-0 z-0"
        />

        <CardContent className="p-6 relative z-10 pointer-events-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent-foreground group-hover:bg-accent/20 transition-colors">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {department.name}
                </h3>
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
              e.stopPropagation();
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
              e.stopPropagation();
              setIsDeleteOpen(true);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <DepartmentDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        department={department}
        collegeId={collegeId}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={department.name}
        isLoading={deleteMutation.isPending}
        requireTextConfirm={true}
        onConfirm={() => {
          deleteMutation.mutate(department.id, {
            onSuccess: () => setIsDeleteOpen(false),
          });
        }}
      />
    </>
  );
}
