import { useState } from "react";
import { useTeachers } from "@/hooks/use-teachers";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TeacherSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TeacherSelect({ value, onChange, error }: TeacherSelectProps) {
  const { teachersQuery, params, setParams } = useTeachers();
  const teachers = teachersQuery.data?.users || [];
  const metadata = teachersQuery.data?.metadata;
  const isLoading = teachersQuery.isLoading;

  const [open, setOpen] = useState(false);

  const selectedTeacher = teachers.find((t) => t.id === value);

  const handleSearch = (term: string) => {
    setParams((prev) => ({ ...prev, search: term, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (metadata && newPage >= 1 && newPage <= metadata.totalPages) {
      setParams((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Teacher</Label>
      <Combobox
        value={value}
        onValueChange={(val) => {
          onChange(val as string);
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
      >
        <ComboboxTrigger
          className={
            error
              ? "border-destructive w-full justify-between"
              : "w-full justify-between"
          }
        >
          {value ? (
            selectedTeacher ? (
              selectedTeacher.name
            ) : (
              "Teacher Selected"
            )
          ) : (
            <span className="text-muted-foreground">Select a teacher</span>
          )}
        </ComboboxTrigger>
        <ComboboxContent className="w-full p-0">
          <div className="p-2">
            <ComboboxInput
              placeholder="Search teacher..."
              className="h-9"
              value={params.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <ComboboxList>
            {isLoading ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : teachers.length === 0 ? (
              <ComboboxEmpty>No teachers found.</ComboboxEmpty>
            ) : (
              <>
                {teachers.map((user) => (
                  <ComboboxItem key={user.id} value={user.id}>
                    <span>{user.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      ({user.email})
                    </span>
                  </ComboboxItem>
                ))}
                {/* Pagination Controls */}
                {metadata && metadata.totalPages > 1 && (
                  <div className="flex items-center justify-between p-2 border-t mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={metadata.page <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageChange(metadata.page - 1);
                      }}
                      className="h-7 px-2"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" /> Prev
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {metadata.page} / {metadata.totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={metadata.page >= metadata.totalPages}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageChange(metadata.page + 1);
                      }}
                      className="h-7 px-2"
                    >
                      Next <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
