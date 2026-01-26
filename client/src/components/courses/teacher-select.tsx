import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TeacherSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TeacherSelect({ value, onChange, error }: TeacherSelectProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await client.api.admin.teachers.$get();
      const json = await response.json();
      return json.data?.users;
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Label>Teacher</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="Select a teacher" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="p-2 text-sm text-balance">Loading...</div>
          ) : (
            data?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name ? `${user.name} (${user.email})` : user.email}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
