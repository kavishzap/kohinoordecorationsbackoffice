import { createClient } from "@/lib/supabase/client";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_SECTION_IMAGES,
  STORAGE_BUCKET,
  STORAGE_SECTIONS,
  type StorageSection,
} from "@/lib/section-images/constants";
import { formatUploadDate } from "@/lib/section-images/format";
import {
  getActionErrorMessage,
  mapStorageError,
} from "@/lib/section-images/storage-errors";
import type { SectionImageRecord } from "@/lib/section-images/types";

const PLACEHOLDER_FILES = new Set([
  ".emptyFolderPlaceholder",
  ".keep",
  ".init",
]);

function isStorageSection(section: string): section is StorageSection {
  return STORAGE_SECTIONS.includes(section as StorageSection);
}

function getUserFolder(section: StorageSection, userId: string) {
  return `${section}/${userId}`;
}

function parseSizeBytes(metadata: Record<string, unknown> | undefined): number {
  if (!metadata?.size) return 0;
  const n = Number(metadata.size);
  return Number.isFinite(n) ? n : 0;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Please upload a JPG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Each image must be 10MB or smaller.";
  }
  return null;
}

export async function loadSectionImages(
  section: string
): Promise<{ images: SectionImageRecord[]; error?: string }> {
  if (!isStorageSection(section)) {
    return { images: [], error: "This section is not available." };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        images: [],
        error: "You must be signed in to view images. Please log in and try again.",
      };
    }

    const folder = getUserFolder(section, user.id);
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, {
        limit: MAX_SECTION_IMAGES,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return { images: [], error: mapStorageError(error.message, "load") };
    }

    const imageFiles = (files ?? []).filter(
      (f) =>
        f.name &&
        !PLACEHOLDER_FILES.has(f.name) &&
        !f.name.endsWith("/") &&
        (f.id != null || f.metadata != null)
    );

    const records: SectionImageRecord[] = [];

    for (const file of imageFiles.slice(0, MAX_SECTION_IMAGES)) {
      const storagePath = `${folder}/${file.name}`;
      const { data: signed, error: signError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, 3600);

      if (signError) continue;

      const meta = file.metadata as Record<string, unknown> | undefined;

      records.push({
        id: storagePath,
        title: file.name,
        fileName: file.name,
        sizeBytes: parseSizeBytes(meta),
        uploadDate: formatUploadDate(
          file.created_at ? new Date(file.created_at) : new Date()
        ),
        previewUrl: signed.signedUrl,
        storagePath,
      });
    }

    return { images: records };
  } catch {
    return { images: [], error: getActionErrorMessage("load") };
  }
}

export async function uploadSectionImage(
  section: string,
  file: File,
  currentCount: number
): Promise<{ record?: SectionImageRecord; error?: string }> {
  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  if (!isStorageSection(section)) {
    return { error: "This section is not available." };
  }

  if (currentCount >= MAX_SECTION_IMAGES) {
    return {
      error: `You have reached the limit of ${MAX_SECTION_IMAGES} images. Delete one to add another.`,
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "You must be signed in to upload. Please log in and try again.",
      };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `${getUserFolder(section, user.id)}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
        metadata: {
          originalName: file.name,
          size: String(file.size),
        },
      });

    if (uploadError) {
      return { error: mapStorageError(uploadError.message, "upload") };
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 3600);

    if (signError) {
      return { error: mapStorageError(signError.message, "upload") };
    }

    return {
      record: {
        id: storagePath,
        title: file.name,
        fileName: file.name,
        sizeBytes: file.size,
        uploadDate: formatUploadDate(),
        previewUrl: signed.signedUrl,
        storagePath,
      },
    };
  } catch {
    return { error: getActionErrorMessage("upload") };
  }
}

export async function deleteSectionImage(
  record: SectionImageRecord
): Promise<{ error?: string }> {
  if (!record.storagePath) {
    return { error: "This image could not be found. Refresh the page and try again." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([record.storagePath]);

    if (error) {
      return { error: mapStorageError(error.message, "delete") };
    }

    return {};
  } catch {
    return { error: getActionErrorMessage("delete") };
  }
}
