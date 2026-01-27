import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeacher, getTeachersList } from "@/hooks/use-teachers";
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch teachers with local params
  const { data, isLoading } = useQuery({
    queryKey: ["teachers-select", search, page],
    queryFn: () =>
      getTeachersList({
        search,
        page,
        limit: 10,
        isBanned: "false", // Only show active teachers for selection
      }),
    placeholderData: (prev) => prev, // Keep previous data while fetching
  });

  const teachers = data?.users || [];
  const metadata = data?.metadata;

  const selectedTeacher = teachers.find((t: any) => t.id === value);

  // If we have a value but it's not in the current list (due to pagination/search),
  // we might want to fetch it or display it. For simplicity, we just display "Teacher Selected"
  // or rely on the parent to provide details if needed, but here we can try to find it.

  // NOTE: If the selected value is not in the current page, we might want to fetch it separately
  // to show the name correctly.

  const { data: specificTeacher } = useQuery({
    queryKey: ["teacher", value],
    queryFn: () => getTeacher(value!),
    enabled: !!value && !selectedTeacher,
  });

  const displayTeacherName =
    selectedTeacher?.name || specificTeacher?.name || "Teacher Selected";

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
            displayTeacherName
          ) : (
            <span className="text-muted-foreground">Select a teacher</span>
          )}
        </ComboboxTrigger>
        <ComboboxContent className="w-full p-0" portal={false}>
          <div className="p-2">
            <ComboboxInput
              placeholder="Search teacher..."
              className="h-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <ComboboxList>
            {isLoading && !data ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : teachers.length === 0 ? (
              <ComboboxEmpty>No teachers found.</ComboboxEmpty>
            ) : (
              <>
                {teachers.map((user: any) => (
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
                        setPage((p) => p - 1);
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
                        setPage((p) => p + 1);
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
