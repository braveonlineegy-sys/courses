import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface LevelSelectProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  error?: string;
  showLabel?: boolean;
  allowClear?: boolean;
}

// Fetch all universities
async function getAllUniversities() {
  const res = await client.api.university.$get({
    query: { page: 1, limit: 100, search: "" },
  });
  if (!res.ok) throw new Error("Failed to fetch universities");
  return res.json();
}

// Fetch colleges by university
async function getColleges(universityId: string) {
  const res = await client.api.college.$get({
    query: { universityId, page: 1, limit: 100, search: "" },
  });
  if (!res.ok) throw new Error("Failed to fetch colleges");
  return res.json();
}

// Fetch departments by college
async function getDepartments(collegeId: string) {
  const res = await client.api.department.$get({
    query: { collegeId },
  });
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

// Fetch levels by department
async function getLevels(departmentId: string) {
  const res = await client.api.level.$get({
    query: { departmentId },
  });
  if (!res.ok) throw new Error("Failed to fetch levels");
  return res.json();
}

export function LevelSelect({
  value,
  onChange,
  error,
  showLabel = true,
  allowClear = true,
}: LevelSelectProps) {
  const [universityId, setUniversityId] = useState<string>("");
  const [collegeId, setCollegeId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");

  // Queries
  const universitiesQuery = useQuery({
    queryKey: ["universities-all"],
    queryFn: getAllUniversities,
  });

  const collegesQuery = useQuery({
    queryKey: ["colleges", universityId],
    queryFn: () => getColleges(universityId),
    enabled: !!universityId,
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments", collegeId],
    queryFn: () => getDepartments(collegeId),
    enabled: !!collegeId,
  });

  const levelsQuery = useQuery({
    queryKey: ["levels", departmentId],
    queryFn: () => getLevels(departmentId),
    enabled: !!departmentId,
  });

  const universities = universitiesQuery.data?.data?.items || [];
  const colleges = collegesQuery.data?.data?.items || [];
  const departments = departmentsQuery.data?.data || [];
  const levels = levelsQuery.data?.data || [];

  const handleUniversityChange = (val: string) => {
    setUniversityId(val);
    setCollegeId("");
    setDepartmentId("");
    onChange(null);
  };

  const handleCollegeChange = (val: string) => {
    setCollegeId(val);
    setDepartmentId("");
    onChange(null);
  };

  const handleDepartmentChange = (val: string) => {
    setDepartmentId(val);
    onChange(null);
  };

  const handleLevelChange = (val: string) => {
    if (val === "__clear__") {
      onChange(null);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="space-y-3">
      {/* University */}
      <div className="space-y-1">
        {showLabel && <Label>الجامعة</Label>}
        {universitiesQuery.isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={universityId} onValueChange={handleUniversityChange}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الجامعة" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((uni: any) => (
                <SelectItem key={uni.id} value={uni.id}>
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* College */}
      {universityId && (
        <div className="space-y-1">
          {showLabel && <Label>الكلية</Label>}
          {collegesQuery.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={collegeId} onValueChange={handleCollegeChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الكلية" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((col: any) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Department */}
      {collegeId && (
        <div className="space-y-1">
          {showLabel && <Label>القسم</Label>}
          {departmentsQuery.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={departmentId} onValueChange={handleDepartmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Level */}
      {departmentId && (
        <div className="space-y-1">
          {showLabel && <Label>السنة الدراسية</Label>}
          {levelsQuery.isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={value || ""} onValueChange={handleLevelChange}>
              <SelectTrigger className={error ? "border-destructive" : ""}>
                <SelectValue placeholder="اختر السنة الدراسية" />
              </SelectTrigger>
              <SelectContent>
                {allowClear && (
                  <SelectItem value="__clear__">بدون تحديد</SelectItem>
                )}
                {levels.map((level: any) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
