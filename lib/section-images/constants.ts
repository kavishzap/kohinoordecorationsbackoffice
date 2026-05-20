export const MAX_SECTION_IMAGES = 10;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const STORAGE_BUCKET = "decorations";

/** Must match `decorations_allowed_sections()` in supabase/storage-setup.sql */
export const STORAGE_SECTIONS = [
  "haldi",
  "mehendi",
  "reception",
  "stage",
  "entrance",
  "table-decor",
  "wedding",
] as const;

export type StorageSection = (typeof STORAGE_SECTIONS)[number];
