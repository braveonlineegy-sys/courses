import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, School } from "lucide-react";
import { useUniversity } from "@/hooks/use-university";
import { UniversityDialog } from "./UniversityDialog";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";

export function UniversityItem({ university }: { university: any }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { deleteMutation } = useUniversity();

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md border-muted/60">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg text-primary">
                <School className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {university.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {university.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 px-6 py-3 flex justify-end gap-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <UniversityDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        university={university}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={university.name}
        isLoading={deleteMutation.isPending}
        requireTextConfirm={true}
        onConfirm={() => {
          deleteMutation.mutate(university.id, {
            onSuccess: () => setIsDeleteOpen(false),
          });
        }}
      />
    </>
  );
}
