import { useQuery } from "@tanstack/react-query";
import { getAllUniversities } from "@/hooks/use-university";
import { getAllColleges } from "@/hooks/use-college";
import { getAllDepartments } from "@/hooks/use-department";
import { getLevels } from "@/hooks/use-level";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StudentFiltersProps {
  universityId?: string;
  collegeId?: string;
  departmentId?: string;
  levelId?: string;
  onFilterChange: (filters: {
    universityId?: string;
    collegeId?: string;
    departmentId?: string;
    levelId?: string;
  }) => void;
}

export function StudentFilters({
  universityId,
  collegeId,
  departmentId,
  levelId,
  onFilterChange,
}: StudentFiltersProps) {
  // Reuse existing fetcher functions from hooks
  const universitiesQuery = useQuery({
    queryKey: ["universities", 1, ""],
    queryFn: () => getAllUniversities(1, ""),
  });

  const collegesQuery = useQuery({
    queryKey: ["colleges", 1, "", universityId],
    queryFn: () => getAllColleges(1, "", universityId!),
    enabled: !!universityId,
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments", collegeId],
    queryFn: () => getAllDepartments(collegeId!),
    enabled: !!collegeId,
  });

  const levelsQuery = useQuery({
    queryKey: ["levels", departmentId],
    queryFn: () => getLevels(departmentId!),
    enabled: !!departmentId,
  });

  const universities = universitiesQuery.data?.data?.items || [];
  const colleges = collegesQuery.data?.data?.items || [];
  const departments = departmentsQuery.data?.data || [];
  const levels = levelsQuery.data?.data || [];

  const handleUniversityChange = (val: string) => {
    if (val === "all") {
      onFilterChange({
        universityId: undefined,
        collegeId: undefined,
        departmentId: undefined,
        levelId: undefined,
      });
    } else {
      onFilterChange({
        universityId: val,
        collegeId: undefined,
        departmentId: undefined,
        levelId: undefined,
      });
    }
  };

  const handleCollegeChange = (val: string) => {
    if (val === "all") {
      onFilterChange({
        universityId,
        collegeId: undefined,
        departmentId: undefined,
        levelId: undefined,
      });
    } else {
      onFilterChange({
        universityId,
        collegeId: val,
        departmentId: undefined,
        levelId: undefined,
      });
    }
  };

  const handleDepartmentChange = (val: string) => {
    if (val === "all") {
      onFilterChange({
        universityId,
        collegeId,
        departmentId: undefined,
        levelId: undefined,
      });
    } else {
      onFilterChange({
        universityId,
        collegeId,
        departmentId: val,
        levelId: undefined,
      });
    }
  };

  const handleLevelChange = (val: string) => {
    if (val === "all") {
      onFilterChange({
        universityId,
        collegeId,
        departmentId,
        levelId: undefined,
      });
    } else {
      onFilterChange({
        universityId,
        collegeId,
        departmentId,
        levelId: val,
      });
    }
  };

  const handleClearAll = () => {
    onFilterChange({
      universityId: undefined,
      collegeId: undefined,
      departmentId: undefined,
      levelId: undefined,
    });
  };

  const hasFilters = universityId || collegeId || departmentId || levelId;

  return (
    <>
      {/* University Filter */}
      <Select
        value={universityId || "all"}
        onValueChange={handleUniversityChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="الجامعة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الجامعات</SelectItem>
          {universities.map((uni: any) => (
            <SelectItem key={uni.id} value={uni.id}>
              {uni.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* College Filter - show only if university selected */}
      {universityId && (
        <Select
          key={universityId}
          value={collegeId || "all"}
          onValueChange={handleCollegeChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="الكلية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الكليات</SelectItem>
            {colleges.map((col: any) => (
              <SelectItem key={col.id} value={col.id}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Department Filter - show only if college selected */}
      {collegeId && (
        <Select
          key={collegeId}
          value={departmentId || "all"}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأقسام</SelectItem>
            {departments.map((dept: any) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Level Filter - show only if department selected */}
      {departmentId && (
        <Select
          key={departmentId}
          value={levelId || "all"}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="السنة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل السنوات</SelectItem>
            {levels.map((level: any) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear All Filters Button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4 ml-1" />
          مسح الفلاتر
        </Button>
      )}
    </>
  );
}
