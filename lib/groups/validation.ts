import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "@/lib/groups/constants";

export function extensionFromMime(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return map[contentType] ?? "bin";
}

export function extensionFromFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  return extensionFromMime(file.type);
}

export function validateGroupImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Images must be JPG, PNG, WebP, or GIF.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Each image must be 10MB or smaller.";
  }
  return null;
}

export function parseGroupPrice(input: string): number | null {
  const trimmed = input.trim().replace(/,/g, "");
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  if (value > 99_999_999.99) return null;
  return Math.round(value * 100) / 100;
}

export function validateGroupPrice(input: string): string | null {
  if (!input.trim()) return null;
  if (parseGroupPrice(input) === null) {
    return "Enter a valid price (0 or greater), or leave blank.";
  }
  return null;
}

export function parseOptionalGroupPrice(
  input: string | number | null | undefined
): number | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (typeof input === "number") {
    if (!Number.isFinite(input) || input < 0) return undefined;
    return Math.round(input * 100) / 100;
  }
  const trimmed = input.trim();
  if (!trimmed) return null;
  return parseGroupPrice(trimmed) ?? undefined;
}

export function validateGroupVideoFile(file: File): string | null {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type as (typeof ACCEPTED_VIDEO_TYPES)[number])) {
    return "Video must be MP4, WebM, or MOV.";
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return "Video must be 300MB or smaller.";
  }
  return null;
}
