import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface TeacherProfileHeaderProps {
  teacher: any;
}

export function TeacherProfileHeader({ teacher }: TeacherProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-card p-6 rounded-lg border shadow-sm">
      <Avatar className="h-24 w-24 border-2 border-primary/10">
        <AvatarImage src={teacher.image || ""} />
        <AvatarFallback className="text-2xl">
          {teacher.name?.[0] || "T"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2 text-center md:text-right">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <h1 className="text-3xl font-bold">{teacher?.name}</h1>
          {teacher.isBanned ? (
            <Badge variant="destructive">محظور</Badge>
          ) : (
            <Badge variant="secondary">نشط</Badge>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 text-muted-foreground text-sm items-center md:items-start">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span>{teacher.email}</span>
          </div>
          {teacher.phoneNumber && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{teacher.phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              انضم منذ{" "}
              {format(new Date(teacher.createdAt), "dd MMMM yyyy", {
                locale: ar,
              })}
            </span>
          </div>
        </div>
        {teacher.isBanned && (
          <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 text-sm justify-center md:justify-start">
            <ShieldAlert className="h-4 w-4" />
            <span>سبب الحظر: {teacher.banReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}
