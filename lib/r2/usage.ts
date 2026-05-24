import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { STORAGE_SECTIONS } from "@/lib/section-images/constants";
import { getR2Client, getR2BucketName } from "@/lib/r2/client";
import { getR2Env } from "@/lib/r2/env";

async function listPrefixBytes(prefix: string): Promise<number> {
  const client = getR2Client();
  const bucket = getR2BucketName();
  let total = 0;
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const object of response.Contents ?? []) {
      total += object.Size ?? 0;
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return total;
}

export async function getUserR2StorageBytes(userId: string): Promise<number> {
  if (!getR2Env().isConfigured) {
    return 0;
  }

  let total = 0;

  await Promise.all(
    STORAGE_SECTIONS.map(async (section) => {
      const bytes = await listPrefixBytes(
        `decorations/${section}/${userId}/`
      );
      total += bytes;
    })
  );

  return total;
}
