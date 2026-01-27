import { cn } from "@/lib/utils";
import {
  CloudUploadIcon,
  ImageIcon,
  Loader2,
  TrashIcon,
  XIcon,
  FileText,
} from "lucide-react";
import { Button } from "../ui/button";

// Hardcoded translations or placeholders since LanguageContext is missing
const t = (key: string) => {
  const map: Record<string, string> = {
    "admin.uploader.drop_files": "Drop files here or",
    "admin.uploader.click_to_upload": "click to upload",
    "admin.uploader.select_file": "Select File",
    "admin.uploader.upload_failed": "Upload failed",
    "admin.uploader.try_again_hint":
      "Please try again later or contact support",
    "admin.uploader.drag_try_again": "Try Again",
    "admin.uploader.video_uploaded": "Video uploaded",
    "admin.uploader.pdf_uploaded": "PDF uploaded",
    "admin.uploader.open_pdf": "Open PDF",
    "admin.uploader.uploading": "Uploading...",
    "admin.uploader.cancel_upload": "Cancel Upload",
  };
  return map[key] || key;
};

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-muted border-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full border border-dashed">
        <CloudUploadIcon
          className={cn(
            "text-muted-foreground size-6",
            isDragActive && "text-primary",
          )}
        />
      </div>
      <p className="text-muted-foreground text-base font-semibold">
        {t("admin.uploader.drop_files")}{" "}
        <span className="text-primary cursor-pointer underline">
          {t("admin.uploader.click_to_upload")}
        </span>
      </p>
      <Button className="mt-4" type="button">
        {t("admin.uploader.select_file")}
      </Button>
    </div>
  );
}

export function RenderErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-destructive/30 mb-4 flex size-12 items-center justify-center rounded-full">
        <ImageIcon className={cn("text-destructive size-6")} />
      </div>
      <p className="text-base font-semibold">
        {t("admin.uploader.upload_failed")}
      </p>
      <p className="text-muted-foreground text-xs">
        {t("admin.uploader.try_again_hint")}
      </p>
      <Button
        type="button"
        variant={"outline"}
        className="text-muted-foreground mt-3 text-xl font-semibold"
        onClick={(e) => {
          e.stopPropagation();
          onRetry?.();
        }}
      >
        {t("admin.uploader.drag_try_again")}
      </Button>
    </div>
  );
}

export function RenderUploadedState({
  previewUrl,
  onRemoveFile,
  isDeleting,
  fileType,
}: {
  previewUrl: string;
  onRemoveFile: () => void;
  isDeleting: boolean;
  fileType: "video" | "image" | "pdf";
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {fileType === "video" ? (
        // Placeholder for video (not used for this task but kept for completeness based on inspiration)
        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
          <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
            <span className="text-primary">Video</span>
          </div>
          <p className="text-foreground text-sm font-medium">
            {t("admin.uploader.video_uploaded")}
          </p>
        </div>
      ) : fileType === "pdf" ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
          <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
            <FileText className="text-primary size-8" />
          </div>
          <p className="text-foreground text-sm font-medium">
            {t("admin.uploader.pdf_uploaded")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(previewUrl, "_blank");
            }}
          >
            {t("admin.uploader.open_pdf")}
          </Button>
        </div>
      ) : (
        <img
          src={previewUrl}
          alt="uploaded file"
          className="max-h-full max-w-full object-contain p-2"
        />
      )}

      <Button
        type="button"
        disabled={isDeleting}
        onClick={(e) => {
          e.stopPropagation();
          onRemoveFile();
        }}
        className="absolute top-2 right-2 z-10"
        variant={"destructive"}
        size={"icon"}
      >
        {isDeleting ? <Loader2 className="animate-spin" /> : <TrashIcon />}
      </Button>
    </div>
  );
}

export function RenderUploadingState({
  progress,
  file,
  onCancel,
}: {
  progress: number;
  file: File;
  onCancel?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <p className="text-foreground text-sm font-medium">{progress}%</p>
      <p className="text-foreground mt-2 text-sm font-medium">
        {t("admin.uploader.uploading")}
      </p>
      <p className="text-muted-foreground mt-1 max-w-xs truncate text-xs">
        {file.name}
      </p>
      {onCancel && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
        >
          <XIcon className="mr-2 size-4" />
          {t("admin.uploader.cancel_upload")}
        </Button>
      )}
    </div>
  );
}
