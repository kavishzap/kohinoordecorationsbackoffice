import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2BucketName, getR2Client } from "@/lib/r2/client";
import { SIGNED_URL_TTL_SECONDS } from "@/lib/groups/constants";

export async function createPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}

export async function createPresignedDownloadUrl(key: string): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}

export async function deleteR2Object(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    })
  );
}

export async function deleteR2Objects(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteR2Object(key)));
}
