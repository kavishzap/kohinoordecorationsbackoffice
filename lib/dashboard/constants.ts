import { MAX_SECTION_IMAGES, STORAGE_SECTIONS } from "@/lib/section-images/constants";
import { MAX_VIDEO_LINKS } from "@/lib/videos/constants";

export const GALLERY_SECTION_COUNT = STORAGE_SECTIONS.length;
export const MAX_GALLERY_SLOTS = GALLERY_SECTION_COUNT * MAX_SECTION_IMAGES;
export const MAX_GALLERY_STORAGE_BYTES =
  GALLERY_SECTION_COUNT * MAX_SECTION_IMAGES * 10 * 1024 * 1024;

export { MAX_VIDEO_LINKS };
