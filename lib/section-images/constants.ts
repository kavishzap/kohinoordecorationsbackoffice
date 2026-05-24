export const MAX_SECTION_IMAGES = 10;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const STORAGE_BUCKET = "decorations";

/** Must match `decorations_allowed_sections()` in supabase/storage-setup.sql */
import { DECOR_SECTION_SLUGS } from "@/lib/sections/decor-sections";

/** Legacy slug kept for existing R2/DB rows; not in sidebar. */
const LEGACY_STORAGE_SECTIONS = ["stage"] as const;

export const STORAGE_SECTIONS = [
  ...DECOR_SECTION_SLUGS,
  ...LEGACY_STORAGE_SECTIONS,
] as const;

export type StorageSection = (typeof STORAGE_SECTIONS)[number];
