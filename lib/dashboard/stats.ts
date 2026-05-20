import { createClient } from "@/lib/supabase/client";
import { MAX_GALLERY_SLOTS, MAX_VIDEO_LINKS } from "@/lib/dashboard/constants";
import { STORAGE_BUCKET, STORAGE_SECTIONS } from "@/lib/section-images/constants";
import type { StorageSection } from "@/lib/section-images/constants";

const PLACEHOLDER_FILES = new Set([
  ".emptyFolderPlaceholder",
  ".keep",
  ".init",
]);

export type DashboardHeadlineKpis = {
  totalImages: number;
  storageUsedBytes: number;
  gallerySlotsUsed: number;
  gallerySlotsMax: number;
  galleryPercent: number;
  videoLinks: number;
  videoLinksMax: number;
};

function isImageFile(
  name: string | null,
  id: string | null,
  metadata: unknown
): boolean {
  if (!name || PLACEHOLDER_FILES.has(name) || name.endsWith("/")) return false;
  return id != null || metadata != null;
}

function parseSizeBytes(metadata: Record<string, unknown> | undefined): number {
  if (!metadata?.size) return 0;
  const n = Number(metadata.size);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function countSectionImages(
  supabase: ReturnType<typeof createClient>,
  section: StorageSection,
  userId: string
): Promise<{ count: number; bytes: number }> {
  const folder = `${section}/${userId}`;
  const { data: files, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(folder, { limit: 100 });

  if (error || !files?.length) {
    return { count: 0, bytes: 0 };
  }

  let count = 0;
  let bytes = 0;

  for (const file of files) {
    if (!isImageFile(file.name, file.id, file.metadata)) continue;
    count += 1;
    bytes += parseSizeBytes(file.metadata as Record<string, unknown> | undefined);
  }

  return { count, bytes };
}

export async function fetchDashboardHeadlineKpis(): Promise<{
  kpis: DashboardHeadlineKpis | null;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { kpis: null, error: "Sign in to view dashboard stats." };
    }

    let totalImages = 0;
    let storageUsedBytes = 0;

    await Promise.all(
      STORAGE_SECTIONS.map(async (section) => {
        const { count, bytes } = await countSectionImages(
          supabase,
          section,
          user.id
        );
        totalImages += count;
        storageUsedBytes += bytes;
      })
    );

    const { count: videoCount, error: videoError } = await supabase
      .from("kohinoor_videos")
      .select("id", { count: "exact", head: true });

    const videoLinks = videoError ? 0 : (videoCount ?? 0);
    const galleryPercent =
      MAX_GALLERY_SLOTS > 0
        ? Math.round((totalImages / MAX_GALLERY_SLOTS) * 100)
        : 0;

    return {
      kpis: {
        totalImages,
        storageUsedBytes,
        gallerySlotsUsed: totalImages,
        gallerySlotsMax: MAX_GALLERY_SLOTS,
        galleryPercent,
        videoLinks,
        videoLinksMax: MAX_VIDEO_LINKS,
      },
    };
  } catch {
    return {
      kpis: null,
      error: "Could not load dashboard stats. Please refresh the page.",
    };
  }
}

export function getEmptyHeadlineKpis(): DashboardHeadlineKpis {
  return {
    totalImages: 0,
    storageUsedBytes: 0,
    gallerySlotsUsed: 0,
    gallerySlotsMax: MAX_GALLERY_SLOTS,
    galleryPercent: 0,
    videoLinks: 0,
    videoLinksMax: MAX_VIDEO_LINKS,
  };
}
