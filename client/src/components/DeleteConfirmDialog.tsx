import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  itemName?: string;
  requireTextConfirm?: boolean;
  title?: string;
  description?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  itemName,
  requireTextConfirm = false,
  title,
  description,
}: DeleteConfirmProps) {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!isOpen) setConfirmText("");
  }, [isOpen]);

  const isConfirmDisabled =
    isLoading || (requireTextConfirm && confirmText !== "تأكيد");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={title ? "" : "text-right"}>
        <DialogHeader>
          <DialogTitle
            className={
              title ? "text-destructive" : "text-destructive text-right"
            }
          >
            {title || "تحذير: حذف نهائي!"}
          </DialogTitle>
          <DialogDescription className={description ? "" : "text-right"}>
            {description ? (
              description
            ) : (
              <>
                أنت على وشك حذف **({itemName})**.
                {requireTextConfirm ? (
                  <>
                    <br />
                    سيؤدي هذا لحذف كل البيانات المتعلقة بها نهائياً.
                    <br />
                    اكتب كلمة{" "}
                    <span className="font-bold text-red-600">تأكيد</span>{" "}
                    للتأكيد.
                  </>
                ) : (
                  <br />
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {requireTextConfirm && (
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="تأكيد"
            className="text-center"
          />
        )}

        <DialogFooter className="flex gap-2 sm:justify-start">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            disabled={isConfirmDisabled}
            onClick={onConfirm}
          >
            {isLoading ? "جاري الحذف..." : "تأكيد الحذف"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
