export type ImageAction = "load" | "upload" | "delete";

const ACTION_LABELS: Record<ImageAction, string> = {
  load: "load images",
  upload: "upload this image",
  delete: "delete this image",
};

export function mapStorageError(
  message: string,
  action: ImageAction = "upload"
): string {
  const lower = message.toLowerCase();
  const actionLabel = ACTION_LABELS[action];

  if (lower.includes("bucket not found") || lower.includes("does not exist")) {
    return "Image storage is not set up yet. Please contact your administrator.";
  }

  if (
    lower.includes("row-level security") ||
    lower.includes("policy") ||
    lower.includes("not authorized") ||
    lower.includes("permission")
  ) {
    return `You do not have permission to ${actionLabel}. Please sign in again or contact your administrator.`;
  }

  if (
    lower.includes("payload too large") ||
    lower.includes("exceeded") ||
    lower.includes("too large")
  ) {
    return "This file is too large. Each image must be 5MB or smaller.";
  }

  if (lower.includes("invalid api key")) {
    return "The app is not configured correctly. Please contact your administrator.";
  }

  if (
    lower.includes("duplicate") ||
    lower.includes("already exists") ||
    lower.includes("resource already exists")
  ) {
    return "This image already exists. Please choose a different file.";
  }

  if (
    lower.includes("jwt") ||
    lower.includes("session") ||
    lower.includes("not authenticated") ||
    lower.includes("auth")
  ) {
    return "Your session has expired. Please sign out, sign in again, and retry.";
  }

  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("failed to fetch") ||
    lower.includes("timeout")
  ) {
    return "Connection problem. Check your internet and try again.";
  }

  if (lower.includes("invalid") && lower.includes("mime")) {
    return "This file type is not allowed. Use JPG, PNG, WebP, or GIF.";
  }

  return `Could not ${actionLabel}. Please try again.`;
}

export function getActionErrorMessage(
  action: ImageAction,
  detail?: string
): string {
  if (detail) return mapStorageError(detail, action);

  switch (action) {
    case "load":
      return "We could not load your images. Please refresh the page or try again later.";
    case "upload":
      return "Upload failed. Please check the file and try again.";
    case "delete":
      return "Delete failed. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
