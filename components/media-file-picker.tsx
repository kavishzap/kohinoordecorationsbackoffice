"use client";

import { useId, useRef } from "react";
import Image from "next/image";
import { Film, ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type MediaFilePickerKind = "image" | "video";
type MediaFilePickerSize = "sm" | "md";

interface MediaFilePickerProps {
  id?: string;
  label: string;
  description?: string;
  kind?: MediaFilePickerKind;
  accept?: string;
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  className?: string;
  size?: MediaFilePickerSize;
  hideLabel?: boolean;
}

const DEFAULT_ACCEPT: Record<MediaFilePickerKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  video: "video/mp4,video/webm,video/quicktime",
};

const SIZE_CLASS: Record<MediaFilePickerSize, string> = {
  sm: "h-[72px]",
  md: "h-[88px]",
};

export function MediaFilePicker({
  id: idProp,
  label,
  description,
  kind = "image",
  accept,
  file,
  previewUrl,
  onFileChange,
  className,
  size = "md",
  hideLabel = false,
}: MediaFilePickerProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const heightClass = SIZE_CLASS[size];

  function handleSelect(selected: File | null) {
    onFileChange(selected);
    if (inputRef.current) inputRef.current.value = "";
  }

  const Icon = kind === "video" ? Film : ImageIcon;

  return (
    <div className={cn("space-y-1", className)}>
      {!hideLabel && (
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={inputId} className="text-xs">
            {label}
          </Label>
          {description && (
            <span className="truncate text-[10px] text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      )}

      {previewUrl ? (
        <div
          className={cn(
            "group relative overflow-hidden rounded-lg border border-border bg-muted/30",
            heightClass
          )}
        >
          {kind === "image" ? (
            <Image
              src={previewUrl}
              alt={file?.name ?? "Selected preview"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <video
              src={previewUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
          )}
          <div className="absolute inset-0 flex items-center justify-end gap-1 bg-black/40 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 rounded-md px-2 text-[10px]"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 w-7 rounded-md p-0"
              aria-label={`Remove ${label}`}
              onClick={() => handleSelect(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-2 text-center transition-colors hover:border-primary/50 hover:bg-muted/40",
            heightClass
          )}
        >
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground">
            {kind === "video" ? "Select video" : "Select image"}
          </span>
          <Upload className="h-3 w-3 text-muted-foreground" />
        </button>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept ?? DEFAULT_ACCEPT[kind]}
        className="sr-only"
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
