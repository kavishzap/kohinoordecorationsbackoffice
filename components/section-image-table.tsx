"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MAX_SECTION_IMAGES } from "@/lib/section-images/constants";
import { formatFileSize } from "@/lib/section-images/format";
import {
  deleteSectionImage,
  loadSectionImages,
  uploadSectionImage,
} from "@/lib/section-images/service";
import type { SectionImageRecord } from "@/lib/section-images/types";
import { cn } from "@/lib/utils";

interface SectionImageTableProps {
  section: string;
  title: string;
}

type StatusMessage = {
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

function StatusBanner({ status }: { status: StatusMessage }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        status.type === "error" &&
          "border-destructive/20 bg-destructive/10 text-destructive",
        status.type === "success" &&
          "border-primary/20 bg-primary/10 text-foreground",
        status.type === "info" &&
          "border-border bg-muted text-muted-foreground"
      )}
    >
      {status.type === "error" && (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      {status.type === "success" && (
        <CheckCircle2
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          aria-hidden
        />
      )}
      <div>
        <p className="font-medium">{status.title}</p>
        <p className="mt-0.5 opacity-90">{status.message}</p>
      </div>
    </div>
  );
}

export function SectionImageTable({ section, title }: SectionImageTableProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<SectionImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<SectionImageRecord | null>(
    null
  );
  const [imageToDelete, setImageToDelete] = useState<SectionImageRecord | null>(
    null
  );
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const remainingSlots = MAX_SECTION_IMAGES - images.length;
  const canAddMore = remainingSlots > 0;

  const refreshImages = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoading(true);
      const { images: data, error } = await loadSectionImages(section);
      setImages(data);
      if (error && !options?.silent) {
        setStatus({
          type: "error",
          title: "Could not load images",
          message: error,
        });
      }
      if (!options?.silent) setLoading(false);
    },
    [section]
  );

  useEffect(() => {
    refreshImages();
  }, [refreshImages]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    const files = Array.from(fileList).slice(0, remainingSlots);
    if (files.length < fileList.length) {
      setStatus({
        type: "info",
        title: "Some files skipped",
        message: `Only ${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} left. Extra files were not added.`,
      });
    } else {
      setStatus(null);
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    let added = 0;
    let lastError: string | null = null;

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });

      const { error } = await uploadSectionImage(
        section,
        files[i],
        images.length + added
      );

      if (error) {
        lastError = error;
        break;
      }

      added += 1;
    }

    setUploadProgress(null);
    await refreshImages({ silent: true });
    setLoading(false);

    if (lastError) {
      setStatus({
        type: added > 0 ? "info" : "error",
        title: added > 0 ? "Upload partly failed" : "Upload failed",
        message:
          added > 0
            ? `${added} of ${files.length} image(s) uploaded. ${lastError}`
            : lastError,
      });
    } else if (added > 0) {
      setStatus({
        type: "success",
        title: "Upload complete",
        message:
          added === 1
            ? "Your image was uploaded successfully."
            : `All ${added} images were uploaded successfully.`,
      });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function confirmDelete() {
    if (!imageToDelete) return;

    const record = imageToDelete;
    setDeletingId(record.id);
    setDeleteError(null);
    setStatus(null);

    const { error } = await deleteSectionImage(record);

    if (error) {
      setDeleteError(error);
      setDeletingId(null);
      return;
    }

    setImageToDelete(null);
    setDeleteError(null);
    if (previewImage?.id === record.id) {
      setPreviewImage(null);
    }
    await refreshImages({ silent: true });
    setStatus({
      type: "success",
      title: "Image deleted",
      message: "The image was removed successfully.",
    });
    setDeletingId(null);
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {title}
        </h1>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>
              {images.length} / {MAX_SECTION_IMAGES} images
            </span>
          </p>
          <Button
            type="button"
            className="rounded-xl"
            disabled={!canAddMore || uploading || loading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Add"}
          </Button>
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {status && <StatusBanner status={status} />}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        {uploading && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              {uploadProgress
                ? `Uploading image ${uploadProgress.current} of ${uploadProgress.total}…`
                : "Preparing upload…"}
            </p>
            <p className="text-xs text-muted-foreground">
              Please wait, do not close this page
            </p>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 pl-4">#</TableHead>
              <TableHead className="w-24">Preview</TableHead>
              <TableHead className="w-24">Size</TableHead>
              <TableHead className="hidden w-32 sm:table-cell">Uploaded</TableHead>
              <TableHead className="w-40 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Loading images…
                  </p>
                </TableCell>
              </TableRow>
            ) : images.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">No images yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload up to {MAX_SECTION_IMAGES} images (max 5MB each)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 rounded-xl"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {uploading ? "Uploading…" : "Add"}
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              images.map((image, index) => (
                <TableRow key={image.id}>
                  <TableCell className="pl-4 font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted">
                      {image.previewUrl ? (
                        <Image
                          src={image.previewUrl}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {image.sizeBytes > 0
                      ? formatFileSize(image.sizeBytes)
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {image.uploadDate}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setPreviewImage(image)}
                        disabled={!image.previewUrl || uploading}
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setImageToDelete(image)}
                        disabled={uploading || deletingId !== null}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {canAddMore && images.length > 0 && (
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {uploading
                ? "Uploading…"
                : `Add (${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} left)`}
            </button>
          </div>
        )}
      </motion.div>

      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP, GIF · Max {MAX_SECTION_IMAGES} images · 5MB each
      </p>

      <AlertDialog
        open={imageToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setImageToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the image. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Delete failed</p>
                <p className="mt-0.5">{deleteError}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              disabled={deletingId !== null}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={deletingId !== null}
              onClick={() => void confirmDelete()}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={previewImage !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      >
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Image preview</DialogTitle>
          </DialogHeader>
          {previewImage?.previewUrl && (
            <div className="relative mx-auto flex h-[min(70vh,680px)] w-full max-w-full items-center justify-center bg-muted/30 p-4 pt-12">
              <Image
                src={previewImage.previewUrl}
                alt="Image preview"
                width={1200}
                height={800}
                unoptimized
                className="max-h-[min(70vh,680px)] w-auto max-w-full rounded-lg object-contain shadow-sm"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
