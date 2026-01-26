import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface BanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading: boolean;
  teacherName: string;
}

export function BanDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  teacherName,
}: BanDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    await onConfirm(reason);
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-destructive">حظر المعلم</DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من رغبتك في حظر المعلم <strong>{teacherName}</strong>؟
            لن يتمكن من الدخول إلى النظام.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason" className="text-right">
              سبب الحظر
            </Label>
            <Input
              id="reason"
              placeholder="اكتب سبب الحظر هنا..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-right"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:justify-start gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading || !reason.trim()}
              className="flex-1"
            >
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد الحظر
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
