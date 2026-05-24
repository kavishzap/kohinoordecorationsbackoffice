import { createPresignedDownloadUrl } from "@/lib/r2/storage";
import type { DbDecorationGroup, DecorationGroupRecord } from "@/lib/groups/types";
import { formatUploadDate } from "@/lib/section-images/format";

async function presignOptionalKey(key: string | null): Promise<string> {
  if (!key) return "";
  return createPresignedDownloadUrl(key);
}

export async function dbGroupToRecord(
  row: DbDecorationGroup
): Promise<DecorationGroupRecord> {
  const [frontPreviewUrl, inside1PreviewUrl, inside2PreviewUrl, videoPreviewUrl] =
    await Promise.all([
      createPresignedDownloadUrl(row.front_key),
      createPresignedDownloadUrl(row.inside_1_key),
      presignOptionalKey(row.inside_2_key),
      presignOptionalKey(row.video_key),
    ]);

  return {
    id: row.id,
    section: row.section,
    name: row.name,
    price:
      row.price === null || row.price === undefined
        ? null
        : Number(row.price),
    createdAt: formatUploadDate(new Date(row.created_at)),
    frontPreviewUrl,
    inside1PreviewUrl,
    inside2PreviewUrl,
    videoPreviewUrl,
  };
}
