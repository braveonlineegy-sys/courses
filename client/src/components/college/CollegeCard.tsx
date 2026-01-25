import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, BookOpen } from "lucide-react";
import { useCollege } from "@/hooks/use-college";
import { CollegeDialog } from "./CollegeDialog";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";

export function CollegeCard({ college }: { college: any }) {
  const params = useParams({ from: "/admin/universities/$universityId/" });
  const universityId = (params as any).universityId; // Safety cast

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // We pass universityId to useCollege to get the deleteMutation correctly bound if needed
  // although mutation doesn't strictly depend on it for deleting by ID.
  const { deleteMutation } = useCollege(1, "", universityId);

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md border-muted/60 group cursor-pointer relative">
        {/* Adjust the link to wherever departments are listed */}
        <Link
          to="/admin/universities/$universityId/colleges/$collegeId"
          params={{ universityId, collegeId: college.id }}
          className="absolute inset-0 z-0"
        />

        <CardContent className="p-6 relative z-10 pointer-events-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary-foreground group-hover:bg-secondary/20 transition-colors">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {college.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {college.university?.name}
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

      <CollegeDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        college={college}
        universityId={universityId}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={college.name}
        isLoading={deleteMutation.isPending}
        requireTextConfirm={true}
        onConfirm={() => {
          deleteMutation.mutate(college.id, {
            onSuccess: () => setIsDeleteOpen(false),
          });
        }}
      />
    </>
  );
}
