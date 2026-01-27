import { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import {
  RenderEmptyState,
  RenderErrorState,
  RenderUploadedState,
  RenderUploadingState,
} from "./render-state";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string; // Preview URL (Blob or Remote)
  fileType: "image" | "pdf";
}

interface IProps {
  value?: string | File; // Accept File or string (remote URL)
  onChange?: (value: File | undefined) => void; // Pass File up, or undefined if removed
  fileTypeAccepted: "image" | "pdf";
}

function Uploader({ value, onChange, fileTypeAccepted }: IProps) {
  // Determine initial objectUrl from value
  const initialObjectUrl =
    value instanceof File
      ? URL.createObjectURL(value)
      : typeof value === "string"
        ? value
        : undefined;

  const [fileState, setFileState] = useState<UploaderState>({
    id: null,
    file: value instanceof File ? value : null,
    uploading: false, // We rely on parent form submission for actual upload
    progress: 0,
    isDeleting: false,
    error: false,
    fileType: fileTypeAccepted,
    objectUrl: initialObjectUrl,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  // Sync value prop with state (handle external resets or initial load)
  useEffect(() => {
    if (value === undefined || value === null || value === "") {
      setFileState((prev) => {
        if (prev.objectUrl && prev.objectUrl !== initialObjectUrl) {
          // Clean up ? URL.revokeObjectURL(prev.objectUrl);
        }
        return {
          ...prev,
          file: null,
          objectUrl: undefined,
          id: null,
        };
      });
    } else if (value instanceof File) {
      // Should ideally check if it's a new file to avoid loop if objectUrl creation is needed
      // But usually we just trust the internal state unless prop changes drastically
    } else if (typeof value === "string" && value !== fileState.objectUrl) {
      setFileState((prev) => ({ ...prev, objectUrl: value, file: null }));
    }
  }, [value, initialObjectUrl, fileState.objectUrl]);

  // onDrop is a callback function that is called when a file is dropped
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Revoke old object URL
        if (fileState.objectUrl && fileState.objectUrl.startsWith("blob:")) {
          URL.revokeObjectURL(fileState.objectUrl);
        }

        const objectUrl = URL.createObjectURL(file);

        setFileState({
          file,
          uploading: false,
          progress: 100, // Instant success for selection
          error: false,
          objectUrl: objectUrl,
          id: uuidv4(),
          isDeleting: false,
          fileType: fileTypeAccepted,
        });

        // Use setTimeout to allow state update before notifying parent, or just direct
        onChange?.(file);
      }
    },
    [fileState.objectUrl, fileTypeAccepted, onChange],
  );

  // Remove file - Trigger Dialog
  const handleRemoveFile = async () => {
    setConfirmOpen(true);
  };

  // Actual Delete Action
  const confirmDelete = () => {
    // Only client side removal for now
    if (fileState.objectUrl && fileState.objectUrl.startsWith("blob:")) {
      URL.revokeObjectURL(fileState.objectUrl);
    }

    setFileState((prev) => ({
      ...prev,
      file: null,
      objectUrl: undefined,
      id: null,
      isDeleting: false,
      error: false,
    }));

    onChange?.(undefined);
    setConfirmOpen(false);
    toast.info("File removed");
  };

  // Handle rejected files
  function rejectedFiles(fileRejection: FileRejection[]) {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files",
      );
      if (tooManyFiles) {
        toast.error("Only one file is allowed");
        return;
      }

      const fileSize = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-too-large",
      );
      if (fileSize) {
        const limit =
          fileTypeAccepted === "image"
            ? "5MB"
            : fileTypeAccepted === "pdf"
              ? "50MB"
              : "5GB";
        toast.error("File size exceeds limit of " + limit);
        return;
      }

      const fileType = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-invalid-type",
      );
      if (fileType) {
        const typeName = fileTypeAccepted === "image" ? "an image" : "a PDF";

        toast.error("File must be " + typeName);
        return;
      }
    }
  }

  // Render content
  function renderContent() {
    if (fileState.uploading) {
      return (
        <RenderUploadingState
          progress={fileState.progress}
          file={fileState.file!}
          onCancel={() => {}}
        />
      );
    }
    if (fileState.error) {
      return (
        <RenderErrorState
          onRetry={() => setFileState((prev) => ({ ...prev, error: false }))}
        />
      );
    }

    if (fileState.objectUrl) {
      return (
        <RenderUploadedState
          previewUrl={fileState.objectUrl}
          onRemoveFile={handleRemoveFile}
          isDeleting={fileState.isDeleting}
          fileType={fileTypeAccepted}
        />
      );
    }

    return <RenderEmptyState isDragActive={isDragActive} />;
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      fileTypeAccepted === "pdf"
        ? { "application/pdf": [] }
        : { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize:
      fileTypeAccepted === "image"
        ? 1024 * 1024 * 5 // image 5mb
        : 1024 * 1024 * 100, // pdf 100mb
    onDropRejected: (files: FileRejection[]) => rejectedFiles(files),
    disabled:
      fileState.uploading ||
      fileState.isDeleting ||
      (!!fileState.objectUrl && !fileState.error),
  });

  return (
    <>
      <Card
        {...getRootProps()}
        className={cn(
          "relative h-64 w-full border-2 border-dashed transition-colors duration-200 ease-in-out",
          isDragActive
            ? "border-primary bg-primary/10 border-solid"
            : "border-border hover:border-primary",
        )}
      >
        <CardContent className="flex h-full w-full flex-col items-center justify-center p-4">
          <input {...getInputProps()} />
          {renderContent()}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        isLoading={false}
        title="حذف الملف"
        description="هل أنت متأكد من حذف هذا الملف؟"
        requireTextConfirm={false}
      />
    </>
  );
}

export default Uploader;
