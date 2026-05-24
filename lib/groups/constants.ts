export {
  STORAGE_SECTIONS,
  type StorageSection,
} from "@/lib/section-images/constants";

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 300 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const GROUP_MEDIA_SLOTS = [
  "front",
  "inside-1",
  "inside-2",
  "video",
] as const;

export type GroupMediaSlot = (typeof GROUP_MEDIA_SLOTS)[number];

/** Required when creating a group */
export const GROUP_REQUIRED_MEDIA_SLOTS = ["front", "inside-1"] as const;

/** Optional on create and edit */
export const GROUP_OPTIONAL_MEDIA_SLOTS = ["inside-2", "video"] as const;

export const SIGNED_URL_TTL_SECONDS = 3600;
