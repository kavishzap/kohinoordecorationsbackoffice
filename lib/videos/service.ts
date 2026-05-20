import { createClient } from "@/lib/supabase/client";
import { MAX_VIDEO_LINKS } from "@/lib/videos/constants";
import type { KohinoorVideo } from "@/lib/videos/types";
import { validateVideoUrl } from "@/lib/videos/validate";

function mapDbError(message: string, action: "load" | "add" | "delete"): string {
  const lower = message.toLowerCase();

  if (lower.includes("maximum of 10")) {
    return "You have reached the limit of 10 video links. Remove one to add another.";
  }

  if (
    lower.includes("row-level security") ||
    lower.includes("policy") ||
    lower.includes("permission")
  ) {
    return `You do not have permission to ${action === "load" ? "view" : action} video links.`;
  }

  if (
    lower.includes("relation") &&
    lower.includes("does not exist") &&
    lower.includes("kohinoor_videos")
  ) {
    return "Video table is not set up yet. Run supabase/kohinoor-videos.sql in the SQL Editor.";
  }

  if (lower.includes("jwt") || lower.includes("session")) {
    return "Your session has expired. Please sign in again.";
  }

  if (lower.includes("fetch") || lower.includes("network")) {
    return "Connection problem. Check your internet and try again.";
  }

  switch (action) {
    case "load":
      return "We could not load video links. Please refresh and try again.";
    case "add":
      return "Could not save this link. Please check the URL and try again.";
    case "delete":
      return "Could not remove this link. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function loadVideoLinks(): Promise<{
  videos: KohinoorVideo[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        videos: [],
        error: "You must be signed in to view video links.",
      };
    }

    const { data, error } = await supabase
      .from("kohinoor_videos")
      .select("id, video_url, sort_order, created_at, updated_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(MAX_VIDEO_LINKS);

    if (error) {
      return { videos: [], error: mapDbError(error.message, "load") };
    }

    return { videos: (data ?? []) as KohinoorVideo[] };
  } catch {
    return { videos: [], error: mapDbError("", "load") };
  }
}

export async function addVideoLink(
  url: string,
  currentCount: number
): Promise<{ video?: KohinoorVideo; error?: string }> {
  const validationError = validateVideoUrl(url);
  if (validationError) return { error: validationError };

  if (currentCount >= MAX_VIDEO_LINKS) {
    return {
      error: `You can only add up to ${MAX_VIDEO_LINKS} video links.`,
    };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be signed in to add video links." };
    }

    const { data, error } = await supabase
      .from("kohinoor_videos")
      .insert({
        video_url: url.trim(),
        sort_order: currentCount + 1,
        created_by: user.id,
      })
      .select("id, video_url, sort_order, created_at, updated_at")
      .single();

    if (error) {
      return { error: mapDbError(error.message, "add") };
    }

    return { video: data as KohinoorVideo };
  } catch {
    return { error: mapDbError("", "add") };
  }
}

export async function deleteVideoLink(
  id: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("kohinoor_videos").delete().eq("id", id);

    if (error) {
      return { error: mapDbError(error.message, "delete") };
    }

    return {};
  } catch {
    return { error: mapDbError("", "delete") };
  }
}
