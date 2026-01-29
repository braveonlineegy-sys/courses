import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { LevelSelect } from "./level-select";

interface BulkLevelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (levelId: string | null) => Promise<void>;
  isLoading: boolean;
  selectedCount: number;
}

export function BulkLevelDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  selectedCount,
}: BulkLevelDialogProps) {
  const [levelId, setLevelId] = useState<string | null>(null);

  const handleConfirm = async () => {
    await onConfirm(levelId);
    setLevelId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>تغيير مستوى الطلاب</DialogTitle>
          <DialogDescription className="text-right">
            سيتم تغيير مستوى {selectedCount} طالب إلى المستوى المحدد أدناه.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <LevelSelect
            value={levelId}
            onChange={setLevelId}
            allowClear={true}
          />
        </div>
        <DialogFooter className="flex-col sm:justify-start gap-2">
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد التغيير
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
