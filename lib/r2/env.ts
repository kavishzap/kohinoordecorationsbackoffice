export function getR2Env() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    (accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : undefined);

  const isConfigured = Boolean(
    accessKeyId && secretAccessKey && bucketName && endpoint
  );

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    isConfigured,
  };
}
