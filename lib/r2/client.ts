import { S3Client } from "@aws-sdk/client-s3";
import { getR2Env } from "@/lib/r2/env";

export function getR2Client(): S3Client {
  const { accessKeyId, secretAccessKey, endpoint, isConfigured } = getR2Env();

  if (!isConfigured || !accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("R2 is not configured. Add R2_* variables to .env.local.");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getR2BucketName(): string {
  const { bucketName, isConfigured } = getR2Env();
  if (!isConfigured || !bucketName) {
    throw new Error("R2 bucket is not configured.");
  }
  return bucketName;
}
