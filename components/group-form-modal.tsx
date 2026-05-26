"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaFilePicker } from "@/components/media-file-picker";
import {
  createSectionGroup,
  updateSectionGroup,
} from "@/lib/groups/service";
import type { DecorationGroupRecord } from "@/lib/groups/types";
import {
  parseGroupPrice,
  validateGroupPrice,
} from "@/lib/groups/validation";

export interface GroupFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  section: string;
  sectionTitle?: string;
  group?: DecorationGroupRecord | null;
  onSaved?: (group: DecorationGroupRecord) => void;
}

type PickedFile = {
  file: File | null;
  previewUrl: string | null;
  /** User cleared an existing remote asset (edit mode). */
  removeExisting: boolean;
};

const emptyPick = (): PickedFile => ({
  file: null,
  previewUrl: null,
  removeExisting: false,
});

function useFilePick() {
  const [pick, setPick] = useState<PickedFile>(emptyPick);

  const setFile = useCallback((file: File | null) => {
    setPick((prev) => {
      if (prev.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      if (!file) {
        const wasRemote = Boolean(
          prev.previewUrl && !prev.previewUrl.startsWith("blob:")
        );
        return {
          file: null,
          previewUrl: null,
          removeExisting: prev.removeExisting || wasRemote,
        };
      }
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        removeExisting: false,
      };
    });
  }, []);

  const setRemotePreview = useCallback((url: string | null) => {
    setPick((prev) => {
      if (prev.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return url
        ? { file: null, previewUrl: url, removeExisting: false }
        : emptyPick();
    });
  }, []);

  const reset = useCallback(() => {
    setPick((prev) => {
      if (prev.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return emptyPick();
    });
  }, []);

  return { ...pick, setFile, setRemotePreview, reset };
}

export function GroupFormModal({
  open,
  onOpenChange,
  mode,
  section,
  sectionTitle,
  group,
  onSaved,
}: GroupFormModalProps) {
  const isEdit = mode === "edit";

  const [groupName, setGroupName] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(
    null
  );

  const frontImage = useFilePick();
  const insideImage1 = useFilePick();
  const insideImage2 = useFilePick();
  const video = useFilePick();

  useEffect(() => {
    if (!open) return;

    if (isEdit && group) {
      setGroupName(group.name);
      setPrice(
        group.price != null && Number.isFinite(group.price)
          ? String(group.price)
          : ""
      );
      frontImage.setRemotePreview(group.frontPreviewUrl);
      insideImage1.setRemotePreview(group.inside1PreviewUrl);
      insideImage2.setRemotePreview(group.inside2PreviewUrl || null);
      video.setRemotePreview(group.videoPreviewUrl || null);
    } else if (!isEdit) {
      setGroupName("");
      setPrice("");
      frontImage.reset();
      insideImage1.reset();
      insideImage2.reset();
      video.reset();
    }
    setError(null);
    setProgress(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when dialog opens
  }, [open, isEdit, group?.id]);

  const hasRequiredMedia =
    Boolean(frontImage.previewUrl) && Boolean(insideImage1.previewUrl);

  const canSubmit =
    !submitting &&
    groupName.trim().length > 0 &&
    (isEdit
      ? hasRequiredMedia
      : hasRequiredMedia && Boolean(frontImage.file) && Boolean(insideImage1.file));

  function resetForm() {
    setGroupName("");
    setPrice("");
    setError(null);
    setProgress(null);
    frontImage.reset();
    insideImage1.reset();
    insideImage2.reset();
    video.reset();
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    if (!next) resetForm();
    onOpenChange(next);
  }

  function resolvePrice(): number | null | "invalid" {
    const trimmed = price.trim();
    if (!trimmed) return null;
    const parsed = parseGroupPrice(trimmed);
    return parsed === null ? "invalid" : parsed;
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    const priceValidation = validateGroupPrice(price);
    if (priceValidation) {
      setError(priceValidation);
      return;
    }

    const resolvedPrice = resolvePrice();
    if (resolvedPrice === "invalid") {
      setError("Enter a valid price or leave it blank.");
      return;
    }

    setSubmitting(true);
    setError(null);

    if (isEdit && group) {
      const slotsToUpload = [
        frontImage.file,
        insideImage1.file,
        insideImage2.file,
        video.file,
      ].filter(Boolean).length;

      if (slotsToUpload > 0) {
        setProgress({ current: 0, total: slotsToUpload });
      }

      const removeSlots: ("inside-2" | "video")[] = [];
      if (insideImage2.removeExisting) removeSlots.push("inside-2");
      if (video.removeExisting) removeSlots.push("video");

      const { group: updated, error: updateError } = await updateSectionGroup(
        {
          id: group.id,
          name: groupName.trim(),
          price: resolvedPrice,
          front: frontImage.file ?? undefined,
          inside1: insideImage1.file ?? undefined,
          inside2: insideImage2.file ?? undefined,
          video: video.file ?? undefined,
          removeSlots: removeSlots.length > 0 ? removeSlots : undefined,
        },
        (current, total) => setProgress({ current, total })
      );

      setSubmitting(false);
      setProgress(null);

      if (updateError || !updated) {
        setError(updateError ?? "Could not update group.");
        return;
      }

      onSaved?.(updated);
      handleOpenChange(false);
      return;
    }

    if (!frontImage.file || !insideImage1.file) {
      setSubmitting(false);
      setError("Front cover and Inside 1 are required.");
      return;
    }

    const uploadCount =
      2 + (insideImage2.file ? 1 : 0) + (video.file ? 1 : 0);
    setProgress({ current: 0, total: uploadCount });

    const { group: created, error: createError } = await createSectionGroup(
      {
        section,
        name: groupName.trim(),
        price: resolvedPrice,
        front: frontImage.file,
        inside1: insideImage1.file,
        inside2: insideImage2.file ?? undefined,
        video: video.file ?? undefined,
      },
      (current, total) => setProgress({ current, total })
    );

    setSubmitting(false);
    setProgress(null);

    if (createError || !created) {
      setError(createError ?? "Could not create group.");
      return;
    }

    onSaved?.(created);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-3 overflow-hidden rounded-2xl p-4 sm:max-w-xl">
        <DialogHeader className="gap-1 space-y-0 pr-8">
          <DialogTitle className="font-serif text-lg leading-tight">
            {isEdit ? "Edit group" : "Create group"}
          </DialogTitle>
          {sectionTitle && (
            <p className="text-xs text-muted-foreground">{sectionTitle}</p>
          )}
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="group-name" className="shrink-0 text-xs">
                Name
              </Label>
              <Input
                id="group-name"
                placeholder="Marigold Paradise"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-8 rounded-lg text-sm"
                disabled={submitting}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="group-price" className="shrink-0 text-xs">
                Price
              </Label>
              <Input
                id="group-price"
                type="number"
                min={0}
                step={1}
                placeholder="Optional"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-8 rounded-lg text-sm"
                disabled={submitting}
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Price in Rs (optional) · Front & Inside 1 required · Inside 2 & video
            optional
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MediaFilePicker
              className="col-span-2 sm:col-span-1"
              label="Front"
              description="Cover"
              size="sm"
              file={frontImage.file}
              previewUrl={frontImage.previewUrl}
              onFileChange={frontImage.setFile}
            />
            <MediaFilePicker
              label="Inside 1"
              size="sm"
              file={insideImage1.file}
              previewUrl={insideImage1.previewUrl}
              onFileChange={insideImage1.setFile}
            />
            <MediaFilePicker
              label="Inside 2"
              description="Optional"
              size="sm"
              file={insideImage2.file}
              previewUrl={insideImage2.previewUrl}
              onFileChange={insideImage2.setFile}
            />
            <MediaFilePicker
              className="col-span-2 sm:col-span-1"
              label="Video"
              description="Optional"
              kind="video"
              size="sm"
              file={video.file}
              previewUrl={video.previewUrl}
              onFileChange={video.setFile}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          {submitting && progress && (
            <p className="text-xs text-muted-foreground" role="status">
              Uploading {progress.current} of {progress.total}…
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={submitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-lg"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use GroupFormModal */
export function CreateGroupModal(
  props: Omit<GroupFormModalProps, "mode" | "group"> & {
    onCreated?: (group: DecorationGroupRecord) => void;
  }
) {
  return (
    <GroupFormModal
      {...props}
      mode="create"
      onSaved={props.onCreated}
    />
  );
}
