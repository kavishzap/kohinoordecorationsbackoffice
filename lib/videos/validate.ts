import { VIDEO_URL_MAX_LENGTH } from "@/lib/videos/constants";

export function validateVideoUrl(url: string): string | null {
  const trimmed = url.trim();

  if (!trimmed) {
    return "Please enter a video link.";
  }

  if (trimmed.length > VIDEO_URL_MAX_LENGTH) {
    return "Link is too long. Please use a shorter URL.";
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Link must start with http:// or https://";
    }
  } catch {
    return "Please enter a valid URL (e.g. https://youtube.com/...).";
  }

  return null;
}
